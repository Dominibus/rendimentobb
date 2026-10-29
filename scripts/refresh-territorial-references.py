#!/usr/bin/env python3
"""Prepare review-only updates for the existing territorial series. Never deploys."""
import argparse,copy,hashlib,importlib.util,json,re,subprocess,tempfile
from datetime import date,datetime,timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,quote
from urllib.request import Request,urlopen

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location('territorial_etl',ROOT/'scripts/build-territorial-references.py')
ETL=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(ETL)
MAX_DOWNLOAD=120*1024*1024
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[]
 def handle_starttag(self,tag,attrs):
  if tag=='a':self.links.extend(v for k,v in attrs if k=='href' and v)
def latest_snapshot(html,current,today):
 """Only exact city path, HTTPS provider, detailed listings and real nonfuture dates."""
 parser=Links();parser.feed(html);old=urlsplit(current['url']);prefix=old.path.rsplit('/',3)[0]+'/'
 found=[]
 for url in parser.links:
  u=urlsplit(url)
  if u.scheme!='https' or u.netloc!='data.insideairbnb.com' or u.query or u.fragment:continue
  m=re.fullmatch(re.escape(prefix)+r'(\d{4}-\d{2}-\d{2})/data/listings\.csv\.gz',u.path)
  if not m:continue
  try:d=date.fromisoformat(m[1])
  except ValueError:continue
  if date.fromisoformat(current['snapshot'])<=d<=today:found.append((m[1],url))
 if not found:raise ValueError('No compatible snapshot listed for '+current['key'])
 return max(found)
def download(url,limit):
 with urlopen(Request(quote(url,safe=':/%'),headers={'User-Agent':'RendimentoBB-source-maintenance/RC203'}),timeout=45) as response:
  # Reject unexpected redirects instead of consuming untrusted provider data.
  if urlsplit(response.url).netloc!=urlsplit(url).netloc:raise ValueError('Unexpected redirect host')
  raw=response.read(limit+1)
  if len(raw)>limit:raise ValueError('Download exceeds size limit')
  return raw

def prepare(config,html,out,today,fetch=download):
 out=Path(out)
 if out.exists() and any(out.iterdir()):raise ValueError('Use an empty output directory')
 out.mkdir(parents=True,exist_ok=True)
 candidate=copy.deepcopy(config);changed=[];checks=[]
 for city in candidate['cities']:
  snapshot,url=latest_snapshot(html,city,today)
  checks.append({'city':city['key'],'currentSnapshot':city['snapshot'],'latestListedSnapshot':snapshot})
  if snapshot>city['snapshot']:
   changed.append(city['key']);city.update(snapshot=snapshot,url=url)
 report={'checkedAt':datetime.now(timezone.utc).isoformat(),'status':'up_to_date','verificationScope':'Provider catalog dates only for unchanged snapshots; raw checksums validated during candidate builds','checks':checks,'updatedCities':changed,'requiresReview':True,'published':False,'reviewWarnings':[]}
 for city in candidate['cities']:
  current=json.loads((ROOT/'data/territorial'/(city['key']+'.json')).read_text())
  age=(today-date.fromisoformat(current['city']['observationEnd'])).days
  if age>180:report['reviewWarnings'].append({'city':city['key'],'reason':'Published observations older than 180 days','ageDays':age})
 if changed:
  # A complete replacement candidate, built atomically in a private temporary directory.
  with tempfile.TemporaryDirectory(prefix='rb-territorial-') as temp:
   temp=Path(temp);cache=temp/'cache';cache.mkdir();stage=temp/'data';stage.mkdir()
   for city in candidate['cities']:
    raw=fetch(city['url'],MAX_DOWNLOAD);digest=hashlib.sha256(raw).hexdigest()
    if city['key'] not in changed and digest!=city['sha256']:raise ValueError('Existing snapshot checksum changed: '+city['key'])
    city['sha256']=digest;(cache/(city['key']+'-listings.csv.gz')).write_bytes(raw)
   cfg=temp/'sources.json';cfg.write_text(json.dumps(candidate,ensure_ascii=False,indent=2)+'\n')
   subprocess.run(['python3',str(ROOT/'scripts/build-territorial-references.py'),'--config',str(cfg),'--cache-dir',str(cache),'--output-dir',str(stage)],check=True)
   for city in candidate['cities']:
    data=json.loads((stage/(city['key']+'.json')).read_text())
    if not data['city']['publishedSegments']:raise ValueError('No publishable segments: '+city['key'])
    if not data['city']['observationEnd'] or date.fromisoformat(data['city']['observationEnd'])>today:raise ValueError('Invalid observation date')
    old=json.loads((ROOT/'data/territorial'/(city['key']+'.json')).read_text())
    if data['city']['observationEnd']<old['city']['observationEnd']:raise ValueError('Observation period regressed')
    old_segments={tuple(r[:6]):r for r in old['rows'] if r[6] is not None}
    shifted=sum(1 for row in data['rows'] if row[6] is not None and tuple(row[:6]) in old_segments and abs(row[8]/old_segments[tuple(row[:6])][8]-1)>0.5)
    if shifted:report['reviewWarnings'].append({'city':city['key'],'reason':'Comparable segment median changed by more than 50 percent','segments':shifted})
    if data['city']['publishedSegments']<old['city']['publishedSegments']/2:report['reviewWarnings'].append({'city':city['key'],'reason':'Published segment coverage fell by more than half'})
   # Reuse the same validator as the public reader; no weaker ingestion schema.
   validator=(ROOT/'js/territorial-benchmarks.js').as_uri()
   code="import fs from 'node:fs';import {validateTerritorialData} from "+json.dumps(validator)+";for(const c of "+json.dumps([c['key'] for c in candidate['cities']])+"){validateTerritorialData(JSON.parse(fs.readFileSync("+json.dumps(str(stage))+"+'/'+c+'.json','utf8')),c)}"
   subprocess.run(['node','--input-type=module','-e',code],check=True)
   import shutil
   dest=out/'candidate';(dest/'data').mkdir(parents=True);shutil.copytree(stage,dest/'data/territorial')
   (dest/'scripts').mkdir();shutil.copyfile(cfg,dest/'scripts/territorial-sources.json')
   report['status']='candidate_ready'
 (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 return report

def main():
 p=argparse.ArgumentParser();p.add_argument('--output-dir',type=Path,required=True);args=p.parse_args()
 if args.output_dir.exists() and any(args.output_dir.iterdir()):p.error('Use an empty output directory')
 try:
  # RC228: website scraping and reuse conditions require separate review.
  # Offline ETL helpers remain available; this entrypoint makes no network call.
  args.output_dir.mkdir(parents=True,exist_ok=True)
  result={'checkedAt':datetime.now(timezone.utc).isoformat(),
   'status':'blocked_provider_policy_review','published':False,'requiresReview':True,
   'remoteAvailabilityChecked':False,'updatedCities':[],
   'reason':'Inside Airbnb acquisition/reuse terms require review; no network request made',
   'policyURL':'https://insideairbnb.com/data-policies/'}
  (args.output_dir/'report.json').write_text(json.dumps(result,indent=2)+'\n')
  print(json.dumps(result))
 except Exception as error:
  args.output_dir.mkdir(parents=True,exist_ok=True)
  # Never leave a partial candidate that could be mistaken for a valid update.
  import shutil
  shutil.rmtree(args.output_dir/'candidate',ignore_errors=True)
  (args.output_dir/'report.json').write_text(json.dumps({'status':'failed','published':False,'error':str(error)},indent=2)+'\n')
  raise
if __name__=='__main__':main()
