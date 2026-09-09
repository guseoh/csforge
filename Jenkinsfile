pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

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
                script {
                    env.CSFORGE_RELEASE = sh(
                        script: 'git rev-parse --verify HEAD^{commit}',
                        returnStdout: true
                    ).trim()
                }
                sh '''
                    set -eu
                    test "$CSFORGE_RELEASE" = "$(git rev-parse --verify HEAD^{commit})"
                    echo "$CSFORGE_RELEASE" | grep -Eq '^[0-9a-f]{40}$'
                    echo "branch=$(git branch --show-current)"
                    echo "commit=$CSFORGE_RELEASE"
                    echo "release=$CSFORGE_RELEASE"
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

                    for image in \
                      "csforge-backend:$CSFORGE_RELEASE" \
                      "csforge-frontend:$CSFORGE_RELEASE" \
                      "csforge-elasticsearch:$CSFORGE_RELEASE"; do
                      docker compose -f compose.prod.yaml config --images | grep -Fx "$image"
                    done
                    echo "Resolved application images for release $CSFORGE_RELEASE: PASS"

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
                        for image in \
                          "csforge-backend:$CSFORGE_RELEASE" \
                          "csforge-frontend:$CSFORGE_RELEASE" \
                          "csforge-elasticsearch:$CSFORGE_RELEASE"; do
                          docker image inspect "$image" >/dev/null
                          echo "Built image: $image"
                        done
                    '''
                }
            }
        }

        stage('Previous Release Detection') {
            steps {
                script {
                    env.PREVIOUS_RELEASE = sh(
                        script: '''
                            set -eu
                            expected_project="$PROD_PROJECT"
                            backend_container="${expected_project}-backend-1"
                            web_container="${expected_project}-web-1"
                            elasticsearch_container="${expected_project}-elasticsearch-1"

                            existing=0
                            running=0
                            for container in "$backend_container" "$web_container" "$elasticsearch_container"; do
                                if docker inspect "$container" >/dev/null 2>&1; then
                                    existing=$((existing + 1))
                                    if [ "$(docker inspect "$container" --format '{{.State.Running}}')" = 'true' ]; then
                                        running=$((running + 1))
                                    fi
                                fi
                            done

                            if [ "$existing" -ne 0 ] && [ "$existing" -ne 3 ]; then
                                echo "Inconsistent application container set: $existing/3 containers exist" >&2
                                exit 1
                            fi
                            if [ "$running" -ne 0 ] && [ "$running" -ne 3 ]; then
                                echo "Inconsistent running application container set: $running/3 containers are running" >&2
                                exit 1
                            fi
                            if [ "$running" -eq 0 ]; then
                                printf 'none\n'
                                exit 0
                            fi

                            for container in "$backend_container" "$web_container" "$elasticsearch_container"; do
                                test "$(docker inspect "$container" --format '{{index .Config.Labels "com.docker.compose.project"}}')" = "$expected_project"
                            done

                            backend_image="$(docker inspect "$backend_container" --format '{{.Config.Image}}')"
                            web_image="$(docker inspect "$web_container" --format '{{.Config.Image}}')"
                            elasticsearch_image="$(docker inspect "$elasticsearch_container" --format '{{.Config.Image}}')"

                            case "$backend_image" in csforge-backend:*) ;; *) echo "Unexpected backend image: $backend_image" >&2; exit 1 ;; esac
                            case "$web_image" in csforge-frontend:*) ;; *) echo "Unexpected web image: $web_image" >&2; exit 1 ;; esac
                            case "$elasticsearch_image" in csforge-elasticsearch:*) ;; *) echo "Unexpected Elasticsearch image: $elasticsearch_image" >&2; exit 1 ;; esac

                            backend_release="${backend_image#csforge-backend:}"
                            web_release="${web_image#csforge-frontend:}"
                            elasticsearch_release="${elasticsearch_image#csforge-elasticsearch:}"
                            if [ "$backend_release" != "$web_release" ] || [ "$backend_release" != "$elasticsearch_release" ]; then
                                echo "Application containers use different releases: backend=$backend_release web=$web_release elasticsearch=$elasticsearch_release" >&2
                                exit 1
                            fi

                            printf '%s\n' "$backend_release"
                        ''',
                        returnStdout: true
                    ).trim()
                }
                sh '''
                    set -eu
                    echo "Deploying release: $CSFORGE_RELEASE"
                    echo "Previous release: $PREVIOUS_RELEASE"
                '''
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
                        expected_backend_image="csforge-backend:$CSFORGE_RELEASE"
                        expected_web_image="csforge-frontend:$CSFORGE_RELEASE"
                        expected_elasticsearch_image="csforge-elasticsearch:$CSFORGE_RELEASE"

                        echo "Deploying release: $CSFORGE_RELEASE"
                        echo "Previous release: $PREVIOUS_RELEASE"

                        if docker inspect "$postgres_container" >/dev/null 2>&1; then
                            test "$(docker inspect "$postgres_container" --format '{{index .Config.Labels "com.docker.compose.project"}}')" = "$expected_project"
                            mounted_volume="$(docker inspect "$postgres_container" --format '{{range .Mounts}}{{if eq .Destination "/var/lib/postgresql/data"}}{{.Name}}{{end}}{{end}}')"
                            test "$mounted_volume" = "$postgres_volume"
                            volume_before="$mounted_volume"
                            echo "Existing PostgreSQL container uses canonical volume: $postgres_volume"
                        else
                            echo 'No existing PostgreSQL container; proceeding with fresh/recreated container deployment.'
                            if docker volume inspect "$postgres_volume" >/dev/null 2>&1; then
                                volume_before="$postgres_volume"
                                echo "Existing canonical PostgreSQL volume will be reused: $postgres_volume"
                            else
                                volume_before='none'
                                echo "Canonical PostgreSQL volume will be created by Compose: $postgres_volume"
                            fi
                        fi

                        echo "Compose project: $expected_project"
                        docker compose -f compose.prod.yaml up -d --no-build --pull never

                        check_application_container() {
                            container="$1"
                            expected_image="$2"
                            test "$(docker inspect "$container" --format '{{index .Config.Labels "com.docker.compose.project"}}')" = "$expected_project"
                            actual_image="$(docker inspect "$container" --format '{{.Config.Image}}')"
                            test "$actual_image" = "$expected_image"
                            echo "Post-deploy image: $actual_image"
                        }
                        check_application_container "${expected_project}-backend-1" "$expected_backend_image"
                        check_application_container "${expected_project}-web-1" "$expected_web_image"
                        check_application_container "${expected_project}-elasticsearch-1" "$expected_elasticsearch_image"

                        test "$(docker inspect "$postgres_container" --format '{{index .Config.Labels "com.docker.compose.project"}}')" = "$expected_project"
                        mounted_volume="$(docker inspect "$postgres_container" --format '{{range .Mounts}}{{if eq .Destination "/var/lib/postgresql/data"}}{{.Name}}{{end}}{{end}}')"
                        test "$mounted_volume" = "$postgres_volume"
                        if [ "$volume_before" != 'none' ]; then
                            test "$mounted_volume" = "$volume_before"
                        fi
                        docker volume inspect "$postgres_volume" >/dev/null
                        echo "PostgreSQL canonical volume before deploy: $volume_before"
                        echo "Post-deploy PostgreSQL canonical volume: $mounted_volume"
                    '''
                }
            }
        }

        stage('Readiness Wait') {
            steps {
                withCredentials([string(credentialsId: env.POSTGRES_PASSWORD_CREDENTIAL_ID, variable: 'POSTGRES_PASSWORD')]) {
                    sh '''
                        set -eu
                        echo "Readiness release: $CSFORGE_RELEASE"
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
                        echo "Smoke release: $CSFORGE_RELEASE"
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

        stage('Active Release Verification') {
            steps {
                withCredentials([string(credentialsId: env.POSTGRES_PASSWORD_CREDENTIAL_ID, variable: 'POSTGRES_PASSWORD')]) {
                    sh '''
                        set -eu
                        expected_project="$PROD_PROJECT"
                        expected_backend_image="csforge-backend:$CSFORGE_RELEASE"
                        expected_web_image="csforge-frontend:$CSFORGE_RELEASE"
                        expected_elasticsearch_image="csforge-elasticsearch:$CSFORGE_RELEASE"

                        verify_active_image() {
                            container="$1"
                            expected_image="$2"
                            test "$(docker inspect "$container" --format '{{index .Config.Labels "com.docker.compose.project"}}')" = "$expected_project"
                            actual_image="$(docker inspect "$container" --format '{{.Config.Image}}')"
                            test "$actual_image" = "$expected_image"
                            printf '%s\n' "${actual_image#*:}"
                        }

                        backend_release="$(verify_active_image "${expected_project}-backend-1" "$expected_backend_image")"
                        web_release="$(verify_active_image "${expected_project}-web-1" "$expected_web_image")"
                        elasticsearch_release="$(verify_active_image "${expected_project}-elasticsearch-1" "$expected_elasticsearch_image")"
                        test "$backend_release" = "$CSFORGE_RELEASE"
                        test "$web_release" = "$CSFORGE_RELEASE"
                        test "$elasticsearch_release" = "$CSFORGE_RELEASE"
                        test "$backend_release" = "$web_release"
                        test "$backend_release" = "$elasticsearch_release"
                        echo "Active release after deploy: $backend_release"
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
