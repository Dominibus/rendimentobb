"""Reproducible structural audit; does not replace browser or real inbox checks."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
from collections import Counter
import json, subprocess
ROOT=Path(__file__).resolve().parents[1]
class Surface(HTMLParser):
    def __init__(self):
        super().__init__();self.ids=[];self.resources=[];self.scripts=[];self.styles=[];self.inline=[];self.script=None;self.title='';self.in_title=False;self.viewport=False;self.forms=0;self.dialogs=[];self.body=''
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='title':self.in_title=True
        if tag=='body':self.body=a.get('class','')
        if tag=='meta' and a.get('name')=='viewport':self.viewport=True
        if tag=='form':self.forms+=1
        if a.get('role')=='dialog' or tag=='dialog':self.dialogs.append(a.get('id') or a.get('aria-labelledby') or 'dialog')
        if tag=='script':
            if a.get('src'):self.scripts.append(a['src']);self.resources.append(a['src'])
            else:self.script={'type':a.get('type',''),'text':''}
        if tag=='link' and a.get('rel')=='stylesheet':self.styles.append(a.get('href',''))
        if 'src' in a and tag!='script':self.resources.append(a['src'])
        elif tag in ['a','link'] and a.get('href'):self.resources.append(a['href'])
    def handle_data(self,text):
        if self.script is not None:self.script['text']+=text
        if self.in_title:self.title+=text
    def handle_endtag(self,tag):
        if tag=='title':self.in_title=False
        if tag=='script' and self.script is not None:self.inline.append(self.script);self.script=None
issues=[];surfaces=[];inline_count=0
for page in sorted(ROOT.rglob('*.html')):
    if 'node_modules' in page.parts:continue
    scan=Surface();scan.feed(page.read_text());relative=str(page.relative_to(ROOT))
    if not scan.viewport:issues.append({'page':relative,'error':'missing viewport'})
    if not scan.title:issues.append({'page':relative,'error':'missing title'})
    for key,count in Counter(scan.ids).items():
        if count>1:issues.append({'page':relative,'error':'duplicate id','value':key})
    for resource in scan.resources:
        value=urlsplit(resource)
        if value.scheme or value.netloc or not value.path:continue
        target=ROOT/value.path.lstrip('/') if value.path.startswith('/') else page.parent/value.path
        if not target.exists():issues.append({'page':relative,'error':'missing local resource','value':resource})
    for script in scan.inline:
        if script['type'] in ['application/ld+json','application/json']:
            try:json.loads(script['text'])
            except ValueError:issues.append({'page':relative,'error':'invalid inline JSON'})
        elif script['text'].strip():
            inline_count+=1
            check=subprocess.run(['node','--check','--input-type=module'],input=script['text'],text=True,capture_output=True)
            if check.returncode:issues.append({'page':relative,'error':'inline JavaScript syntax','detail':check.stderr[:300]})
    surfaces.append({'path':relative,'title':scan.title.strip(),'bodyClass':scan.body,'viewport':scan.viewport,'sharedTheme':any('/css/product-2027.css' in x for x in scan.styles),'sharedHeader':any('/js/header.js' in x for x in scan.scripts),'sharedFooter':any('/js/footer.js' in x for x in scan.scripts),'forms':scan.forms,'dialogs':scan.dialogs,'styles':scan.styles,'scripts':scan.scripts})
js_count=0
for script in sorted(ROOT.rglob('*.js')):
    if 'node_modules' in script.parts:continue
    js_count+=1;check=subprocess.run(['node','--check',str(script)],capture_output=True,text=True)
    if check.returncode:issues.append({'page':str(script.relative_to(ROOT)),'error':'JavaScript syntax','detail':check.stderr[:300]})
report={'date':'2026-10-01','release':'FIX22','coverage':'Structural inspection and syntax checks only; no rendered browser certification.','summary':{'pages':len(surfaces),'sharedTheme':sum(p['sharedTheme'] for p in surfaces),'sharedHeader':sum(p['sharedHeader'] for p in surfaces),'apiEndpoints':len(list((ROOT/'api').glob('*.js'))),'javascriptFiles':js_count,'inlineScripts':inline_count,'issues':len(issues)},'issues':issues,'surfaces':surfaces}
(ROOT/'docs'/'audit-surfaces-FIX22.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report['summary'],ensure_ascii=False));print(json.dumps(issues,ensure_ascii=False))
raise SystemExit(bool(issues))
