FROM eclipse-temurin:25-jdk AS builder

WORKDIR /workspace

COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle gradle.properties ./

RUN sed -i 's/\r$//' gradlew \
    && chmod +x gradlew

COPY src src

RUN ./gradlew bootJar --no-daemon


FROM eclipse-temurin:25-jre AS runtime

WORKDIR /app

COPY --from=builder --chown=10001:10001 \
    /workspace/build/libs/csforge-backend-0.0.1-SNAPSHOT.jar \
    /app/app.jar

USER 10001:10001

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
