---
title : CentOS7 환경에서 Docker를 이용해 jar 파일 띄우기
date : 2020-08-06 00:00:00 +09:00
categories : [Linux, Docker]
tags : [Linux, Docker]
---
## CentOS7 환경에서 Docker를 이용해 spring-music.jar 파일 띄워보기

### JDK8 Install In Linux
```shell
# CentOS
$ yum install java-1.8.0-openjdk-devel.x86\_64
# Ubuntu
$  apt-get install openjdk-8-jdk
```

### spring-music install from github
```shell
# git install
$ yum install git -y
# spring-music install
$ git clone https://github.com/fabianlee/spring-music.git

$ cd spring-music

$  ./gradlew clean assemble

...
BUILD SUCCESSFUL
```

### start spring-music.jar
```shell
# 실행이 되는지 확인
$ java -jar build/libs/spring-music.jar
```

### Dockerfile create
```shell
# Dockerfile
FROM openjdk:8-jdk-alpine
VOLUME /tmp
ARG JAR_FILE=build/libs/spring-music.jar
COPY ${JAR_FILE} app.jar
EXPOSE 8080
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]
```

### docker image build
```shell
# docker image build
$ docker build -t my-springmusic .
# docker image check
$ docker images
# docker run
$ docker run -d -i -t -p 8080:8080 my-springmusic
```

check http://localhost:8080

