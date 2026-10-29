#!/usr/bin/env bash
set -euo pipefail
gcloud run deploy "${CLOUD_RUN_SERVICE}" \
  --project="${GCP_PROJECT_ID}" \
  --region="${GCP_REGION}" \
  --image="${IMAGE_URI}:${GITHUB_SHA}" \
  --no-traffic --tag=content-sync-candidate \
  --quiet

digest="$(gcloud artifacts docker images describe "${IMAGE_URI}:${GITHUB_SHA}" --format='value(image_summary.digest)')"
[[ "$digest" =~ ^sha256:[0-9a-f]{64}$ ]]
gcloud run services describe "${CLOUD_RUN_SERVICE}" --project="${GCP_PROJECT_ID}" \
  --region="${GCP_REGION}" --format=json > /tmp/csforge-release-service.json
revision="$(python3 -c 'import json; s=json.load(open("/tmp/csforge-release-service.json")); t=[x for x in s["status"]["traffic"] if x.get("tag")=="content-sync-candidate"]; assert len(t)==1 and t[0].get("percent",0)==0; print(t[0]["revisionName"])')"
candidate_url="$(python3 -c 'import json; s=json.load(open("/tmp/csforge-release-service.json")); print(next(x["url"] for x in s["status"]["traffic"] if x.get("tag")=="content-sync-candidate"))')"
running="$(gcloud run revisions describe "$revision" --project="${GCP_PROJECT_ID}" \
  --region="${GCP_REGION}" --format='value(status.imageDigest)')"
[[ "$running" == *"@$digest" ]]
curl --fail --silent --show-error --retry 6 --retry-delay 5 "${candidate_url}/actuator/health/readiness"
# Do not promote an obsolete build if main advanced during validation.
git fetch origin main
test "$(git rev-parse FETCH_HEAD)" = "$GITHUB_SHA"
gcloud run services update-traffic "${CLOUD_RUN_SERVICE}" --project="${GCP_PROJECT_ID}" \
  --region="${GCP_REGION}" --to-revisions="${revision}=100" --quiet
gcloud run services describe "${CLOUD_RUN_SERVICE}" --project="${GCP_PROJECT_ID}" \
  --region="${GCP_REGION}" --format=json > /tmp/csforge-release-service.json
EXPECTED_REVISION="$revision" python3 -c 'import json,os; s=json.load(open("/tmp/csforge-release-service.json")); t=[x for x in s["status"]["traffic"] if x.get("percent",0)>0]; assert len(t)==1 and t[0]["percent"]==100 and t[0]["revisionName"]==os.environ["EXPECTED_REVISION"]'

service_url="$(gcloud run services describe "${CLOUD_RUN_SERVICE}" \
  --project="${GCP_PROJECT_ID}" \
  --region="${GCP_REGION}" \
  --format='value(status.url)')"
echo "url=${service_url}" >> "$GITHUB_OUTPUT"
