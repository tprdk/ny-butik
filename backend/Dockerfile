FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw -q package -DskipTests 2>/dev/null || (apk add --no-cache maven && mvn -q package -DskipTests)

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S nybutik && adduser -S nybutik -G nybutik
COPY --from=builder /app/target/*.jar app.jar
USER nybutik
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
