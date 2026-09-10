FROM eclipse-temurin:25-jdk AS builder

WORKDIR /workspace/backend

COPY backend/gradlew .
COPY backend/gradle gradle
COPY backend/build.gradle backend/settings.gradle backend/gradle.properties ./

RUN sed -i 's/\r$//' gradlew \
    && chmod +x gradlew

COPY backend/src src
COPY content ../content

RUN ./gradlew bootJar --no-daemon


FROM eclipse-temurin:25-jre AS runtime

WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends --yes curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder --chown=10001:10001 \
    /workspace/backend/build/libs/csforge-backend-0.0.1-SNAPSHOT.jar \
    /app/app.jar

USER 10001:10001

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
