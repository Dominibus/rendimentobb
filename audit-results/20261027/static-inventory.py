from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,collections,xml.etree.ElementTree as ET
root=Path('/workspace/rendimentobb')
class P(HTMLParser):
 def __init__(self):super().__init__();self.items=[]
 def handle_starttag(self,t,a):self.items.append((t,dict(a),self.getpos()[0]))
rows=[];broken=[]
for p in root.rglob('*.html'):
 if any(x in p.parts for x in ['node_modules','.git']):continue
 q=P();q.feed(p.read_text());rel=str(p.relative_to(root));ids=collections.Counter(a['id'] for t,a,l in q.items if a.get('id'))
 row={'file':rel,'bytes':p.stat().st_size,'lang':next((a.get('lang') for t,a,l in q.items if t=='html'),None),'h1':sum(t=='h1' for t,a,l in q.items),'title':sum(t=='title' for t,a,l in q.items),'description':sum(t=='meta' and a.get('name')=='description' for t,a,l in q.items),'canonical':[a.get('href') for t,a,l in q.items if t=='link' and a.get('rel')=='canonical'],'hreflang':[(a.get('hreflang'),a.get('href'))for t,a,l in q.items if t=='link' and a.get('hreflang')],'robots':[a.get('content')for t,a,l in q.items if t=='meta' and a.get('name')=='robots'],'scripts':sum(t=='script' for t,a,l in q.items),'stylesheets':sum(t=='link' and a.get('rel')=='stylesheet' for t,a,l in q.items),'duplicate_ids':{k:v for k,v in ids.items()if v>1},'images_missing_alt':[l for t,a,l in q.items if t=='img' and 'alt' not in a]}
 rows.append(row)
 for t,a,l in q.items:
  attr='src' if t in ['script','img','video','source'] else 'href' if t in ['link','a'] else None
  if not attr or not a.get(attr):continue
  u=urlsplit(a[attr]);url=unquote(u.path)
  if u.scheme or u.netloc or not url or url.startswith('/api/'):continue
  dest=(root/url.lstrip('/'))if url.startswith('/')else p.parent/url
  if dest.is_dir():dest=dest/'index.html'
  if not dest.exists():broken.append({'file':rel,'line':l,'url':a[attr],'tag':t})
(root.parent/'audit-rendimentobb/static-inventory.json').write_text(json.dumps({'pages':rows,'broken_local_references':broken},indent=2))
print('HTML pages',len(rows),'broken references',len(broken));print('Missing title', [r['file']for r in rows if not r['title']]);print('Missing canonical',[r['file']for r in rows if not r['canonical']]);print('Missing descriptions',[r['file']for r in rows if not r['description']]);print('Duplicate IDs',[(r['file'],r['duplicate_ids'])for r in rows if r['duplicate_ids']]);print('broken',json.dumps(broken,indent=2)[:6000])
