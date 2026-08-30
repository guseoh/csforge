---
kind: concept
contentKey: java.core.collections-generics.arraylist-linked
topicContentKey: java.core.collections-generics
slug: arraylist-linked
title: ArrayList와 연결 구조의 실용적 선택
summary: 연속 배열 기반 리스트와 링크 기반 구조의 접근·삽입 비용을 맥락에 맞게 비교한다
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html"
    title: ArrayList API
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: ArrayList의 크기·접근·변경 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedList.html"
    title: LinkedList API
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 연결 리스트의 API 동작과 제한 확인
---
# ArrayList와 연결 구조

`ArrayList`는 내부적으로 크기를 늘릴 수 있는 배열을 사용합니다. 인덱스 접근이 빠르고 순차 순회가 CPU 캐시에 유리한 편이라 일반적인 리스트 용도에서 좋은 기본 선택입니다. 끝에 추가하는 작업은 충분한 용량이 있다는 전제에서 상각된 비용이 작지만, 중간 삽입·삭제는 뒤 원소를 이동시켜야 합니다.

연결 리스트는 노드가 이웃 노드를 참조하는 구조라 특정 노드 위치를 이미 알고 있을 때 연결을 바꾸는 작업에 의미가 있습니다. 하지만 인덱스 접근은 앞에서부터 노드를 따라가야 하고, 노드 객체와 포인터의 추가 비용이 있습니다. 따라서 “삽입이 항상 빠르다”라고 일반화하면 안 됩니다.

백엔드 요청 처리에서 단순히 순서 있는 결과를 모으고 순회한다면 `ArrayList`가 보통 읽기와 메모리 지역성에서 유리합니다. 실제 병목이 확인되지 않았다면 자료구조의 전설보다 접근 패턴과 측정 결과를 기준으로 선택합니다.
