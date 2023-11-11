---
title : Docker를 이용해 Nginx 실행 후 화면 수정해보기
date : 2022-08-19 00:00:00 +09:00
categories : [Cloud, Docker, Nginx]
tags : [Cloud, Docker, Nginx]
---
## Nginx In Docker

```shell
# 8080 > 80 port 포워
$ docker run --name nginx -p 8080:80 -d nginx

# docker check
$ docker ps

# docker 접속
$ docker exec -it nginx /bin/bash

# 수정을 위한 vim 설치
$ apt-get update
$ apt-get install vim

# 수정할 파일 위치
$ cd /usr/share/nginx/html
$ vim index.html
```



