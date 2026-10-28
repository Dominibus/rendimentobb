import importlib.util, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
def module(filename):
    spec=importlib.util.spec_from_file_location(filename,ROOT/'scripts'/filename);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
class TourismTests(unittest.TestCase):
    def test_hash_monitor_does_not_certify_values(self):
        m=module('check-tourism-source.py');r=m.compare(b'PKchanged');self.assertEqual(r['status'],'archive_changed_requires_review');self.assertFalse(r['published']);self.assertTrue(r['requiresReview'])
        import hashlib
        m.BASELINE=hashlib.sha256(b'PKsame').hexdigest();self.assertEqual(m.compare(b'PKsame')['status'],'unchanged_archive')
    def test_builder_reconciles_and_rejects_new_methodology(self):
        m=module('build-tourism-context.py');a=[2025,None,None,None,None,'Test','001272','(f)']+[1,2,3]*6
        a[8:11]=[2,4,6];a[17:20]=[2,4,6]
        monthly=[2025,None,None,None,None,'Test','001272','(f)']+[1]*6+[0]*6+[1]*6+[0]*6+[6,6]
        source={'Comunali annuali | Annual data':[{'row':7,'values':a}],'Comunali Mensili | Monthly data':[{'row':5,'values':monthly}]}
        capitals=[{'istat':'001272','key':'torino','name':'Torino'}]
        data=m.build(source,capitals,2025,'2026-10-28','a'*64);self.assertEqual(data['records'][0]['arrivals'],6)
        a[7]='(e)'
        with self.assertRaises(ValueError):m.build(source,capitals,2025,'2026-10-28','a'*64)
        a[7]='(f)'
        with self.assertRaises(ValueError):m.build(source,capitals,2026,'2026-10-28','a'*64)
        monthly[8]=2
        with self.assertRaises(ValueError):m.build(source,capitals,2025,'2026-10-28','a'*64)
