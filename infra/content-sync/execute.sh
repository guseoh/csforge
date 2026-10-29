#!/usr/bin/env bash
set -euo pipefail
: "${SOURCE_SHA:?}" "${GCP_PROJECT_ID:?}" "${GCP_REGION:?}" "${SYNC_JOB:?}"
[[ "$SOURCE_SHA" =~ ^[0-9a-f]{40}$ ]]
[[ "$SYNC_MODE" =~ ^(AUDIT|INITIALIZE|APPLY)$ ]]
[[ "$SYNC_SCOPE" =~ ^JAVA_(CONCEPTS|QUESTIONS)$ ]]
[[ "${RECOVERY_VERIFIED_AT:-}" =~ ^[0-9TZ:.-]*$ ]]
image="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/csforge/csforge:${SOURCE_SHA}"
digest=$(gcloud artifacts docker images describe "$image" --format='value(image_summary.digest)')
[[ "$digest" =~ ^sha256:[0-9a-f]{64}$ ]]
if [[ "$SYNC_MODE" != AUDIT ]]; then
  gcloud run services describe csforge --project="$GCP_PROJECT_ID" --region="$GCP_REGION" --format=json > /tmp/csforge-service.json
  revision=$(python3 - <<'PY'
import json
j=json.load(open('/tmp/csforge-service.json'))
t=[x for x in j['status']['traffic'] if x.get('percent',0)>0]
assert len(t)==1 and t[0]['percent']==100, 'Split traffic blocks synchronization'
print(t[0]['revisionName'])
PY
)
  running=$(gcloud run revisions describe "$revision" --project="$GCP_PROJECT_ID" --region="$GCP_REGION" --format='value(status.imageDigest)')
  [[ "$running" == *"@$digest" ]]
  frontend_ready=false
  for attempt in {1..30}; do
    if curl --fail --silent --show-error --max-time 10 "https://csforge-five.vercel.app/build-info.json?sha=$SOURCE_SHA" > /tmp/csforge-frontend.json && python3 - <<'PY'
import json,os
assert json.load(open('/tmp/csforge-frontend.json'))['sourceSha']==os.environ['SOURCE_SHA'], 'Frontend source mismatch'
PY
    then
      frontend_ready=true
      break
    fi
    sleep 10
  done
  [[ "$frontend_ready" == true ]]
fi
# Job is provisioned separately with fixed DB secrets, least privilege and apply disabled by default.
gcloud run jobs update "$SYNC_JOB" --project="$GCP_PROJECT_ID" --region="$GCP_REGION" --image="${image%:*}@${digest}" --quiet
# Values are constrained; no credentials or canonical/user payloads are passed through shell text.
gcloud run jobs execute "$SYNC_JOB" --project="$GCP_PROJECT_ID" --region="$GCP_REGION" --wait \
  --update-env-vars="SYNC_SOURCE_SHA=$SOURCE_SHA,SYNC_MODE=$SYNC_MODE,SYNC_SCOPE=$SYNC_SCOPE,SYNC_BACKEND_SHA=$SOURCE_SHA,SYNC_FRONTEND_SHA=$SOURCE_SHA,SYNC_RECOVERY_VERIFIED_AT=${RECOVERY_VERIFIED_AT:-}" --quiet
