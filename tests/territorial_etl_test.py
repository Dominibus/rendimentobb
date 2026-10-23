import importlib.util,json,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('etl',Path(__file__).parents[1]/'scripts/build-territorial-references.py');etl=importlib.util.module_from_spec(spec);spec.loader.exec_module(etl)
def fixture(i=1,**changes):
 quote={'currency':'EUR','is_available':True,'is_monthly_priced':False,'nightly_subtotal':str(i*2),'requested_checkin_date':'2026-10-05','requested_checkout_date':'2026-10-07','total_price':'99999'}
 row={'id':str(i),'last_scraped':'2026-09-20','price_quote_checkin_date':'2026-10-05','price_quote_checkout_date':'2026-10-07','price_quote_raw':json.dumps({'quote':quote}),'neighbourhood_cleansed':'Zona A','property_type':'Entire rental unit','room_type':'Entire home/apt','accommodates':'4','price':'$99999','availability_365':'0','estimated_occupancy_l365d':'99','host_name':'DO NOT EXPORT','latitude':'40.111','longitude':'14.111'}
 row.update(changes);return row
class ETL(unittest.TestCase):
 def test_quantiles_independent(self):
  r=etl.aggregate([fixture(i) for i in range(1,14)]);row=r['rows'][0]
  self.assertEqual(row[6:10],[13,4,7,10]);self.assertEqual(r['eligibleRows'],13)
 def test_ignores_legacy_price_occupancy_and_total(self):
  r=etl.observe(fixture(5))[0];self.assertEqual(r['value'],5);self.assertNotIn('occupancy',r)
 def test_sparse_never_publishes_prices_or_exact_counts(self):
  r=etl.aggregate([fixture(i) for i in range(1,10)]);self.assertEqual(r['rows'][0][6:],[None]*8)
 def test_no_merge_of_district_or_capacity(self):
  rows=[fixture(i) for i in range(1,8)]+[fixture(i,accommodates='2') for i in range(8,15)]+[fixture(i,neighbourhood_cleansed='Zona B') for i in range(15,22)]
  r=etl.aggregate(rows);self.assertEqual(len(r['rows']),3);self.assertTrue(all(x[6] is None for x in r['rows']))
 def test_duplicate_listing_never_doubles_sample(self):
  r=etl.aggregate([fixture(1)]*12);self.assertEqual(r['eligibleRows'],1);self.assertEqual(r['excluded']['missing_or_duplicate_id'],11)
 def test_export_has_no_personal_rows_or_occupancy_model(self):
  text=json.dumps(etl.aggregate([fixture(i) for i in range(1,15)]))
  for word in ['DO NOT EXPORT','host_name','latitude','longitude','availability_365','estimated_occupancy','total_price']:self.assertNotIn(word,text)
 def test_currency_dates_availability_and_monthly_quotes(self):
  for key,value in [('currency','USD'),('is_available',False),('is_monthly_priced',True),('nightly_subtotal',None),('nightly_subtotal','NaN'),('nightly_subtotal','-4'),('returned_checkin_date','2026-10-06')]:
   r=fixture();q=json.loads(r['price_quote_raw']);q['quote'][key]=value;r['price_quote_raw']=json.dumps(q);self.assertIsNone(etl.observe(r)[0],key)
 def test_bad_json_and_missing_dates_not_imputed(self):
  for changes in [{'price_quote_raw':'{'},{'price_quote_raw':'[]'},{'price_quote_checkout_date':''},{'price_quote_checkin_date':'2026-02-30'},{'accommodates':'2.5'}]:self.assertIsNone(etl.observe(fixture(**changes))[0])
 def test_stay_month_and_duration_not_observation_month(self):
  r=etl.observe(fixture())[0];self.assertEqual(r['segment'][4:],('2026-10','2-3'));self.assertEqual(r['observed'],'2026-09-20')
if __name__=='__main__':unittest.main()
