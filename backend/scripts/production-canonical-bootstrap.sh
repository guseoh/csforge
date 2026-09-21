#!/bin/sh
set -eu

java -jar /app/app.jar --spring.profiles.active=local --server.port=8080 &
app_pid=$!

cleanup() {
  kill "$app_pid" 2>/dev/null || true
  wait "$app_pid" 2>/dev/null || true
}
trap cleanup EXIT

ready=0
for _ in $(seq 1 90); do
  if curl --fail --silent --show-error http://127.0.0.1:8080/actuator/health/readiness >/tmp/readiness.json; then
    ready=1
    break
  fi
  if ! kill -0 "$app_pid" 2>/dev/null; then
    exit 11
  fi
  sleep 2
done

if [ "$ready" -ne 1 ]; then
  exit 12
fi

first="$(curl --fail --silent --show-error -X POST http://127.0.0.1:8080/api/canonical-bootstrap)"

printf '%s' "$first" | grep -q '"success":true' || exit 21
printf '%s' "$first" | grep -q '"learningAreas":15' || exit 22
printf '%s' "$first" | grep -q '"concepts":721' || exit 23
printf '%s' "$first" | grep -q '"questions":2524' || exit 24

second="$(curl --fail --silent --show-error -X POST http://127.0.0.1:8080/api/canonical-bootstrap)"

printf '%s' "$second" | grep -q '"success":true' || exit 31
printf '%s' "$second" | grep -q '"state":"READY"' || exit 32
printf '%s' "$second" | grep -q '"learningAreas":15' || exit 33
printf '%s' "$second" | grep -q '"concepts":721' || exit 34
printf '%s' "$second" | grep -q '"questions":2524' || exit 35
printf '%s' "$second" | grep -q '"created":0' || exit 36
printf '%s' "$second" | grep -q '"updated":0' || exit 37
printf '%s' "$second" | grep -q '"errors":0' || exit 38
printf '%s' "$second" | grep -q '"failed":0' || exit 39

echo "Canonical bootstrap completed and reimport is idempotent."
