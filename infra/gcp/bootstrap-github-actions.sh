#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-csforge-508510}"
PROJECT_NUMBER="${PROJECT_NUMBER:-1003183509924}"
REGION="${REGION:-asia-southeast1}"
CLOUD_RUN_SERVICE="${CLOUD_RUN_SERVICE:-csforge}"
ARTIFACT_REGISTRY_REPOSITORY="${ARTIFACT_REGISTRY_REPOSITORY:-csforge}"
WORKLOAD_IDENTITY_POOL="${WORKLOAD_IDENTITY_POOL:-github}"
WORKLOAD_IDENTITY_PROVIDER="${WORKLOAD_IDENTITY_PROVIDER:-csforge}"
DEPLOY_SERVICE_ACCOUNT_ID="${DEPLOY_SERVICE_ACCOUNT_ID:-github-cloud-run-deployer}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-guseoh/csforge}"

DEPLOY_SERVICE_ACCOUNT="${DEPLOY_SERVICE_ACCOUNT_ID}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud config set project "${PROJECT_ID}" >/dev/null

actual_project_number="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"
if [[ "${actual_project_number}" != "${PROJECT_NUMBER}" ]]; then
  echo "Project number mismatch: expected ${PROJECT_NUMBER}, got ${actual_project_number}" >&2
  exit 1
fi

gcloud services enable   artifactregistry.googleapis.com   iamcredentials.googleapis.com   run.googleapis.com   sts.googleapis.com   --project="${PROJECT_ID}"

if ! gcloud artifacts repositories describe "${ARTIFACT_REGISTRY_REPOSITORY}"   --project="${PROJECT_ID}"   --location="${REGION}" >/dev/null 2>&1; then
  gcloud artifacts repositories create "${ARTIFACT_REGISTRY_REPOSITORY}"     --project="${PROJECT_ID}"     --location="${REGION}"     --repository-format=docker     --description="CSForge backend images"
fi

if ! gcloud iam service-accounts describe "${DEPLOY_SERVICE_ACCOUNT}"   --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud iam service-accounts create "${DEPLOY_SERVICE_ACCOUNT_ID}"     --project="${PROJECT_ID}"     --display-name="GitHub Cloud Run deployer"
fi

if ! gcloud iam workload-identity-pools describe "${WORKLOAD_IDENTITY_POOL}"   --project="${PROJECT_ID}"   --location=global >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "${WORKLOAD_IDENTITY_POOL}"     --project="${PROJECT_ID}"     --location=global     --display-name="GitHub Actions"
fi

if ! gcloud iam workload-identity-pools providers describe "${WORKLOAD_IDENTITY_PROVIDER}"   --project="${PROJECT_ID}"   --location=global   --workload-identity-pool="${WORKLOAD_IDENTITY_POOL}" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers create-oidc "${WORKLOAD_IDENTITY_PROVIDER}"     --project="${PROJECT_ID}"     --location=global     --workload-identity-pool="${WORKLOAD_IDENTITY_POOL}"     --display-name="CSForge GitHub repository"     --issuer-uri="https://token.actions.githubusercontent.com"     --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner,attribute.ref=assertion.ref"     --attribute-condition="assertion.repository == '${GITHUB_REPOSITORY}'"
fi

pool_name="$(gcloud iam workload-identity-pools describe "${WORKLOAD_IDENTITY_POOL}"   --project="${PROJECT_ID}"   --location=global   --format='value(name)')"

provider_name="$(gcloud iam workload-identity-pools providers describe "${WORKLOAD_IDENTITY_PROVIDER}"   --project="${PROJECT_ID}"   --location=global   --workload-identity-pool="${WORKLOAD_IDENTITY_POOL}"   --format='value(name)')"

gcloud iam service-accounts add-iam-policy-binding "${DEPLOY_SERVICE_ACCOUNT}"   --project="${PROJECT_ID}"   --role="roles/iam.workloadIdentityUser"   --member="principalSet://iam.googleapis.com/${pool_name}/attribute.repository/${GITHUB_REPOSITORY}"

gcloud projects add-iam-policy-binding "${PROJECT_ID}"   --member="serviceAccount:${DEPLOY_SERVICE_ACCOUNT}"   --role="roles/run.developer"   --condition=None >/dev/null

gcloud artifacts repositories add-iam-policy-binding "${ARTIFACT_REGISTRY_REPOSITORY}"   --project="${PROJECT_ID}"   --location="${REGION}"   --member="serviceAccount:${DEPLOY_SERVICE_ACCOUNT}"   --role="roles/artifactregistry.writer"   --condition=None >/dev/null

runtime_service_account="$(gcloud run services describe "${CLOUD_RUN_SERVICE}"   --project="${PROJECT_ID}"   --region="${REGION}"   --format='value(spec.template.spec.serviceAccountName)')"

if [[ -z "${runtime_service_account}" ]]; then
  runtime_service_account="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
fi

gcloud iam service-accounts add-iam-policy-binding "${runtime_service_account}"   --project="${PROJECT_ID}"   --role="roles/iam.serviceAccountUser"   --member="serviceAccount:${DEPLOY_SERVICE_ACCOUNT}"

echo
echo "GitHub Actions Cloud Run deployment bootstrap complete."
echo "Workload Identity Provider: ${provider_name}"
echo "Deploy service account: ${DEPLOY_SERVICE_ACCOUNT}"
echo "Artifact Registry image base: ${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REGISTRY_REPOSITORY}/csforge"
echo "Cloud Run runtime service account: ${runtime_service_account}"
