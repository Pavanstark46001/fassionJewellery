# --- Build stage -----------------------------------------------------------
# Uses the official Maven image (not the ./mvnw wrapper) so the build doesn't
# depend on wrapper/shell compatibility inside a minimal base image - the
# image tag itself already pins the exact Maven + JDK versions.
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Leverage Docker layer caching: resolve dependencies before copying source
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src src
RUN mvn -B clean package -DskipTests

# --- Run stage ---------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS run
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8090
ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
