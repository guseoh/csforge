pipeline {
    agent any

    environment {
        JENKINS_CONTAINER = 'csforge-jenkins-jenkins-1'
        JAVA_BUILD_IMAGE = 'eclipse-temurin:25-jdk'
        NODE_BUILD_IMAGE = 'node:22.14.0-bookworm-slim'
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
                      --volumes-from "$JENKINS_CONTAINER" \
                      --volume /var/run/docker.sock:/var/run/docker.sock \
                      --workdir "$WORKSPACE/backend" \
                      "$JAVA_BUILD_IMAGE" \
                      sh -c 'sed -i "s/\\r$//" gradlew && chmod +x gradlew && java -version && ./gradlew test --no-daemon --console=plain && ./gradlew bootJar --no-daemon'
                '''
            }
        }

        stage('Frontend Validation') {
            steps {
                sh '''
                    set -eu
                    docker run --rm \
                      --volumes-from "$JENKINS_CONTAINER" \
                      --workdir "$WORKSPACE/frontend" \
                      "$NODE_BUILD_IMAGE" \
                      sh -c 'node --version && npm --version && rm -rf node_modules && npm ci && npm run lint && npm test && npm run build && rm -rf node_modules'
                '''
            }
        }

        stage('Compose Validation') {
            steps {
                sh '''
                    set -eu
                    export POSTGRES_PASSWORD=jenkins-disposable-validation-secret
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
    }

    post {
        always {
            sh '''
                set +e
                docker ps --format '{{.Names}}' | grep -E '^(testcontainers|.*kafka.*|.*elasticsearch.*)$' || true
            '''
        }
    }
}
