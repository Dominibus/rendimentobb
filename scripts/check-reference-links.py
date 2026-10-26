#!/usr/bin/env python3
"""Availability only: a reachable page does not validate rates, text or offers."""
import argparse,json
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,urldefrag
from urllib.request import Request,urlopen
from urllib.error import HTTPError
ROOT=Path(__file__).resolve().parents[1]
HOSTS={'www.bancaditalia.it','www.agenziaentrate.gov.it','www1.agenziaentrate.gov.it','www.istat.it','insideairbnb.com','creativecommons.org','www.ecb.europa.eu','data.ecb.europa.eu','www.intesasanpaolo.com','www.unicredit.it','www.bnl.it','www.credit-agricole.it','www.bancobpm.it'}
FILES=['mutui/index.html','academy/mutuo/index.html','market/index.html','market/roma/index.html','market/napoli/index.html','market/milano/index.html','market/firenze/index.html']
class References(HTMLParser):
 def __init__(self):super().__init__();self.urls=set()
 def handle_starttag(self,tag,attrs):
  if tag!='a':return
  for key,value in attrs:
   if key!='href' or not value:continue
   url=urldefrag(value)[0];parts=urlsplit(url)
   if parts.scheme=='https' and parts.netloc in HOSTS and not parts.query:self.urls.add(url)
def references(root=ROOT):
 result={}
 for file in FILES:
  parser=References();parser.feed((root/file).read_text())
  for url in parser.urls:result.setdefault(url,[]).append(file)
 config=json.loads((root/'scripts/territorial-sources.json').read_text())
 for key in ['homepage','license','method']:
  url=config[key]
  if urlsplit(url).netloc in HOSTS:result.setdefault(url,[]).append('scripts/territorial-sources.json')
 return result
def check(url,opener=urlopen):
 try:
  with opener(Request(url,headers={'User-Agent':'RendimentoBB-reference-check/RC203','Range':'bytes=0-1023'}),timeout=12) as r:
   r.read(1024);final=r.url
   return {'url':url,'status':'redirect_review' if final!=url else 'reachable','http':r.status,'finalUrl':final}
 except HTTPError as e:return {'url':url,'status':'unavailable' if e.code in (404,410) else 'unverified','http':e.code}
 except Exception:return {'url':url,'status':'unverified','http':None}
def main():
 p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);a=p.parse_args();refs=references()
 if len(refs)>60:raise SystemExit('Reference count exceeds maintenance limit; review scope')
 with ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(check,sorted(refs)))
 for row in results:row['files']=refs[row['url']]
 report={'checkedAt':datetime.now(timezone.utc).isoformat(),'scope':'Selected existing market and mortgage editorial references; not every external link on the portal','contentVerified':False,'results':results}
 a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print('References checked:',len(results),'requiring review:',sum(r['status']!='reachable' for r in results))
if __name__=='__main__':main()
