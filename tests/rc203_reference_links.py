import importlib.util,unittest,tempfile
from pathlib import Path
from urllib.error import HTTPError
spec=importlib.util.spec_from_file_location('links',Path(__file__).parents[1]/'scripts/check-reference-links.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Links(unittest.TestCase):
 def test_ignores_arbitrary_and_private_urls(self):
  p=m.References();p.feed('<a href="http://127.0.0.1/a">x</a><a href="https://evil.example/">x</a><a href="https://www.bancaditalia.it/a#page=1">ok</a><a href="https://www.bancaditalia.it/a?token=secret">no</a>');self.assertEqual(p.urls,{'https://www.bancaditalia.it/a'})
 def test_unverified_not_false_broken(self):
  def fail(*a,**k):raise HTTPError('x',403,'blocked',{},None)
  self.assertEqual(m.check('https://www.bancaditalia.it/',fail)['status'],'unverified')
 def test_404(self):
  def fail(*a,**k):raise HTTPError('x',404,'missing',{},None)
  self.assertEqual(m.check('https://www.bancaditalia.it/',fail)['status'],'unavailable')
 def test_timeout(self):
  def fail(*a,**k):raise TimeoutError()
  self.assertEqual(m.check('https://www.bancaditalia.it/',fail)['status'],'unverified')
 def test_redirect_requires_review(self):
  class Response:
   status=200;url='https://www.bancaditalia.it/other'
   def __enter__(self):return self
   def __exit__(self,*a):pass
   def read(self,*a):return b'content'
  self.assertEqual(m.check('https://www.bancaditalia.it/',lambda *a,**k:Response())['status'],'redirect_review')
 def test_existing_scope_nonempty(self):self.assertGreater(len(m.references()),0)
if __name__=='__main__':unittest.main()
