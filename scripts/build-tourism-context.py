#!/usr/bin/env python3
"""Offline ISTAT workbook -> review candidate. Standard library only; never publishes."""
import argparse, datetime, hashlib, json, re, zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
SOURCE='https://esploradati.istat.it/databrowser/DWL/Servizi/DCSC_Occupancy_in_collective_accommodation.zip'
def rows(path):
    with zipfile.ZipFile(path) as z:
        strings=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            strings=[''.join(t.itertext()) for t in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si',NS)]
        wb=ET.fromstring(z.read('xl/workbook.xml'))
        rels={r.attrib['Id']:r.attrib['Target'] for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
        result={}
        for sheet in wb.findall('m:sheets/m:sheet',NS):
            name=sheet.attrib['name']
            if name not in ('Comunali annuali | Annual data','Comunali Mensili | Monthly data'): continue
            target=rels[sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]
            target=target.lstrip('/') if target.startswith('/') else 'xl/'+target
            output=[]
            for _,row in ET.iterparse(z.open(target),events=('end',)):
                if row.tag!='{'+NS['m']+'}row':continue
                values={}
                for c in row.findall('m:c',NS):
                    col=0
                    for char in re.match(r'[A-Z]+',c.attrib['r'])[0]:col=col*26+ord(char)-64
                    v=c.find('m:v',NS); value=v.text if v is not None else None
                    if c.attrib.get('t')=='s' and value is not None:value=strings[int(value)]
                    elif c.attrib.get('t')=='inlineStr':value=''.join(c.find('m:is',NS).itertext())
                    elif value is not None:
                        try:value=int(value)
                        except ValueError:pass
                    values[col-1]=value
                output.append({'row':int(row.attrib['r']),'values':[values.get(i) for i in range(35)]})
                row.clear()
            result[name]=output
        return result

def build(extracted,capitals,year,acquired,workbook_hash):
    annual=extracted['Comunali annuali | Annual data'];monthly=extracted['Comunali Mensili | Monthly data'];records=[]
    for c in capitals:
        source_code='092009' if c['key']=='cagliari' else c['istat']
        a=[r for r in annual if r['values'][0]==year and r['values'][6]==source_code]
        m=[r for r in monthly if r['values'][0]==year and r['values'][6]==source_code]
        if len(a)!=1 or len(m)!=1:raise ValueError('Missing/duplicate municipality: '+c['key'])
        av,mv=a[0]['values'],m[0]['values']
        vals=av[8:26]+mv[8:34]
        if any(type(v)!=int or v<0 for v in vals):raise ValueError('Missing, suppressed or noninteger value: '+c['key'])
        if av[7]!='(f)' or mv[7]!='(f)' or year!=2025:raise ValueError('Methodology requires review for this year/flag')
        if sum(mv[8:20])!=av[10] or mv[32]!=av[10] or sum(mv[20:32])!=av[19] or mv[33]!=av[19]:raise ValueError('Monthly reconciliation failed')
        for start in (8,11,14,17,20,23):
            if av[start]+av[start+1]!=av[start+2]:raise ValueError('Resident reconciliation failed')
        if av[13]+av[16]!=av[10] or av[22]+av[25]!=av[19]:raise ValueError('Type reconciliation failed')
        records.append({'istat':c['istat'],'key':c['key'],'name':c['name'],'sourceIstat':source_code,'flag':'f','annualSourceRow':a[0]['row'],'monthlySourceRow':m[0]['row'],'arrivals':av[10],'personNights':av[19],'months':[{'month':i+1,'arrivals':mv[8+i],'personNights':mv[20+i]} for i in range(12)]})
    return {'schemaVersion':1,'year':year,'acquiredAt':acquired,'source':{'provider':'ISTAT','flow':'IT1/DF_BULK_DCSC_OCCUPCOLLE/1.0','downloadURL':SOURCE,'workbook':'2_dati_comunali.xlsx','workbookSHA256':workbook_hash,'license':'CC BY 4.0','licenseURL':'https://www.istat.it/dati/open-data/','annualSheet':'Comunali annuali | Annual data','monthlySheet':'Comunali Mensili | Monthly data'},'crosswalk':{'old':'092009','current':'118006','effectiveFrom':'2026-01-01','sourceURL':'https://www.istat.it/wp-content/uploads/2024/09/Codici-statistici-e-denominazioni-delle-unita-amministrative-della-Sardegna.zip'},'records':records}
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('workbook',type=Path);p.add_argument('--year',type=int,default=2025);p.add_argument('--acquired-at',required=True);p.add_argument('--output',type=Path,required=True);args=p.parse_args()
    datetime.date.fromisoformat(args.acquired_at)
    if args.output.exists():p.error('Output must be new: never overwrite a published dataset')
    root=Path(__file__).resolve().parent.parent
    capitals=json.loads((root/'js/regional-capitals.js').read_text().split('Object.freeze(',1)[1].rsplit(');',1)[0])
    data=build(rows(args.workbook),capitals,args.year,args.acquired_at,hashlib.sha256(args.workbook.read_bytes()).hexdigest())
    args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'municipalities':len(data['records']),'year':args.year,'published':False}))
