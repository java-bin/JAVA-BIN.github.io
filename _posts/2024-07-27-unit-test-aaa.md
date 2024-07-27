---
title : Unit Test (AAA)
date : 2024-07-27 00:00:04 +09:00
categories : [Go, Unit Test, AAA]
tags : [Go, Unit Test, Arrange, Act, Assert]
---

## Arrange / Act / Assert Unit Test

### go test 방법
```bash
# directory
go test
# 하위 모든 directory
go test ./... 
```

### Example
```go
// Go의 경우 앞에 Test~~를 붙여 줘야하고 (t *testing.T) 를 입력해 주어야 한다.
// file의 이름 경우도 file_test.go로 해주어야 한다
func TestFunctionName(t *testing.T) {
	// Arrange
	기본 정의

	// Act
	테스트 하려는 함수 호출

	// Assert
	assert를 이용한 응답값 검증

}
```