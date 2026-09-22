# Curriculum Foundations

이 디렉터리는 CSForge V1의 15개 LearningArea에 대한 Curriculum foundation을 보관한다.
`content/curriculum/*.yaml`은 콘텐츠 작성, 계획, 검토를 위한 source이며 runtime 설정,
import 입력, DB schema, application configuration이 아니다. 이 YAML을 소비하기 위한
backend/frontend 기능이나 runtime parser를 추가하지 않는다.

## Source priority

공통 authoring rule은 다음 순서로 따른다.

1. `content/AGENTS.md`
2. `content/README.md`

각 Area YAML은 이 공통 계약 안에서 Area별 범위, 경계, 학습 계획을 구체화한다. Area별
정책은 Java, Database, Security처럼 서로 다를 수 있지만 공통 계약과 충돌해서는 안 된다.

## Common metadata

- **Topic**: 한 LearningArea 안에서 함께 탐색하고 검토할 학습 책임의 묶음이다.
- **Concept**: 하나의 주된 Learning Objective를 가진 canonical 학습 단위다.
- **level**: Concept가 요구하는 이해와 추론의 깊이다. Question difficulty와는 독립적이다.
- **objective**: 학습자가 설명하거나 판단할 수 있어야 하는 검증 가능한 학습 목표다.
- **density**: 목표를 충분히 설명하는 데 필요한 상대적 콘텐츠 밀도다. Question 수 quota가 아니다.
- **visualization**: 관계, 상태, 실행 순서를 더 명확히 보여 주기 위한 작성 계획이다.
- **prerequisites**: 현재 Concept 이해에 실제로 필요한 선행 Concept만 선택적으로 기록한다.

Topic의 `order`와 Concept의 `order`는 기본 탐색·작성 순서다. Topic을 선형 강의 코스로
만들지 않으며 실제 선행 관계는 필요한 경우에만 `prerequisites`로 표현한다.

## Question policy

Concept별 고정 Question 수는 없고, 모든 Concept에 EASY/MEDIUM/HARD를 강제하지 않으며,
특정 Question type도 기본값으로 강제하지 않는다. Question 수, 유형, 난이도는 Learning
Objective를 실제로 검증하도록 결정하고 Topic과 LearningArea 전체에서 coverage를 검토한다.

`HARD`는 코드 실행, 상태 변화, 시간 순서, 장애 조건, 제약 또는 trade-off에 대한 실제
추론을 요구해야 한다. `MULTIPLE_CHOICE`를 사용할 때 distractor는 같은 주제에서 실제로
헷갈릴 수 있는 plausible misconception이어야 한다.

## Identity stability

Area key, Topic key, Concept `contentKey`는 canonical identity다. 이미 부여된 key를 다른
의미로 재사용하거나 임의로 변경하지 않는다. 하나의 Concept는 정확히 하나의 primary
Topic 아래에 두며, Area별 version/source policy 같은 특수 규칙은 해당 Area YAML에 둔다.
