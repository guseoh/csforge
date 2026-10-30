"""외부 서비스 응답을 대체하여 배포 불일치 시 Job 변경이 차단되는지 검증한다."""
import json, os, pathlib, subprocess, tempfile
runner = pathlib.Path(__file__).with_name('execute.sh')
with tempfile.TemporaryDirectory() as tmp:
    root = pathlib.Path(tmp)
    stub = '''#!/usr/bin/env python3
import json,os,sys
name=os.path.basename(sys.argv[0]); args=sys.argv[1:]
with open(os.environ['CALLS'],'a') as f: f.write(json.dumps([name]+args)+'\\n')
digest='sha256:'+'1'*64
if name=='sleep': pass
elif name=='curl': print(json.dumps({'sourceSha':os.environ.get('FRONTEND',os.environ['SOURCE_SHA'])}))
elif args[:3]==['artifacts','docker','images']: print(os.environ.get('DIGEST',digest))
elif args[:3]==['run','services','describe']: print(json.dumps({'status':{'traffic':[{'percent':100,'revisionName':'fixed-revision'}]}}))
elif args[:3]==['run','revisions','describe']: print('image@'+os.environ.get('BACKEND',digest))
'''
    for name in ('gcloud','curl','sleep'):
        file = root/name; file.write_text(stub); file.chmod(0o700)
    common = dict(os.environ, PATH=str(root)+':'+os.environ['PATH'], CALLS=str(root/'calls'),
        SOURCE_SHA='a'*40,GCP_PROJECT_ID='test',GCP_REGION='test',SYNC_JOB='test',
        SYNC_MODE='APPLY',SYNC_SCOPE='JAVA_CONCEPTS',RECOVERY_VERIFIED_AT='2026-10-29T12:00:00Z')
    cases = [('invalid_mode',{'SYNC_MODE':'INVALID'},False), ('invalid_scope',{'SYNC_SCOPE':'OTHER'},False),
        ('invalid_sha',{'SOURCE_SHA':'invalid'},False),('invalid_digest',{'DIGEST':'invalid'},False),
        ('backend_mismatch',{'BACKEND':'sha256:'+'2'*64},False),('frontend_mismatch',{'FRONTEND':'b'*40},False),
        ('audit',{'SYNC_MODE':'AUDIT'},True),('apply',{},True),
        ('all_topics',{'SYNC_SCOPE':'ALL_TOPICS'},True),('all_concepts',{'SYNC_SCOPE':'ALL_CONCEPTS'},True),
        ('all_questions',{'SYNC_SCOPE':'ALL_QUESTIONS'},True),
        ('question_plan',{'SYNC_MODE':'QUESTION_PLAN','SYNC_SCOPE':'JAVA_QUESTIONS'},True),
        ('question_wrong_scope',{'SYNC_MODE':'QUESTION_PLAN'},False),
        ('question_missing_plan',{'SYNC_MODE':'QUESTION_APPLY','SYNC_SCOPE':'JAVA_QUESTIONS'},False),
        ('question_injection',{'QUESTION_SOURCE_DIGEST':'x,SYNC_APPLY_ENABLED=true'},False),
        ('question_apply',{'SYNC_MODE':'QUESTION_APPLY','SYNC_SCOPE':'JAVA_QUESTIONS',
            'QUESTION_SOURCE_DIGEST':'a'*64,'QUESTION_PREVIEW_DIGEST':'b'*64,
            'QUESTION_SELECTION_DIGEST':'c'*64,'QUESTION_SELECTED':'17'},True)]
    for name, overrides, success in cases:
        (root/'calls').write_text('')
        result = subprocess.run(['bash',str(runner)], env=dict(common,**overrides),capture_output=True,timeout=20)
        calls = [json.loads(l) for l in (root/'calls').read_text().splitlines()]
        mutations = [c for c in calls if c[:4] in (['gcloud','run','jobs','update'],['gcloud','run','jobs','execute'])]
        assert (result.returncode==0)==success, (name,result.stderr.decode()[-1000:])
        assert len(mutations)==(2 if success else 0), (name,mutations)
        if success:
            update = next(call for call in mutations if call[:4] == ['gcloud','run','jobs','update'])
            assert '--update-env-vars=DB_USERNAME=csforge_content_sync' in update, update
            assert '--update-secrets=DB_PASSWORD=csforge-content-sync-db-password:latest' in update, update
        print(name+': PASS')
