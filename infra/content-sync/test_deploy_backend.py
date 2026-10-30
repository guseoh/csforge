"""배포 트래픽 전환 전에 이미지, 준비 상태, 최신 main을 검증한다."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).with_name('deploy-backend.sh')
SHA = 'a' * 40
DIGEST = 'sha256:' + 'b' * 64

MOCK = '''#!/usr/bin/env python3
import json, os, pathlib, sys
name=pathlib.Path(sys.argv[0]).name
args=sys.argv[1:]
root=pathlib.Path(os.environ['MOCK_DIR'])
if name=='git':
    if args[0]=='rev-parse': print('c'*40 if os.environ.get('MOCK_STALE') else 'a'*40)
    sys.exit(0)
if name=='curl': sys.exit(1 if os.environ.get('MOCK_UNHEALTHY') else 0)
if args[:3]==['run','services','update-traffic']:
    (root/'promoted').write_text('yes')
    sys.exit(0)
if args[:3]==['artifacts','docker','images']:
    print('sha256:'+'b'*64); sys.exit(0)
if args[:3]==['run','revisions','describe']:
    print('registry/image@sha256:'+('c' if os.environ.get('MOCK_WRONG_DIGEST') else 'b')*64); sys.exit(0)
if args[:3]==['run','services','describe']:
    if '--format=value(status.url)' in args:
        print('https://service.example'); sys.exit(0)
    promoted=(root/'promoted').exists()
    traffic=[{'revisionName':'new','tag':'content-sync-candidate','url':'https://candidate.example','percent':100 if promoted else 0}]
    if not promoted: traffic.append({'revisionName':'old','percent':100})
    if promoted and os.environ.get('MOCK_SPLIT'): traffic.append({'revisionName':'old','percent':1})
    print(json.dumps({'status':{'traffic':traffic}})); sys.exit(0)
if args[:2]==['run','deploy']: sys.exit(0)
print('unexpected command',args,file=sys.stderr); sys.exit(2)
'''

class DeploySafety(unittest.TestCase):
    def run_case(self, **settings):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for name in ('gcloud', 'curl', 'git'):
                p = root / name
                p.write_text(MOCK)
                p.chmod(0o755)
            env = dict(os.environ, PATH=tmp + os.pathsep + os.environ['PATH'], MOCK_DIR=tmp,
                       GITHUB_SHA=SHA, IMAGE_URI='registry/image', CLOUD_RUN_SERVICE='csforge',
                       GCP_PROJECT_ID='project', GCP_REGION='region', GITHUB_OUTPUT=str(root/'output'), **settings)
            result = subprocess.run(['bash', str(SCRIPT)], env=env, text=True, capture_output=True)
            return result.returncode, (root/'promoted').exists()

    def test_healthy_matching_revision_promotes(self):
        self.assertEqual(self.run_case(), (0, True))

    def test_wrong_image_never_promotes(self):
        code, promoted = self.run_case(MOCK_WRONG_DIGEST='1')
        self.assertNotEqual(code, 0)
        self.assertFalse(promoted)

    def test_failed_readiness_never_promotes(self):
        code, promoted = self.run_case(MOCK_UNHEALTHY='1')
        self.assertNotEqual(code, 0)
        self.assertFalse(promoted)

    def test_stale_main_never_promotes(self):
        code, promoted = self.run_case(MOCK_STALE='1')
        self.assertNotEqual(code, 0)
        self.assertFalse(promoted)

    def test_unexpected_split_fails_validation(self):
        code, promoted = self.run_case(MOCK_SPLIT='1')
        self.assertNotEqual(code, 0)
        self.assertTrue(promoted)

if __name__ == '__main__':
    unittest.main()
