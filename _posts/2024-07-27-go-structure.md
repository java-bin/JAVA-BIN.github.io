---
title : Go Structure
date : 2024-07-27 00:00:02 +09:00
categories : [Go, Structure]
tags : [Go, Structure]
---

## Go 표준 프로젝트 레이아웃
참고 사이트
- [개인 블로그](https://www.clud.me/e980f1ca-ca3d-49c2-a066-c9b260a6d291)
- [go 공식 페이지](https://go.dev/doc/modules/layout)
- [Medium site](https://medium.com/evendyne/getting-started-with-go-project-structure-ab8814ded9c3)

### Go Strucutre
```bash
project-root-directory/ # project
    ├── cmd/ # 실행 파일 
    |   ├── app/
    |   |   └── main.go
    ├── internal/ # 외부에서 접근 불가능한 내부 파일
    |   ├── api/
    |   |   ├── http/ # http 접근 경로
    |   |   |   ├── admin/
    |   |   |   |   ├── admin.go
    |   |   |   |   ├── admin_test.go
    |   |   |   ├── middleware/ # 중간 미들웨어
    |   |   |   |   ├── middleware.go
    |   |   |   |   ├── middleware_test.go
    |   |   |   ├── server/ # 내부 서버
    |   |   |   |   ├── server.go
    |   |   |   |   ├── server_test.go
    |   |   |   |   └── router.go
    |   ├── config/ # 내부 config
    |   |   ├── config.go
    |   ├── util/ # 공통 유틸
    |   |   └── util.go
    ├── pkg/ # 외부에서 프로젝트를 참조하는 패키지
    |   ├── admin/
    |   |   ├── repository/
    |   |   |   ├── admin_repository.go
    |   |   |   ├── admin_repository_test.go
    |   |   ├── service/
    |   |   |   ├── admin_service.go
    |   |   |   └── admin_service_test.go
    |   |   ├── admin.go
    |   |   └── admin_test.go
    ├── scripts/ # 설치 스크립트
    |   ├── build.sh
    |   ├── run.sh
    |   ├── test.sh
    ├── deployment/ # IaaS / PaaS 컨테이너 관련 템플릿
    |   ├── Dockerfile
    |   ├── docker-compose.yml
    |   └── kubernetes.yml
    ├── .env
    ├── README.md # readme
    ├── go.mod # 종속성이 저장된다 
    └── go.sum
```

