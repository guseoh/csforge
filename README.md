# CSForge

CSForge is a local-first, single-user workspace for learning computer science and backend engineering. This repository currently contains the runnable development skeleton; learning domains and content import arrive in later issues.

## Prerequisites

- Docker Desktop with Compose
- Java 25
- Node.js and npm

The commands below are written for Windows PowerShell.

## Start local infrastructure

```powershell
docker compose up -d
docker compose ps
```

The stack provides PostgreSQL (`5432`), Elasticsearch with Nori (`9200`), Kafka (`29092`), Redis (`6379`), Prometheus (`9090`), and Grafana (`3000`).

## Run the backend

```powershell
Push-Location backend
.\gradlew.bat bootRun
Pop-Location
```

The backend listens on `http://localhost:8080`. Actuator health and Prometheus metrics are available at `/actuator/health` and `/actuator/prometheus`.

## Start production-like Compose

```powershell
Copy-Item .env.example .env
# Edit .env and replace POSTGRES_PASSWORD=change-me with a real local secret.
docker compose -f compose.prod.yaml config
docker compose -f compose.prod.yaml up -d --build
docker compose -f compose.prod.yaml ps
```

`CSFORGE_RELEASE` is the application release identity. Jenkins sets it to the
full Git commit SHA checked out by the build, so backend, web, and Elasticsearch
are built and deployed with the same deterministic tag. Local manual Compose
keeps the `prod` fallback when `CSFORGE_RELEASE` is unset; Jenkins deployments
always provide the explicit SHA.

To inspect the active application release from the real containers:

```powershell
docker inspect csforge-prod-backend-1 --format '{{.Config.Image}}'
docker inspect csforge-prod-web-1 --format '{{.Config.Image}}'
docker inspect csforge-prod-elasticsearch-1 --format '{{.Config.Image}}'
docker inspect csforge-prod-backend-1 --format '{{index .Config.Labels "com.docker.compose.project"}}'
docker inspect csforge-prod-postgres-1 --format '{{range .Mounts}}{{if eq .Destination "/var/lib/postgresql/data"}}{{.Name}}{{end}}{{end}}'
```

Jenkins prints `Deploying release`, `Previous release`, and
`Active release after deploy`. Previous release detection reads the running
application containers and does not use a mutable repository state file.

### Manual application rollback

Application image rollback is an explicit, manual operation. It is allowed
only when all three target images already exist in the local Docker daemon and
the canonical PostgreSQL volume is present. Set `CSFORGE_RELEASE` to the
previous SHA observed from Jenkins or the container image, keep the existing
`POSTGRES_PASSWORD` in the ignored `.env`/environment, and run the prechecks
before starting Compose:

```powershell
$env:CSFORGE_RELEASE = '<previous-release-sha>'
@(
  "csforge-backend:$env:CSFORGE_RELEASE",
  "csforge-frontend:$env:CSFORGE_RELEASE",
  "csforge-elasticsearch:$env:CSFORGE_RELEASE"
) | ForEach-Object {
  docker image inspect $_ *> $null
  if ($LASTEXITCODE -ne 0) { throw "Missing local rollback image: $_" }
}
docker volume inspect csforge-prod_postgres-data *> $null
if ($LASTEXITCODE -ne 0) { throw 'Missing canonical PostgreSQL volume; rollback stopped.' }
docker compose -f compose.prod.yaml config --quiet
docker compose -f compose.prod.yaml up -d --no-build --pull never
```

After rollback, repeat the container image and volume inspection above, then
verify backend readiness, `/` = HTTP 200, `/api/dashboard` = HTTP 200, Search
state `READY`, and Nginx `/actuator/*` = HTTP 404. If any target image is
missing, stop without changing the stack; this local-only lab has no registry
fallback. Never use `docker compose down -v`, `docker volume prune`,
`docker system prune --volumes`, or reset/replace the PostgreSQL canonical
volume for rollback.

Application image rollback is not database rollback. Flyway migrations move
forward; if a future release changes the schema incompatibly, an older
application image cannot be assumed to work. This issue changes no schema or
migrations, and rollback acceptance is limited to schema-compatible releases.

The `.env` file is ignored by Git. `docker compose down -v` can delete the
canonical PostgreSQL volume, so do not use it as the normal shutdown command.

## Run the local Jenkins lab

```powershell
docker compose -f compose.jenkins.yaml config --quiet
docker compose -f compose.jenkins.yaml up -d --build
docker compose -f compose.jenkins.yaml ps
docker compose -f compose.jenkins.yaml exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
Start-Process http://127.0.0.1:8081
```

Use the printed one-time password to complete Jenkins setup in the browser and
create the local admin account. The image installs only the Pipeline, Git,
Credentials Binding, and optional Pipeline Graph View plugins; suggested
plugins are not required. Create a **Secret text** credential with ID
`csforge-postgres-password` for the local PostgreSQL password, then create a
Pipeline job that loads `Jenkinsfile` from this repository and branch `main`.
When validating an in-progress change, point the job at that working branch
instead. Do not commit that password or other Jenkins credentials. The Jenkins
container uses Docker-outside-of-Docker through the Docker Desktop socket; this
gives Jenkins host Docker daemon control and is only appropriate for this
single-user, local-only, trusted-code lab. Do not expose it on a public interface
or use it for untrusted public pull requests.

Stop the lab with `docker compose -f compose.jenkins.yaml down`; do not add
`-v`, because that can delete the persistent `jenkins-home` volume.

## Run the frontend

```powershell
Push-Location frontend
npm ci
npm run dev
Pop-Location
```

Open `http://localhost:5173`. Vite proxies `/api` and `/actuator` requests to the backend.

## Validate

```powershell
docker compose config

Push-Location backend
.\gradlew.bat test build
Pop-Location

Push-Location frontend
npm ci
npm run test
npm run lint
npm run build
Pop-Location
```

## Stop local infrastructure

```powershell
docker compose down
```

Named volumes are retained by this command so local data is preserved.
