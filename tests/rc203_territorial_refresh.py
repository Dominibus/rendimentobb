import copy,gzip,importlib.util,json,tempfile,unittest
from datetime import date
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('refresh',ROOT/'scripts/refresh-territorial-references.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
city={'key':'roma','name':'Roma','snapshot':'2026-09-17','url':'https://data.insideairbnb.com/italy/lazio/rome/2026-09-17/data/listings.csv.gz','sha256':'abc'}
def html(url):return '<a href="'+url+'">listings</a>'
class Refresh(unittest.TestCase):
 def test_same_snapshot(self):self.assertEqual(m.latest_snapshot(html(city['url']),city,date(2026,10,26))[0],'2026-09-17')
 def test_newer(self):self.assertEqual(m.latest_snapshot(html(city['url'].replace('2026-09-17','2026-10-20')),city,date(2026,10,26))[0],'2026-10-20')
 def test_reject_wrong_city_host_scheme_file_dates(self):
  for bad in [city['url'].replace('/rome/','/milan/'),city['url'].replace('https:','http:'),city['url'].replace('data.insideairbnb.com','evil.example'),city['url'].replace('listings.csv.gz','calendar.csv.gz'),city['url'].replace('2026-09-17','2026-02-30'),city['url'].replace('2026-09-17','2026-12-01'),city['url']+'?token=foo']:
   with self.subTest(url=bad),self.assertRaises(ValueError):m.latest_snapshot(html(bad),city,date(2026,10,26))
 def test_reject_downgrade(self):
  with self.assertRaises(ValueError):m.latest_snapshot(html(city['url'].replace('2026-09-17','2025-09-17')),city,date(2026,10,26))
 def test_no_update_no_download(self):
  with tempfile.TemporaryDirectory() as d:
   r=m.prepare({'cities':[city]},html(city['url']),d,date(2026,10,26),fetch=lambda *a:self.fail('Unnecessary download'))
   self.assertEqual(r['status'],'up_to_date');self.assertFalse(r['published']);self.assertFalse((Path(d)/'candidate').exists())
 def test_nonempty_output_rejected(self):
  with tempfile.TemporaryDirectory() as d:
   (Path(d)/'keep').write_text('keep')
   with self.assertRaises(ValueError):m.prepare({'cities':[city]},html(city['url']),d,date(2026,10,26))
 def test_download_failure_never_creates_candidate(self):
  with tempfile.TemporaryDirectory() as d:
   with self.assertRaises(OSError):m.prepare({'cities':[city]},html(city['url'].replace('2026-09-17','2026-10-20')),d,date(2026,10,26),fetch=lambda *a:(_ for _ in ()).throw(OSError('offline')))
   self.assertFalse((Path(d)/'candidate').exists())
 def test_existing_checksum_enforced(self):
  second={**city,'key':'napoli','url':city['url'].replace('/lazio/rome/','/campania/naples/')}
  page=html(city['url'].replace('2026-09-17','2026-10-20'))+html(second['url'])
  with tempfile.TemporaryDirectory() as d:
   with self.assertRaisesRegex(ValueError,'checksum'):m.prepare({'cities':[city,second]},page,d,date(2026,10,26),fetch=lambda *a:b'changed bytes')
   self.assertFalse((Path(d)/'candidate').exists())
 def test_workflow_readonly_no_deploy_or_raw_artifacts(self):
  text=(ROOT/'.github/workflows/territorial-sources.yml').read_text()
  self.assertIn('contents: read',text);self.assertIn('persist-credentials: false',text);self.assertNotIn('contents: write',text)
  for bad in ['git push','vercel deploy','FIREBASE','STRIPE','RESEND']:self.assertNotIn(bad,text)
 def test_real_build_synthetic_data(self):
  import csv,io,shutil
  rows=[]
  for i in range(12):
   q={'currency':'EUR','is_available':True,'is_monthly_priced':False,'nightly_subtotal':str(200+i),'requested_checkin_date':'2026-11-01','requested_checkout_date':'2026-11-03'}
   rows.append({'id':str(i),'last_scraped':'2026-10-20','price_quote_checkin_date':'2026-11-01','price_quote_checkout_date':'2026-11-03','price_quote_raw':json.dumps({'quote':q}),'neighbourhood_cleansed':'Zona test','property_type':'Entire rental unit','room_type':'Entire home/apt','accommodates':'2','host_name':'PRIVATE_RAW_ONLY'})
  buf=io.StringIO();writer=csv.DictWriter(buf,fieldnames=rows[0].keys());writer.writeheader();writer.writerows(rows);raw=gzip.compress(buf.getvalue().encode())
  config=json.loads((ROOT/'scripts/territorial-sources.json').read_text());config['cities']=[copy.deepcopy(city)]
  with tempfile.TemporaryDirectory() as d:
   r=m.prepare(config,html(city['url'].replace('2026-09-17','2026-10-20')),Path(d)/'out',date(2026,10,26),fetch=lambda *a:raw)
   self.assertEqual(r['status'],'candidate_ready');self.assertEqual(r['updatedCities'],['roma'])
   candidate=Path(d)/'out/candidate';files=list(candidate.rglob('*'));self.assertFalse(any(p.suffix=='.gz' for p in files))
   output=(candidate/'data/territorial/roma.json').read_text();self.assertNotIn('PRIVATE_RAW_ONLY',output);self.assertNotIn('host_name',output)
   data=json.loads(output);self.assertEqual(data['rows'][0][6],12);self.assertEqual(data['rows'][0][8],102.75)
if __name__=='__main__':unittest.main()
