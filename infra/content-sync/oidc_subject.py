"""보호 환경에서 OIDC 주체 메타데이터만 출력하고 토큰은 출력하지 않는다."""
import base64
import json
import os
import urllib.request

request = urllib.request.Request(
    os.environ['ACTIONS_ID_TOKEN_REQUEST_URL'],
    headers={'Authorization': 'Bearer ' + os.environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN']},
)
with urllib.request.urlopen(request, timeout=30) as response:
    token = json.load(response)['value']
body = token.split('.')[1]
claims = json.loads(base64.urlsafe_b64decode(body + '=' * (-len(body) % 4)))
print(json.dumps({name: claims.get(name) for name in
                  ('sub', 'repository', 'repository_id', 'repository_owner_id', 'environment', 'ref')}))
