FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache ca-certificates
COPY --from=build /app/target/*.jar app.jar
ENV SPRING_PROFILES_ACTIVE=cloud
ENV JAVA_OPTS="-Xms128m -Xmx384m -XX:+UseSerialGC -XX:MaxRAM=512m"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
