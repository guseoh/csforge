FROM docker:28.5.1-cli AS docker-cli

FROM jenkins/jenkins:2.568.3-lts-jdk21

USER root

ARG DOCKER_COMPOSE_VERSION=2.40.0

COPY --from=docker-cli /usr/local/bin/docker /usr/local/bin/docker
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt

RUN apt-get update \
    && apt-get install --no-install-recommends --yes ca-certificates curl \
    && mkdir -p /usr/local/lib/docker/cli-plugins \
    && curl -fsSL \
        "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" \
        --output /usr/local/lib/docker/cli-plugins/docker-compose \
    && chmod +x /usr/local/lib/docker/cli-plugins/docker-compose \
    && jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt \
    && rm -rf /var/lib/apt/lists/*

USER jenkins
