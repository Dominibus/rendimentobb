#!/usr/bin/env python3
"""Offline derivation of non-personal aggregates. No credentials or third-party packages.
Run --download once per selected snapshot; subsequent builds reuse the local source cache.
Raw source files must not be deployed or included in the patch.
"""
import argparse,csv,gzip,hashlib,json,math,re
from collections import Counter,defaultdict
from datetime import date
from decimal import Decimal,InvalidOperation
from pathlib import Path
from urllib.request import urlopen
from urllib.parse import quote

MIN_SAMPLE=10
METHOD='quoted-nightly-subtotal-v1'
def day(v):
 try:return date.fromisoformat(v) if isinstance(v,str) and re.fullmatch(r'\d{4}-\d{2}-\d{2}',v) else None
 except ValueError:return None
def positive(v):
 try:
  n=Decimal(str(v));return n if n.is_finite() and n>0 else None
 except (InvalidOperation,ValueError):return None
def quantile(values,p):
 pos=(len(values)-1)*p;low=math.floor(pos);high=math.ceil(pos)
 return round(values[low]+(values[high]-values[low])*(pos-low),2)
def observe(row):
 # Never infer EUR from a '$' symbol in the legacy export.
 try:q=json.loads(row.get('price_quote_raw') or '{}').get('quote',{})
 except (ValueError,AttributeError):return None,'invalid_quote'
 if not isinstance(q,dict):return None,'invalid_quote'
 if q.get('currency')!='EUR':return None,'currency'
 if q.get('is_available') is not True or q.get('is_monthly_priced') is not False:return None,'not_available_or_monthly'
 start=day(row.get('price_quote_checkin_date'));end=day(row.get('price_quote_checkout_date'));observed=day(row.get('last_scraped'))
 if not start or not end or not observed or not 1<=(end-start).days<=27:return None,'dates_or_duration'
 # A date change in the returned quote must not be silently assigned to the requested month.
 if q.get('returned_checkin_date') not in (None,'',start.isoformat()) or q.get('returned_checkout_date') not in (None,'',end.isoformat()):return None,'different_dates'
 if q.get('requested_checkin_date')!=start.isoformat() or q.get('requested_checkout_date')!=end.isoformat():return None,'different_dates'
 if start<observed or (start-observed).days>366:return None,'date_window'
 subtotal=positive(q.get('nightly_subtotal'))
 if subtotal is None:return None,'missing_nightly_subtotal'
 zone=str(row.get('neighbourhood_cleansed') or '').strip();kind=str(row.get('property_type') or '').strip();room=str(row.get('room_type') or '').strip()
 try:capacity=int(row.get('accommodates',''))
 except (ValueError,TypeError):return None,'capacity'
 if not zone or not kind or room not in ['Entire home/apt','Private room','Shared room','Hotel room'] or not 1<=capacity<=100:return None,'segment'
 nights=(end-start).days;band='1' if nights==1 else '2-3' if nights<=3 else '4-7' if nights<=7 else '8-27'
 return {'segment':(zone,kind,room,capacity,start.isoformat()[:7],band),'value':float(subtotal/Decimal(nights)),'observed':observed.isoformat(),'checkin':start.isoformat(),'checkout':end.isoformat()},None

def aggregate(rows):
 groups=defaultdict(list);excluded=Counter();seen=set();observations=[];total=0
 for row in rows:
  total+=1;identifier=str(row.get('id') or '')
  if not identifier or identifier in seen:excluded['missing_or_duplicate_id']+=1;continue
  seen.add(identifier)
  record,reason=observe(row)
  if reason:excluded[reason]+=1;continue
  groups[record['segment']].append(record);observations.append(record)
 result=[]
 for segment,records in sorted(groups.items()):
  count=len(records);values=sorted(r['value'] for r in records)
  # Sparse segment labels may be explored, but neither exact counts nor price values are published.
  public=count>=MIN_SAMPLE
  result.append([*segment,count if public else None,quantile(values,.25) if public else None,quantile(values,.5) if public else None,quantile(values,.75) if public else None,
   min(r['observed'] for r in records) if public else None,max(r['observed'] for r in records) if public else None,
   min(r['checkin'] for r in records) if public else None,max(r['checkout'] for r in records) if public else None])
 return {'sourceRows':total,'eligibleRows':len(observations),'excluded':dict(sorted(excluded.items())),'segments':len(groups),'publishedSegments':sum(r[6] is not None for r in result),'observationStart':min((r['observed'] for r in observations),default=None),'observationEnd':max((r['observed'] for r in observations),default=None),'rows':result}

def aggregate_city(rows,city):
 selection=city.get('geographyFilter')
 if selection is None:return aggregate(rows)
 if selection!={'field':'neighbourhood_cleansed','equals':city['name'],'kind':'source_municipality'}:raise ValueError('Invalid municipality filter')
 total=0
 def selected():
  nonlocal total
  for row in rows:
   total+=1
   if row.get(selection['field'])==selection['equals']:yield row
 result=aggregate(selected());result['regionalSourceRows']=total
 return result

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--config',type=Path,default=Path(__file__).with_name('territorial-sources.json'));parser.add_argument('--cache-dir',type=Path,required=True);parser.add_argument('--output-dir',type=Path,default=Path('data/territorial'));parser.add_argument('--download',action='store_true');args=parser.parse_args()
 config=json.loads(args.config.read_text());args.cache_dir.mkdir(parents=True,exist_ok=True);args.output_dir.mkdir(parents=True,exist_ok=True)
 catalog={'schemaVersion':1,'methodVersion':METHOD,'minimumSample':MIN_SAMPLE,'provider':config['provider'],'homepage':config['homepage'],'license':config['license'],'methodUrl':config['method'],'measure':'advertised_base_nightly_rate','currency':'EUR','columns':['zone','propertyType','roomType','capacity','stayMonth','stayLength','n','p25','median','p75','observationStart','observationEnd','stayStart','stayEnd'],'cities':[]}
 for city in config['cities']:
  path=args.cache_dir/(city['key']+'-listings.csv.gz')
  if not path.exists():
   if not args.download:raise SystemExit('Missing cached file '+str(path)+'; use --download only for the selected snapshots.')
   path.write_bytes(urlopen(quote(city['url'],safe=':/%'),timeout=60).read())
  actual=hashlib.sha256(path.read_bytes()).hexdigest()
  if actual!=city['sha256']:raise SystemExit('Source checksum mismatch for '+city['key'])
  with gzip.open(path,'rt',encoding='utf-8-sig',newline='') as handle:derived=aggregate_city(csv.DictReader(handle),city)
  info={**city,**{k:v for k,v in derived.items() if k!='rows'}}
  catalog['cities'].append(info)
  output={'schemaVersion':1,'methodVersion':METHOD,'minimumSample':MIN_SAMPLE,'city':info,'rows':derived['rows']}
  (args.output_dir/(city['key']+'.json')).write_text(json.dumps(output,ensure_ascii=False,separators=(',',':'))+'\n')
  print(city['key'],derived['sourceRows'],derived['eligibleRows'],derived['publishedSegments'])
 (args.output_dir/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
if __name__=='__main__':main()
