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
