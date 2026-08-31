---
kind: concept
contentKey: computer-architecture.core.data-representation.fixed-width-overflow
topicContentKey: computer-architecture.core.data-representation
slug: fixed-width-overflow
title: "Fixed-Width Arithmetic and Overflow"
summary: "고정 폭 연산의 overflow와 wraparound를 추론한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html"
    title: "Computer Architecture: Number Systems"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "고정 폭 정수와 수 표현의 기초를 확인한다."
    displayOrder: 1
---
# Fixed-Width Arithmetic and Overflow

### 저장할 수 있는 폭의 경계

n-bit register의 결과가 표현 범위를 넘으면 상위 carry가 버려지거나 signed overflow가 발생한다. unsigned 8-bit에서 `255 + 1`은 bit pattern `0000 0000`으로 wrap하고, signed에서 같은 pattern은 0이다. 연산 수학의 결과와 register에 남은 결과를 구분해야 한다.

overflow flag는 hardware가 감지할 수 있지만 모든 instruction이 동일하게 예외를 발생시키는 것은 아니다. widening 후 계산하거나 범위 검사를 먼저 하는 방식은 overflow를 피할 수 있지만 register·memory 사용량과 변환 비용이 늘어난다.

### Backend 연결

페이지 수, 배열 길이, 파일 크기, timeout 계산에서 곱셈·덧셈의 폭을 먼저 확인한다. 입력 검증이 저장 이후에 있으면 이미 wrap한 값으로 allocation이나 loop가 결정될 수 있으므로 계산 전 검증과 명시적 wider type을 선택한다.

