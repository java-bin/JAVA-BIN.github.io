---
title : Linux Root
date : 2024-02-11 00:00:00 +09:00
categories : [Linux, Command]
tags : [Linux, Command]
---
## Linux 환경에서 루트 권한 부여하는 방법
root 계정 접속

### root password 설정
```bash
$ sudo passwd [userName]
```

### 1. 사용자 계정 추가
```bash
$ sudo adduser [userName]
```

### 2. sudoers 사용자 추가
```bash
$ sudo vi /etc/sudoers

$ [userName] ALL=(ALL:ALL) ALL
# prolinux ALL=(ALL:ALL) ALL
```

### 3. passwd 사용자 추가
```bash
$ sudo vi /etc/passwd
[userName]:x:0:0:[userName]:/home/[userName]/bin/bash
# prolinux:x:0:0:prolinux:/home/prolinux/bin/bash
```

### 4. group 사용자 추가
```bash
$ sudo vi /etc/group
root:x:0:[userName]
# root:x:0:prolinux
```

### 5. Check
```bash
su - [userName]
$ -> #
```
