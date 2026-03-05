# WordPocket SRS (간격 반복) 시스템 정리

## 카드 상태 (card_states.status)

| 상태 | 의미 | UI 라벨 |
|------|------|---------|
| `new` | 한 번도 학습하지 않은 카드 | 새 단어 |
| `learning` | 학습 중 (단기 반복 단계) | 학습중 |
| `review` | 졸업한 카드 (일 단위 복습 주기) | 학습중 (interval<21) / 암기 완료 (interval≥21) |
| `suspended` | 거머리 카드 (lapse가 임계치 도달) | - |

## 핵심 필드

| 필드 | 설명 |
|------|------|
| `ease_factor` | 난이도 계수 (기본 2.5, 최소 1.3) |
| `interval` | 다음 복습까지의 일수 (learning 중엔 0) |
| `due_date` | 다음 복습 예정 시각 |
| `step_index` | learning 단계 인덱스 (learning_steps 배열 기준) |
| `lapse_count` | review → again 누적 횟수 |

## 사용자 설정 (user_settings) 기본값

| 설정 | 기본값 | 설명 |
|------|--------|------|
| `new_cards_per_day` | 20 | 하루 새 카드 최대 수 |
| `learning_steps` | `{1, 10}` | 학습 단계별 대기 시간 (분) |
| `graduating_interval` | 1 | good 졸업 시 복습 간격 (일) |
| `easy_interval` | 4 | easy 졸업 시 복습 간격 (일) |
| `max_interval` | 365 | 최대 복습 간격 (일) |
| `leech_threshold` | 5 | 이 횟수 이상 lapse하면 suspended |

## 학습일 기준

**새벽 4시 (KST)** 기준으로 하루를 나눔.
- 예: 3/5 04:00 KST ~ 3/6 03:59 KST = 같은 학습일

## 응답별 SM-2 로직

### new / learning 상태일 때

| 응답 | 결과 |
|------|------|
| **again** | → learning, step_index=0, due=now+1분 |
| **hard** | → learning, 같은 step 유지, due=now+현재step분 |
| **good** | 마지막 step이면 → **review 졸업** (interval=1일), 아니면 → 다음 step으로 이동 |
| **easy** | → **review 즉시 졸업** (interval=4일, ease+0.15) |

> `learning_steps = {1, 10}` 기준:
> - step 0 → 1분 후 복습
> - step 1 → 10분 후 복습
> - step 1에서 good → 졸업 (review 상태, 1일 뒤 복습)

### review 상태일 때

| 응답 | interval 계산 | ease 변화 |
|------|--------------|-----------|
| **again** | → learning으로 강등, interval=1, lapse+1 | ease - 0.2 |
| **hard** | interval × 1.2 | ease - 0.15 |
| **good** | interval × ease_factor | 변화 없음 |
| **easy** | interval × ease_factor × 1.3 | ease + 0.15 |

- review 상태에서 interval > 2일이면 **±5% fuzz** 적용 (같은 카드끼리 복습일 분산)
- lapse_count ≥ leech_threshold(5) → **suspended** 처리

## 학습 큐 (get_study_queue) 조건

DeckPage에서 "전체 학습" / "오늘 복습" 버튼을 보여주는 기준이 됨.

### 큐에 포함되는 카드 (우선순위 순):

1. **새 카드** (`status = 'new'`)
   - 하루 한도(new_cards_per_day) 내에서만
   - 오늘 이미 학습한 새 카드 수를 차감
2. **학습 중** (`status = 'learning' AND due_date <= now()`)
   - **due_date가 현재 시각을 지나야** 큐에 포함됨
   - again → 1분 뒤, good → 10분 뒤 등 설정된 시간이 지나야 함
3. **복습 카드** (`status = 'review' AND due_date <= now()`)
   - 복습 예정일이 지난 카드만

### 큐에 포함되지 않는 카드:

- `due_date`가 아직 미래인 learning 카드 (예: 10분 대기 중)
- `due_date`가 아직 미래인 review 카드 (예: 내일 복습 예정)
- `suspended` 상태 카드
- 하루 한도를 초과한 new 카드

## 버튼 표시 조건 (DeckPage)

```
studyableCount = get_study_queue 결과 수 (new + learning(due) + review(due))
reviewableCount = 위에서 queue_type ≠ 'new'인 것만 필터

전체 학습 버튼: studyableCount > 0
오늘 복습 버튼: reviewableCount > 0
둘 다 0이면: 버튼 미표시 → "오늘의 학습을 끝냈어요!" 배너
```

## 흔한 시나리오

### "학습중인데 버튼이 안 보여요"
카드가 `learning` 상태이지만 `due_date`가 아직 안 지남.
예: again을 눌러서 1분 뒤 복습 예정 → 1분이 지나야 큐에 잡힘.
세션 중에는 클라이언트가 재큐잉하므로 문제없지만, 세션 종료 후 다시 들어오면 대기 시간이 지나야 나타남.

### "학습 완료 후 다시 들어왔는데 버튼이 없어요"
모든 카드가 good/easy로 졸업 → review 상태, due_date가 1일~N일 뒤.
또는 learning 카드의 due_date가 아직 수 분 뒤.
→ 정상 동작. 시간이 지나면 다시 나타남.
