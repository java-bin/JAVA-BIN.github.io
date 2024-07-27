---
title : Java Annotation 정리
date : 2023-11-12 00:00:00 +09:00
categories : [Java, Annotation]
tags : [Java, Annotation]
---
## 생각날 때 마다 추가하는 Java Annotation

@Bean
- 빈으로 등록해 준다. Class에 붙인다 

@Log4j
- log.info()를 사용하여 log를 볼 수 있게 해 줌 

@Controller
- 컨트롤러를 스프링 빈으로 인식할 수 있게 해준다 (@Component를 포함한다)

@RequestMapping [@GetMapping / @PostMapping]
- HTTP로 들어오는 url 주소와 매핑된다

@PathVariable
- url 주소에 들어오는 파라미터 값을 받을 수 있게 해 준다

@RequestBody
- 프론트에서 넘어오는 body 값을 받을 수 있다

@Service
- 비즈니스 영역을 담당하는 객체임을 표시하기 위해 사용

@Repository
- DB관련 로직을 처리하며, JPA 등은 명칭이 조금 다르다

@AllArgsConstructor
- 모든 파라미터를 이용하는 생성자를 만들어 

@RequestMapping("/path")
- Controller 상단에 위치하며, Controller 영역에서 경로 매핑

