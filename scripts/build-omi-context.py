#!/usr/bin/env python3
"""Convert an original OMI national ZIP into an offline review candidate for 20 capitals."""
import argparse,csv,hashlib,io,json,re,zipfile,datetime,math
from decimal import Decimal, InvalidOperation
from pathlib import Path
import xml.etree.ElementTree as ET
IDENTITIES={
'ancona':('11042002','A271','ANCONA'),'aosta':('2007003','A326','AOSTA'),
'bari':('16072006','A662','BARI'),'bologna':('8037006','A944','BOLOGNA'),
'cagliari':('20092009','B354','CAGLIARI'),'campobasso':('14070006','B519','CAMPOBASSO'),
'catanzaro':('18079023','C352','CATANZARO'),'firenze':('9048017','D612','FIRENZE'),
'genova':('7010025','D969','GENOVA'),'l-aquila':('13066049','A345','L`AQUILA'),
'milano':('3015146','F205','MILANO'),'napoli':('15063049','F839','NAPOLI'),
'palermo':('19082053','G273','PALERMO'),'perugia':('10054039','G478','PERUGIA'),
'potenza':('17076063','G942','POTENZA'),'roma':('12058091','H501','ROMA'),
 'torino':('1001272','L219','TORINO'),'trento':('4022205','L378','TRENTO'),
 'trieste':('6032006','L424','TRIESTE'),'venezia':('5027042','L736','VENEZIA')}
SOURCE='https://www.agenziaentrate.gov.it/portale/schede/fabbricatiterreni/omi/forniture-dati-omi-cittadini'
FIELDS=['zone','type','typeLabel','state','prevalent','saleMin','saleMax','saleSurface','rentMin','rentMax','rentSurface','sourceRow']
def pair(low,high,surface):
    low,high,surface=low.strip(),high.strip(),surface.strip()
    if (low,high) in (('',''),('0','0')):return [None,None,surface or None]
    try:a,b=Decimal(low.replace(',','.')),Decimal(high.replace(',','.'))
    except InvalidOperation:raise ValueError('Invalid numeric range')
    if not a.is_finite() or not b.is_finite() or a<=0 or b<a or surface not in ('L','N'):raise ValueError('Invalid numeric range/surface')
    numbers=[float(a),float(b)]
    if not all(math.isfinite(v) for v in numbers):raise ValueError('Numeric range outside supported precision')
    return [*numbers,surface]
def table(archive,filename):
    text=archive.read(filename).decode('utf-8-sig');header,body=text.split('\n',1)
    if not re.search(r'Semestre 2026/1 - elaborazione del 15-OTT-26\s*$',header):raise ValueError('Unreviewed semester or source elaboration date')
    return list(csv.DictReader(io.StringIO(body),delimiter=';'))
def zonekey(r):return '|'.join(r[k].strip() for k in ['Comune_amm','Sez','Zona','LinkZona'])
def build(path,capitals,acquired):
    with zipfile.ZipFile(path) as z:
        names=z.namelist()
        if len(names)!=len(set(names)):raise ValueError('Duplicate archive members')
        if z.testzip():raise ValueError('ZIP CRC failure')
        values=table(z,'QI_20261_VALORI.csv');zones=table(z,'QI_20261_ZONE.csv');files={};counts=[]
        source={'provider':'Agenzia Entrate - OMI','url':SOURCE,'guideURL':'https://telematici.agenziaentrate.gov.it/pdf/guidaFornitureOMI.pdf','legendURL':'https://www1.agenziaentrate.gov.it/servizi/geopoi_omi/legenda.htm','license':'CC BY 4.0','archiveSHA256':hashlib.sha256(Path(path).read_bytes()).hexdigest(),'valuesSHA256':hashlib.sha256(z.read('QI_20261_VALORI.csv')).hexdigest(),'zonesSHA256':hashlib.sha256(z.read('QI_20261_ZONE.csv')).hexdigest(),'elaboratedAt':'2026-10-15','acquiredAt':acquired}
        for c in capitals:
            code,cadastral,name=IDENTITIES[c['key']]
            zr=[(i+3,r) for i,r in enumerate(zones) if r['Comune_ISTAT']==code]
            vr=[(i+3,r) for i,r in enumerate(values) if r['Comune_ISTAT']==code]
            if not zr or not vr:raise ValueError('Missing capital '+c['key'])
            for _,r in zr+vr:
                if r['Comune_amm']!=cadastral or r['Comune_descrizione']!=name or r['Prov']!=c['province']:raise ValueError('Municipality identity mismatch')
            zz={}
            for line,r in zr:
                key=zonekey(r)
                if key in zz:raise ValueError('Duplicate zone')
                zz[key]={'id':key,'code':r['Zona'],'section':r['Sez'].strip(),'description':r['Zona_Descr'].strip().strip("'"),'linkZone':r['LinkZona'],'sourceRow':line}
            rows=[];seen=set()
            for line,r in vr:
                key=zonekey(r);unique=(key,r['Cod_Tip'],r['Stato'])
                if key not in zz or unique in seen:raise ValueError('Missing zone/duplicate quotation')
                seen.add(unique)
                if r['Stato'] not in ('NORMALE','OTTIMO','SCADENTE') or r['Stato_prev'].strip() not in ('P',''):raise ValueError('Unreviewed state flag')
                rows.append([key,r['Cod_Tip'],r['Descr_Tipologia'],r['Stato'],r['Stato_prev'].strip()=='P',*pair(r['Compr_min'],r['Compr_max'],r['Sup_NL_compr']),*pair(r['Loc_min'],r['Loc_max'],r['Sup_NL_loc']),line])
            ns={'k':'http://www.opengis.net/kml/2.2'};kml=ET.fromstring(z.read(cadastral+'.kml'));title=kml.find('k:Document/k:name',ns).text
            if 'Anno/Semestre 2026/1' not in title:raise ValueError('KML semester mismatch')
            polygons=set()
            for pm in kml.findall('.//k:Placemark',ns):
                fields={d.attrib['name']:d.findtext('k:value',default='',namespaces=ns) for d in pm.findall('k:ExtendedData/k:Data',ns)}
                if fields.get('CODCOM')!=cadastral:raise ValueError('KML municipality mismatch')
                polygons.add(fields['CODZONA'])
            missing=sorted(set(v['code'] for v in zz.values())-polygons)
            files[c['key']]={'schemaVersion':1,'period':'2026/1','municipality':{'istat':c['istat'],'name':c['name'],'key':c['key'],'province':c['province'],'sourceIstat':code,'cadastral':cadastral,'sourceName':name},'source':source,'fields':FIELDS,'zones':list(zz.values()),'rows':rows,'geometryCheck':{'kmlSHA256':hashlib.sha256(z.read(cadastral+'.kml')).hexdigest(),'zoneCodesWithoutPerimeter':missing,'displayed':False}}
            counts.append({'key':c['key'],'istat':c['istat'],'zones':len(zz),'quotations':len(rows),'zoneCodesWithoutPerimeter':missing})
        report={'period':'2026/1','nationalSourceRows':len(values),'nationalSourceZones':len(zones),'nationalSourceMunicipalityCodes':len(set(r['Comune_ISTAT'] for r in values)),'kmlFiles':sum(n.lower().endswith('.kml') for n in names),'published':False,'displayScope':'20 regional capitals only; nationwide historical-code crosswalk remains to validate','capitals':counts}
        return files,report
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('archive',type=Path);p.add_argument('--acquired-at',required=True);p.add_argument('--output-dir',type=Path,required=True);args=p.parse_args();datetime.date.fromisoformat(args.acquired_at)
    if args.output_dir.exists():p.error('Use a new review directory; existing data will not be overwritten')
    root=Path(__file__).resolve().parent.parent
    capitals=json.loads((root/'js/regional-capitals.js').read_text().split('Object.freeze(',1)[1].rsplit(');',1)[0])
    files,report=build(args.archive,capitals,args.acquired_at);args.output_dir.mkdir(parents=True)
    for key,data in files.items():(args.output_dir/(key+'.json')).write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
    (args.output_dir/'review-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'capitals':len(files),'quotations':sum(len(d['rows']) for d in files.values()),'published':False}))
