pipeline {
    agent any

    environment {
        JENKINS_CONTAINER = 'csforge-jenkins-jenkins-1'
        JAVA_BUILD_IMAGE = 'eclipse-temurin:25-jdk'
        NODE_BUILD_IMAGE = 'node:22.14.0-bookworm-slim'
        POSTGRES_PASSWORD_CREDENTIAL_ID = 'csforge-postgres-password'
        PROD_PROJECT = 'csforge-prod'
        WEB_BASE_URL = 'http://host.docker.internal:8080'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh '''
                    set -eu
                    echo "branch=$(git branch --show-current)"
                    echo "commit=$(git rev-parse HEAD)"
                    echo "workspace=$WORKSPACE"
                '''
            }
        }

        stage('Backend Validation') {
            steps {
                sh '''
                    set -eu
                    docker run --rm \
                      --user "$(id -u):$(id -g)" \
                      --group-add 0 \
                      --volumes-from "$JENKINS_CONTAINER" \
                      --volume /var/run/docker.sock:/var/run/docker.sock \
                      --env HOME=/tmp \
                      --env GRADLE_USER_HOME=/tmp/gradle-home \
                      --env TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal \
                      --env TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock \
                      --env TESTCONTAINERS_RYUK_DISABLED=false \
                      --workdir "$WORKSPACE/backend" \
                      "$JAVA_BUILD_IMAGE" \
                      sh -c 'set -eu; sed -i "s/\\r$//" gradlew; chmod +x gradlew; java -version; ./gradlew test --no-daemon --console=plain; ./gradlew bootJar --no-daemon'

                    attempts=0
                    while [ "$attempts" -lt 24 ] && [ -n "$(docker ps -q --filter label=org.testcontainers=true)" ]; do
                      attempts=$((attempts + 1))
                      echo "Waiting for Testcontainers cleanup (${attempts}/24)..."
                      sleep 5
                    done
                    if [ -n "$(docker ps -q --filter label=org.testcontainers=true)" ]; then
                      echo 'Testcontainers cleanup did not finish within 120 seconds' >&2
                      docker ps --filter label=org.testcontainers=true
                      exit 1
                    fi
                    echo 'Testcontainers cleanup: PASS'
                '''
            }
        }

        stage('Frontend Validation') {
            steps {
                sh '''
                    set -eu
                    docker run --rm \
                      --volumes-from "$JENKINS_CONTAINER" \
                      --user "$(id -u):$(id -g)" \
                      --workdir "$WORKSPACE/frontend" \
                      --env HOME=/tmp \
                      --env npm_config_cache=/tmp/npm-cache \
                      "$NODE_BUILD_IMAGE" \
                      sh -c 'set -eu; node --version; npm --version; rm -rf node_modules; npm ci; npm run lint; npm test; npm run build; rm -rf node_modules'
                '''
            }
        }

        stage('Compose Validation') {
            steps {
                sh '''
                    set -eu
                    export POSTGRES_PASSWORD=jenkins-ci-validation-only
                    docker compose -f compose.prod.yaml config --quiet
                    docker compose -f compose.prod.yaml --profile observability config --quiet

                    if env -u POSTGRES_PASSWORD docker compose -f compose.prod.yaml config --quiet; then
                      echo 'Expected missing-secret failure did not occur' >&2
                      exit 1
                    fi
                    echo 'Missing-secret fail-fast: PASS'
                '''
            }
        }

        stage('Docker Image Build') {
            steps {
                withCredentials([string(credentialsId: env.POSTGRES_PASSWORD_CREDENTIAL_ID, variable: 'POSTGRES_PASSWORD')]) {
                    sh '''
                        set -eu
                        test -n "$POSTGRES_PASSWORD"
                        docker compose -f compose.prod.yaml build backend web elasticsearch
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([string(credentialsId: env.POSTGRES_PASSWORD_CREDENTIAL_ID, variable: 'POSTGRES_PASSWORD')]) {
                    sh '''
                        set -eu
                        expected_project="$PROD_PROJECT"
                        postgres_container="${expected_project}-postgres-1"
                        postgres_volume="${expected_project}_postgres-data"

                        test "$(docker inspect "$postgres_container" --format '{{index .Config.Labels "com.docker.compose.project"}}')" = "$expected_project"
                        mounted_volume="$(docker inspect "$postgres_container" --format '{{range .Mounts}}{{if eq .Destination "/var/lib/postgresql/data"}}{{.Name}}{{end}}{{end}}')"
                        test "$mounted_volume" = "$postgres_volume"
                        docker volume inspect "$postgres_volume" >/dev/null
                        echo "Compose project: $expected_project"
                        echo "PostgreSQL canonical volume: $postgres_volume"

                        docker compose -f compose.prod.yaml up -d --build
                    '''
                }
            }
        }

        stage('Readiness Wait') {
            steps {
                withCredentials([string(credentialsId: env.POSTGRES_PASSWORD_CREDENTIAL_ID, variable: 'POSTGRES_PASSWORD')]) {
                    sh '''
                        set -eu
                        attempts=0
                        max_attempts=72
                        readiness=''
                        search_status=''
                        reindex_requested=0
                        while [ "$attempts" -lt "$max_attempts" ]; do
                            attempts=$((attempts + 1))
                            readiness="$(docker compose -f compose.prod.yaml exec -T backend curl -fsS http://localhost:8080/actuator/health/readiness 2>/dev/null || true)"
                            web_status="$(curl -sS -o /dev/null -w '%{http_code}' "$WEB_BASE_URL/" || true)"
                            if echo "$readiness" | grep -Eq '"status"[[:space:]]*:[[:space:]]*"UP"' && [ "$web_status" = '200' ]; then
                                search_status="$(curl -fsS "$WEB_BASE_URL/api/search/status" 2>/dev/null || true)"
                                if echo "$search_status" | grep -Eq '"state"[[:space:]]*:[[:space:]]*"NOT_READY"' && [ "$reindex_requested" -eq 0 ]; then
                                    if curl --max-time 30 -fsS -X POST "$WEB_BASE_URL/api/search/reindex" >/dev/null; then
                                        reindex_requested=1
                                        echo 'Search reindex: requested'
                                    fi
                                fi
                            fi
                            echo "Readiness poll ${attempts}/${max_attempts}: backend=${readiness:-unavailable} web=${web_status:-unavailable} search=${search_status:-unavailable}"
                            if echo "$readiness" | grep -Eq '"status"[[:space:]]*:[[:space:]]*"UP"' && [ "$web_status" = '200' ] && echo "$search_status" | grep -Eq '"state"[[:space:]]*:[[:space:]]*"READY"'; then
                                echo 'Application and Search readiness: PASS'
                                break
                            fi
                            sleep 5
                        done

                        if ! echo "$readiness" | grep -Eq '"status"[[:space:]]*:[[:space:]]*"UP"' || [ "$web_status" != '200' ] || ! echo "$search_status" | grep -Eq '"state"[[:space:]]*:[[:space:]]*"READY"'; then
                            echo 'Bounded readiness polling failed' >&2
                            docker compose -f compose.prod.yaml ps
                            docker compose -f compose.prod.yaml logs --tail 120 backend web postgres kafka elasticsearch
                            exit 1
                        fi
                    '''
                }
            }
        }

        stage('Smoke Test') {
            steps {
                withCredentials([string(credentialsId: env.POSTGRES_PASSWORD_CREDENTIAL_ID, variable: 'POSTGRES_PASSWORD')]) {
                    sh '''
                        set -eu
                        http_status() {
                            curl -sS -o /dev/null -w '%{http_code}' "$1"
                        }

                        test "$(http_status "$WEB_BASE_URL/")" = '200'
                        test "$(http_status "$WEB_BASE_URL/api/dashboard")" = '200'
                        test "$(http_status "$WEB_BASE_URL/actuator/health")" = '404'
                        test "$(http_status "$WEB_BASE_URL/actuator/prometheus")" = '404'

                        readiness="$(docker compose -f compose.prod.yaml exec -T backend curl -fsS http://localhost:8080/actuator/health/readiness)"
                        echo "Backend readiness: $readiness"
                        echo "$readiness" | grep -Eq '"status"[[:space:]]*:[[:space:]]*"UP"'

                        search_status="$(curl -fsS "$WEB_BASE_URL/api/search/status")"
                        echo "Search status: $search_status"
                        echo "$search_status" | grep -Eq '"state"[[:space:]]*:[[:space:]]*"READY"'

                        test "$(docker compose -f compose.prod.yaml port web 80)" = '127.0.0.1:8080'
                        echo 'Smoke tests: PASS'
                    '''
                }
            }
        }
    }

    post {
        always {
            sh '''
                set +e
                echo '--- Testcontainers still running ---'
                docker ps --filter label=org.testcontainers=true --format '{{.Names}}' || true
                echo '--- Production-like stack ---'
                docker ps --filter label=com.docker.compose.project=csforge-prod --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}' || true
            '''
        }

        cleanup {
            deleteDir()
        }
    }
}
