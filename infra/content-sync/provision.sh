#!/usr/bin/env bash
# Reviewed bootstrap only: creates dedicated identities and grants scoped access.
# Does not enable automatic application or execute an Import.
set -euo pipefail
project=csforge-508510
project_number=1003183509924
region=asia-southeast1
job=csforge-content-sync
runtime="csforge-content-sync-runtime@${project}.iam.gserviceaccount.com"
executor="csforge-content-sync-executor@${project}.iam.gserviceaccount.com"
: "${SOURCE_SHA:?Set the reviewed serving main SHA}"
[[ "$SOURCE_SHA" =~ ^[0-9a-f]{40}$ ]]
[[ "$(gcloud projects describe "$project" --format='value(projectNumber)')" == "$project_number" ]]
working=$(mktemp -d)
# The temporary specification has no password value, but still stays private to this user.
chmod 700 "$working"
gcloud run services describe csforge --project="$project" --region="$region" --format=json > "$working/service.json"
gcloud iam workload-identity-pools providers describe csforge --project="$project" --location=global \
  --workload-identity-pool=github --format=json > "$working/provider.json"
python3 - "$working" <<'PY'
import json,pathlib,sys,urllib.parse
root=pathlib.Path(sys.argv[1]); service=json.loads((root/'service.json').read_text())
traffic=[t for t in service['status']['traffic'] if t.get('percent',0)>0]
assert len(traffic)==1 and traffic[0]['percent']==100, 'Split traffic blocks provisioning'
containers=service['spec']['template']['spec']['containers']
assert len(containers)==1, 'Review multi-container configuration separately'
env={e['name']:e for e in containers[0]['env']}
url=urllib.parse.urlparse(env['DB_URL']['value'].removeprefix('jdbc:'))
assert url.hostname=='ep-orange-voice-b3u0nln6.c-4.ap-southeast-1.aws.neon.tech'
assert url.path=='/neondb' and url.username is None and url.password is None
assert 'secretKeyRef' in env['DB_PASSWORD']['valueFrom'], 'Reuse a secret reference only'
condition=json.loads((root/'provider.json').read_text())['attributeCondition']
assert condition.strip()=="assertion.repository == 'guseoh/csforge' && assertion.ref == 'refs/heads/main'", 'Review WIF trust condition'
(root/'revision').write_text(traffic[0]['revisionName'])
(root/'db-secret').write_text(env['DB_PASSWORD']['valueFrom']['secretKeyRef']['name'])
(root/'db-env.json').write_text(json.dumps([env[n] for n in ('DB_URL','DB_USERNAME','DB_PASSWORD')]))
PY
revision=$(cat "$working/revision")
image="${region}-docker.pkg.dev/${project}/csforge/csforge:${SOURCE_SHA}"
digest=$(gcloud artifacts docker images describe "$image" --project="$project" --format='value(image_summary.digest)')
[[ "$digest" =~ ^sha256:[0-9a-f]{64}$ ]]
serving=$(gcloud run revisions describe "$revision" --project="$project" --region="$region" --format='value(status.imageDigest)')
[[ "$serving" == *"@$digest" ]]
# Never replace an existing Job or redefine an existing IAM role. A partial prior
# run must be reviewed and reconciled explicitly instead of silently overwriting.
gcloud run jobs list --project="$project" --region="$region" --format='value(metadata.name)' > "$working/jobs"
if grep -Fxq "$job" "$working/jobs"; then
  echo 'Existing sync Job requires manual review; refusing to replace it.' >&2
  exit 1
fi
gcloud iam roles list --project="$project" --format='value(name)' > "$working/roles"
for role in csforgeContentSyncJob csforgeContentSyncRead; do
  if grep -Fxq "projects/$project/roles/$role" "$working/roles"; then
    echo 'Existing sync role requires manual review; refusing to modify it.' >&2
    exit 1
  fi
done
# All validation above is read-only. IAM mutations start below and require operator approval.
for account in csforge-content-sync-runtime csforge-content-sync-executor; do
  if ! gcloud iam service-accounts describe "${account}@${project}.iam.gserviceaccount.com" --project="$project" >/dev/null 2>&1; then
    gcloud iam service-accounts create "$account" --project="$project" --display-name="$account" >/dev/null
  fi
done
db_secret=$(cat "$working/db-secret")
gcloud secrets add-iam-policy-binding "$db_secret" --project="$project" \
  --member="serviceAccount:$runtime" --role=roles/secretmanager.secretAccessor --condition=None >/dev/null
python3 - "$working" "$runtime" "${image%:*}@${digest}" "$SOURCE_SHA" <<'PY'
import json,pathlib,sys
root=pathlib.Path(sys.argv[1]); runtime,image,sha=sys.argv[2:]
env=json.loads((root/'db-env.json').read_text())
env += [{'name':k,'value':v} for k,v in {
 'SYNC_SOURCE_SHA':sha,'SYNC_MODE':'AUDIT','SYNC_SCOPE':'JAVA_CONCEPTS',
 'SYNC_APPLY_ENABLED':'false','SYNC_QUESTIONS_ENABLED':'false',
 'SYNC_EXPECTED_DB_HOST':'ep-orange-voice-b3u0nln6.c-4.ap-southeast-1.aws.neon.tech',
 'SYNC_EXPECTED_DB_NAME':'neondb'}.items()]
container={'image':image,'command':['java'],'args':['-Dloader.main=com.guseoh.csforgesync.ContentSyncJob',
 '-cp','/app/app.jar','org.springframework.boot.loader.launch.PropertiesLauncher'],
 'resources':{'limits':{'cpu':'1','memory':'1Gi'}},'env':env}
spec={'apiVersion':'run.googleapis.com/v1','kind':'Job','metadata':{'name':'csforge-content-sync'},
 'spec':{'template':{'spec':{'taskCount':1,'parallelism':1,'template':{'spec':{
 'serviceAccountName':runtime,'maxRetries':0,'timeoutSeconds':'600','containers':[container]}}}}}}
(root/'job.json').write_text(json.dumps(spec))
PY
gcloud run jobs replace "$working/job.json" --project="$project" --region="$region" --quiet >/dev/null
job_permissions=run.jobs.get,run.jobs.update,run.jobs.run,run.jobs.runWithOverrides
read_permissions=run.services.get,run.revisions.get,run.executions.get,run.executions.list,run.operations.get
for role in csforgeContentSyncJob csforgeContentSyncRead; do
  permissions="$job_permissions"
  if [[ "$role" == csforgeContentSyncRead ]]; then permissions="$read_permissions"; fi
  gcloud iam roles create "$role" --project="$project" --title="$role" --permissions="$permissions" --stage=GA --quiet >/dev/null
done
gcloud run jobs add-iam-policy-binding "$job" --project="$project" --region="$region" \
  --member="serviceAccount:$executor" --role="projects/$project/roles/csforgeContentSyncJob" >/dev/null
gcloud projects add-iam-policy-binding "$project" --member="serviceAccount:$executor" \
  --role="projects/$project/roles/csforgeContentSyncRead" --condition=None >/dev/null
gcloud artifacts repositories add-iam-policy-binding csforge --project="$project" --location="$region" \
  --member="serviceAccount:$executor" --role=roles/artifactregistry.reader --condition=None >/dev/null
gcloud iam service-accounts add-iam-policy-binding "$runtime" --project="$project" \
  --member="serviceAccount:$executor" --role=roles/iam.serviceAccountUser >/dev/null
gcloud iam service-accounts add-iam-policy-binding "$executor" --project="$project" \
  --member="principal://iam.googleapis.com/projects/$project_number/locations/global/workloadIdentityPools/github/subject/repo:guseoh@81723538/csforge@1351050764:environment:production-content-sync" \
  --role=roles/iam.workloadIdentityUser >/dev/null
echo 'Scoped Job and IAM configured. Apply and Question synchronization remain disabled.'
