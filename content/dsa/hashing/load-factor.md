---
kind: concept
contentKey: dsa.core.hashing.load-factor
topicContentKey: dsa.core.hashing
slug: load-factor
title: "부하율(Load Factor)"
summary: "저장된 항목 수와 버킷·슬롯 수의 비율이 충돌 비용과 크기 조정 필요성에 미치는 영향을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/34hash/"
    title: "Algorithms, 4th Edition: Hash Tables"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "해시 함수, 분리 연결법·선형 탐사, 부하율과 검색 비용을 확인한다."
    displayOrder: 1
---
# 부하율(Load Factor)

부하율은 해시 테이블이 사용 가능한 저장 위치에 비해 얼마나 많은 항목을 담고 있는지를 나타내는 비율이다.

```text
α = 저장된 항목 수 / 버킷(또는 슬롯) 수
```

같은 수의 항목을 저장해도 버킷이나 슬롯 수가 적으면 충돌이 이어지는 경로가 길어질 가능성이 커진다. 반대로 테이블을 크게 만들면 충돌 가능성을 낮추기 쉽지만 비어 있는 공간도 많아진다.

**분리 연결법(separate chaining)**에서는 한 버킷에 여러 항목을 둘 수 있으므로 `α > 1`도 가능하다. 해시 값이 고르게 분포한다고 가정하면 부하율은 버킷마다 연결된 항목 수가 어느 정도가 될지 생각하는 기준이 된다. **개방 주소법(open addressing)**에서는 항목이 테이블 슬롯에 직접 들어가므로 `α`가 1에 가까워질수록 빈 슬롯을 찾기 위한 탐사(probe)가 길어질 수 있다.

그래서 해시 테이블은 보통 부하율이 정한 임계값에 도달하면 용량을 늘린다. 임계값을 낮게 잡으면 충돌을 줄이기 쉽지만 더 많은 메모리를 사용하고, 높게 잡으면 공간 활용률은 좋아지지만 조회·삽입 과정에서 더 긴 연결이나 탐사를 감수할 수 있다.

부하율만으로 성능을 완전히 예측할 수는 없다. 해시 값의 분포가 나쁘면 낮은 부하율에서도 일부 버킷에 값이 몰릴 수 있다. **부하율은 충돌 비용과 메모리 사용 사이의 균형을 관리하는 핵심 상태 값**이다.
