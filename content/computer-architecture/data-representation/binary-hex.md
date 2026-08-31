---
kind: concept
contentKey: computer-architecture.core.data-representation.binary-hex
topicContentKey: computer-architecture.core.data-representation
slug: binary-hex
title: "Binary and Hexadecimal"
summary: "binary bit pattern을 hexadecimal로 읽고 변환하는 방법을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html"
    title: "Computer Architecture: Number Systems"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "고정 폭 정수와 수 표현의 기초를 확인한다."
    displayOrder: 1
---
# Binary and Hexadecimal

### 네 bit를 한 자리로 읽기

binary는 각 자리가 한 bit의 상태를 그대로 보여 주지만 긴 bit pattern을 비교하기 어렵다. hexadecimal 한 자리는 정확히 네 bit를 표현하므로 `1010 0111`을 `0xA7`로 묶어 읽을 수 있다. 이 변환은 값을 바꾸는 연산이 아니라 같은 bit pattern의 표기만 바꾸는 과정이다.

높은 자리부터 네 bit씩 묶을 때 leading zero를 버리면 폭 정보가 사라질 수 있다. 예를 들어 8-bit `0000 0011`은 값 3이면서 wire field 폭 1 byte라는 사실도 가진다. 디버거의 `0xFF`는 signed byte에서 -1로 해석될 수 있으므로 표기와 타입 해석을 분리해야 한다.

### Backend 연결

hex dump, mask, permission bit, packet header를 읽을 때 먼저 field 폭과 signedness를 고정한다. 로그에 값만 남기지 말고 offset·width·endianness를 함께 기록해야 장애 분석에서 다른 해석을 피할 수 있다.

