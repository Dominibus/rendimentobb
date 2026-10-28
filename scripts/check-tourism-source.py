#!/usr/bin/env python3
"""Read-only hash check of the cached ISTAT national archive; no data publication."""
import argparse, datetime, hashlib, json, urllib.request
from pathlib import Path
SOURCE='https://esploradati.istat.it/databrowser/DWL/Servizi/DCSC_Occupancy_in_collective_accommodation.zip'
BASELINE='34de435ceeba173ccc40b9fdf56c2cfcf07425feb522b10407b72df3b93466e4'
def compare(payload):
    digest=hashlib.sha256(payload).hexdigest()
    return {'status':'unchanged_archive' if digest==BASELINE else 'archive_changed_requires_review','archiveSHA256':digest,'baselineArchiveSHA256':BASELINE,'verificationScope':'Archive bytes only; not an assessment of observation freshness, values, or release finality','published':False,'requiresReview':digest!=BASELINE}
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=Path,required=True);args=p.parse_args()
    try:
        req=urllib.request.Request(SOURCE,headers={'User-Agent':'RendimentoBB-source-review/1.0'})
        with urllib.request.urlopen(req,timeout=90) as response:
            payload=response.read(40_000_001)
        if len(payload)>40_000_000 or not payload.startswith(b'PK'):raise ValueError('Invalid or oversized ZIP response')
        report=compare(payload)
    except Exception as e:
        report={'status':'check_failed','error':str(e),'published':False,'requiresReview':True}
    report.update({'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceURL':SOURCE})
    args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report))
    if report['status']=='check_failed':raise SystemExit(1)
