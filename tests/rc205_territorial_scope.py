"""Regional source rows must never be confused with the selected municipality."""
import importlib.util,json,tempfile,unittest
from datetime import date
from pathlib import Path
from territorial_etl_test import fixture
ROOT=Path(__file__).resolve().parents[1]
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,ROOT/path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
etl=module('rc205_etl','scripts/build-territorial-references.py')
refresh=module('rc205_refresh','scripts/refresh-territorial-references.py')
class MunicipalScope(unittest.TestCase):
 def city(self,name='Bari'):
  return {'name':name,'geographyFilter':{'field':'neighbourhood_cleansed','equals':name,'kind':'source_municipality'}}
 def test_only_exact_municipality_affects_sample_and_median(self):
  rows=[fixture(i,neighbourhood_cleansed='Bari') for i in range(1,13)]+[fixture(i,neighbourhood_cleansed='Other municipality') for i in range(1001,1013)]
  result=etl.aggregate_city(rows,self.city());self.assertEqual(result['regionalSourceRows'],24);self.assertEqual(result['sourceRows'],12);self.assertEqual(result['eligibleRows'],12);self.assertEqual(result['rows'][0][8],6.5);self.assertEqual(result['rows'][0][0],'Bari')
 def test_near_match_or_sparse_never_borrows_other_rows(self):
  rows=[fixture(i,neighbourhood_cleansed='Bari') for i in range(1,10)]+[fixture(i,neighbourhood_cleansed='Bari provincia') for i in range(10,50)]
  result=etl.aggregate_city(rows,self.city());self.assertEqual(result['eligibleRows'],9);self.assertEqual(result['rows'][0][6:],[None]*8)
 def test_unverified_filter_rejected(self):
  for mutation in [{'equals':'Puglia'},{'field':'neighbourhood'},{'kind':'nearest_city'}]:
   c=self.city();c['geographyFilter'].update(mutation)
   with self.assertRaises(ValueError):etl.aggregate_city([],c)
 def test_original_city_aggregation_unchanged(self):
  rows=[fixture(i) for i in range(1,15)];self.assertEqual(etl.aggregate_city(rows,{'name':'Roma'}),etl.aggregate(rows))
 def test_current_live_catalog_checks_all_eight_without_downloading_or_deploying(self):
  config=json.loads((ROOT/'scripts/territorial-sources.json').read_text());html=''.join('<a href="'+c['url']+'">data</a>' for c in config['cities'])
  with tempfile.TemporaryDirectory() as out:
   r=refresh.prepare(config,html,out,date(2026,10,27),fetch=lambda *a:self.fail('Same snapshots must not download'))
   self.assertEqual(len(r['checks']),8);self.assertEqual(r['status'],'up_to_date');self.assertFalse(r['published']);self.assertFalse((Path(out)/'candidate').exists())
if __name__=='__main__':unittest.main()
