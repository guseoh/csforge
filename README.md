# CSForge

CSForge is a local-first, single-user workspace for learning computer science and backend engineering. The repository's canonical `content/` pack is bundled into the backend at build time and can be prepared explicitly from the Dashboard or Learning screen on a clean database.

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

The stack provides PostgreSQL (`5432`), Redis (`6379`), Prometheus (`9090`), and Grafana (`3000`). Search reads PostgreSQL directly, so Kafka and Elasticsearch are not required.

## Run the backend

```powershell
Push-Location backend
.\gradlew.bat bootRun
Pop-Location
```

The backend listens on `http://localhost:8080`. Actuator health and Prometheus metrics are available at `/actuator/health` and `/actuator/prometheus`.

The local `bootRun` and production-like Compose image use the same canonical pack. Canonical bootstrap prepares the repository's bundled baseline content as a first-run product flow, while general Import is the management flow for user-selected Markdown/JSON that is Preview/Diff/Confirm before applying. Bootstrap reuses the existing `contentKey`-based import contract, so rerunning it is idempotent and does not require a database reset or PostgreSQL volume deletion. Bootstrap is explicit; application startup does not import content automatically. On an empty database, choose `기본 학습 콘텐츠 준비` and wait for the Learning CTA after the import completes.

## Start production-like Compose

```powershell
Copy-Item .env.example .env
# Edit .env and replace POSTGRES_PASSWORD=change-me with a real local secret.
docker compose -f compose.prod.yaml config
docker compose -f compose.prod.yaml up -d --build
docker compose -f compose.prod.yaml ps
```

The `.env` file is ignored by Git. `docker compose down -v` can delete the
canonical PostgreSQL volume, so do not use it as the normal shutdown command.

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
