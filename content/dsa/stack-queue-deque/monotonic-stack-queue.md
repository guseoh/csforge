---
kind: concept
contentKey: dsa.core.stack-queue-deque.monotonic-stack-queue
topicContentKey: dsa.core.stack-queue-deque
slug: monotonic-stack-queue
title: "Monotonic Stack and Queue"
summary: "단조 후보를 유지하며 각 원소가 한 번 제거되는 비용을 증명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "연속 저장과 pointer chaining의 trade-off를 확인한다."
    displayOrder: 1
---
# Monotonic Stack and Queue

monotonic stack은 새 값이 들어올 때 더 이상 답 후보가 아닌 뒤 원소를 pop해 오름차순 또는 내림차순을 유지한다. 한 원소는 push와 pop을 최대 한 번씩 하므로 각 연산의 최악이 O(n)이어도 전체 sequence는 O(n)이다. deque 기반 monotonic queue는 window가 이동할 때 만료 index도 앞에서 제거한다.

단조성 방향과 pop 조건을 잘못 고르면 nearest greater/maximum의 의미가 뒤집힌다. 값이 같은 원소를 유지할지 제거할지도 index와 중복 처리 결과를 바꾼다.

### Backend 연결

time-window maximum과 다음 이벤트 계산에서 candidate lifetime과 memory 상한을 함께 기록한다. 입력이 무한 stream이면 만료 조건이 없을 때 queue가 bounded가 아님을 명시한다.
