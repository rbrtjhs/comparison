FROM eclipse-temurin:20.0.2_9-jre-alpine

WORKDIR /app

COPY target/comparison-0.0.1-SNAPSHOT.jar /app

EXPOSE 8080

ENTRYPOINT ["java","-jar","--enable-preview", "./comparison-0.0.1-SNAPSHOT.jar"]
