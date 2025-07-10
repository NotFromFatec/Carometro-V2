FROM openjdk:21
WORKDIR /app
COPY target/demo-0.0.1-SNAPSHOT.jar app.jar
CMD bash -c '\
  while ! echo > /dev/tcp/mysql/3306 2>/dev/null; do \
    echo "Esperando MySQL..."; \
    sleep 3; \
  done; \
  java -jar app.jar'