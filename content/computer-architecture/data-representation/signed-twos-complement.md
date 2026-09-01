---
kind: concept
contentKey: computer-architecture.core.data-representation.signed-twos-complement
topicContentKey: computer-architecture.core.data-representation
slug: signed-twos-complement
title: "Signed and Two's Complement"
summary: "같은 bit pattern의 signed 해석과 two's complement 규칙을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html"
    title: "Computer Architecture: Number Systems"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "고정 폭 정수와 수 표현의 기초를 확인한다."
    displayOrder: 1
---
# Signed and Two's Complement

### 하나의 bit pattern, 두 해석

8-bit `1111 1111`은 unsigned로 255지만 two's complement signed로 -1이다. hardware는 별도의 부호 bit를 저장하기보다 같은 adder 회로를 사용하고, 최상위 bit를 부호와 범위 해석에 사용한다. 음수는 bit를 뒤집고 1을 더해 만들며 표현 범위는 `-2^(n-1)`부터 `2^(n-1)-1`이다.

이 표현은 0이 하나이고 덧셈 회로를 공유한다는 장점이 있지만, 최솟값을 양수로 뒤집을 수 없고 widening 때 sign extension이 필요하다. 같은 memory를 읽는 코드라도 signed/unsigned cast 시점이 다르면 비교와 shift 결과가 달라진다.

### Backend 연결

길이·offset·checksum을 signed 정수로 처리하면 음수 입력이 큰 양수처럼 바뀌거나 범위 검사가 우회될 수 있다. wire field를 읽을 때는 폭, signedness, widening 순서를 명시하고 경계값을 테스트한다.

