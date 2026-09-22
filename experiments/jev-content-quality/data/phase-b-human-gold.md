# Phase B Human Gold freeze

Date: 2026-09-22

Source main: `0f254ccdac91d480cdcde65d22ca9e6bc30b23c0`

Phase B uses 120 current MULTIPLE_CHOICE Questions after excluding every contentKey used by Phase A, Phase A.1, or Phase A.2. Jev output was not observed when the sample or Human Gold was frozen.

## Contract

- Criterion: `weak_distractor` only
- Positive: 28
- Negative: 92
- No synthetic defects
- No class balancing
- Positive severity: P1
- Negative severity: NONE
- Rubric V2 wording remains unchanged

A positive means at least one incorrect option is not a plausible misconception or realistic same-topic mistake because it is materially unrelated, obviously absurd, or makes the correct answer selectable by trivial elimination. An option is not positive merely because it is false.

## Positive Human Gold

### Java — 10

- `java.core.coding-tests.priorityqueue-coding-tests.q3`
- `java.core.concurrency.concurrent-collections.q1`
- `java.core.concurrency.locks-reentrantlock-condition.q4`
- `java.core.exceptions-resources.autocloseable-resource-ownership.q4`
- `java.core.io-nio.byte-character-stream-charset.q2`
- `java.core.jvm-runtime.classloader-delegation-type-identity.q6`
- `java.core.language-types.pass-by-value.q1`
- `java.core.modern-language.local-variable-type-inference-var.q2`
- `java.core.object-model.composition-collaboration.q3`
- `java.core.time-numeric.duration-period.q2`

### Spring — 4

- `spring.core.config.configuration-binding.q1`
- `spring.core.mvc.argument-resolver.q1`
- `spring.core.scope-lifecycle.scopes.q1`
- `spring.core.why.coupling.q1`

### Database — 1

- `database.core.replication.primary-replica.q2`

### Backend Engineering — 0

No selected current question crossed the frozen weak-distractor criterion. This zero-positive stratum is preserved rather than rebalanced.

### Operating Systems — 4

- `operating-systems.core.io.async-io.q1`
- `operating-systems.core.ipc.pipe.q1`
- `operating-systems.core.isolation.cgroup.q1`
- `operating-systems.core.isolation.process-isolation.q1`

### Network & HTTP — 9

- `network-http.core.dns.ns-mx.q1`
- `network-http.core.http-message.content-length-transfer.q1`
- `network-http.core.http-state-intermediary.set-cookie.q1`
- `network-http.core.http-versions.http3.q1`
- `network-http.core.ip-routing.ttl-hop-limit.q1`
- `network-http.core.layering.mtu.q1`
- `network-http.core.request-journey.host-authority.q1`
- `network-http.core.tcp.rto.q1`
- `network-http.core.tcp.time-wait.q1`

All other 92 frozen rows are Human-Gold negative. Their incorrect choices were judged to remain sufficiently topic-adjacent misconceptions or realistic mistakes under the Rubric V2 definition.

## Evaluation

No threshold is selected from Phase B. After one raw run, evaluate ranking quality and practical review budgets at 10%, 20%, 30%, 40%, and 50%. Changing the rubric or labels after seeing Phase B results consumes this dataset for future final-evaluation claims.
