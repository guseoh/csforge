---
kind: concept
contentKey: dsa.core.greedy.interval-scheduling
topicContentKey: dsa.core.greedy
slug: interval-scheduling
title: "구간 스케줄링(Interval Scheduling)"
summary: "가장 빨리 끝나는 구간 선택이 최대 개수를 보장하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://web.stanford.edu/class/archive/cs/cs161/cs161.1138/handouts/120%20Guide%20to%20Greedy%20Algorithms.pdf"
    title: "A Guide to Greedy Algorithms"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "탐욕 선택, 교환 논증과 구간 스케줄링의 정확성 증명 구조를 확인한다."
    displayOrder: 1
---
# 구간 스케줄링(Interval Scheduling)

구간 스케줄링의 기본 문제는 서로 겹치지 않는 구간을 **가능한 많이** 선택하는 것이다. 각 구간에는 시작 시각과 종료 시각이 있고, 목표는 구간 길이의 합이나 우선순위의 합이 아니라 선택한 구간의 개수를 최대화하는 것이다.

탐욕 규칙은 현재 선택 가능한 구간 중 가장 빨리 끝나는 구간을 고르는 것이다. 선택한 구간의 종료 시각 이후에 시작하는 후보들 중 다시 가장 빨리 끝나는 구간을 선택하는 과정을 반복한다.

이 선택이 안전한 이유는 교환 논증으로 설명할 수 있다. 어떤 최적 스케줄의 첫 구간을 `o`, 탐욕 알고리즘이 고른 구간을 `g`라고 하자. 탐욕 규칙의 정의상 다음 관계가 성립한다.

```text
finish(g) <= finish(o)
```

따라서 최적 스케줄에서 `o`를 `g`로 바꿔도 원래 `o` 뒤에 들어갈 수 있던 구간들은 `g` 뒤에도 여전히 배치할 수 있다. 선택 개수가 줄지 않으므로 `g`를 포함하는 최적해가 존재한다.

첫 선택 이후에는 `g`와 겹치지 않는 구간들만 남은 같은 종류의 스케줄링 문제가 된다. 이 부분 문제에 같은 논리를 반복 적용하면 탐욕 알고리즘이 만든 전체 해가 최적임을 설명할 수 있다.

이 증명은 **겹치지 않는 구간의 개수 최대화**라는 목표에 대한 것이다. 각 구간에 가치가 있고 가치의 합을 최대화해야 하는 가중 구간 스케줄링처럼 목표가 바뀌면 같은 탐욕 규칙은 더 이상 최적을 보장하지 않을 수 있다.
