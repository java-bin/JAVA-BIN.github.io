---
title : ESXI Install In Bare Metal Server
date : 2024-02-05 00:00:00 +09:00
categories : [Cloud, ESXI]
tags : [Cloud, ESXI]
---

참고 페이지:
- [서버포럼](https://svrforum.com/svr/1038)

## 1. Prepare
- X300 (Mini PC)
- PC를 BIOS 1.72로 업데이트 할 USB
- esxi 6.7 Booting USB (Realtek 드라이버 포함된 iso)
   - 인터넷에서 Realtek 드라이버가 포함된 iso를 찾아야 한다


## 2. BIOS 업데이트 (필수)
1. 준비한 BIOS usb를 사용하여 BIOS를 업데이트 합니다
2. F2 또는 Del키를 눌러 BIOS 화면으로 들어갑니다
3. Tool → Instant Flash에서 설치
4. BIOS 준비 끝

## 3. ESXI Install
1. x300의 경우 Gigabit LAN (RealtekRTL8111H)
   - [DeskMini X300 베어본](https://www.asrock.com/nettop/AMD/DeskMini%20X300%20Series/index.kr.asp#Specification)
2. F2 또는 Del키를 눌러 바이오스 화면으로 들어갑니다.
3. Boot → Boot Option에서 USB로 실행
4. 자동설치  → (Enter) Continue → (F11) Accept and Continue
5. 설치할 위치 → SSD 선택 → (키보드) US Default → (F11) Install
5. 설치완료
6. USB 제거한 후 → Remove the Installation media before rebooting

7. 밑에 보이는 접속정보로 접속
   [KT의 경우 접속정보 -> http://172.30.1.254/ 롤 접속하여 서버 맥주소를 등록해주었다]
   - 맥주소 확인 F2
   [SKT의 경우 접속정보 -> http://192.168.45.1/ 롤 접속하여 서버 맥주소를 등록해주었다]
   

