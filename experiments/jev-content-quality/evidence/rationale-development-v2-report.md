# Rationale quality development result

Rubric: rationale-quality-v2; model requested: jev-1.13.0; scoring: max of three probabilities.
Ranking uses stable caseId as tie-breaker. Budgets use ceil(n × 10/20/30%). ROC-AUC uses pairwise ties as 0.5.
Criterion FP/FN uses 0.5 only as a diagnostic threshold, not an operational policy.
Copy exclusion is deterministic before provider call. Cost uses the historical harness input-token assumption of $0.042/M; actual billing is unavailable.

Cases: 27; evaluated: 27; copy excluded: 0; errors: 0.
Tokens: input 25761, output 1890; estimated input cost: $0.001082; latency p50/p95: 287/824 ms.

| Set | n | positive | AUC | 10% recall / precision / lift | 20% recall / precision / lift | 30% recall / precision / lift |
| --- | ---: | ---: | ---: | --- | --- | --- |
| natural | 15 | 0 | N/A | N/A / 0.000 / N/A | N/A / 0.000 / N/A | N/A / 0.000 / N/A |
| historical | 6 | 3 | 0.889 | 0.333 / 1.000 / 2.000 | 0.667 / 1.000 / 2.000 | 0.667 / 1.000 / 2.000 |
| synthetic | 6 | 3 | 1.000 | 0.333 / 1.000 / 2.000 | 0.667 / 1.000 / 2.000 | 0.667 / 1.000 / 2.000 |

| Source | Criterion | gold positives | FP at 0.5 | FN at 0.5 | AUC |
| --- | --- | ---: | ---: | ---: | ---: |
| natural | choice_rationale_misalignment | 0 | 0 | 0 | N/A |
| natural | choice_rationale_conflict | 0 | 0 | 0 | N/A |
| natural | choice_rationale_shallow | 0 | 0 | 0 | N/A |
| historical | choice_rationale_misalignment | 1 | 1 | 1 | 0.800 |
| historical | choice_rationale_conflict | 2 | 0 | 1 | 0.563 |
| historical | choice_rationale_shallow | 0 | 0 | 0 | N/A |
| synthetic | choice_rationale_misalignment | 1 | 0 | 1 | 1.000 |
| synthetic | choice_rationale_conflict | 1 | 0 | 0 | 1.000 |
| synthetic | choice_rationale_shallow | 1 | 0 | 0 | 1.000 |

## Case diagnostics

| Case | Source | Gold | Score | Probabilities M/C/S | Status |
| --- | --- | --- | ---: | --- | --- |
| natural-backend-engineering-0 | natural | none | 0.290 | 0.080 / 0.050 / 0.290 | evaluated |
| natural-cache-0 | natural | none | 0.210 | 0.100 / 0.100 / 0.210 | evaluated |
| natural-computer-architecture-0 | natural | none | 0.170 | 0.110 / 0.100 / 0.170 | evaluated |
| natural-database-0 | natural | none | 0.230 | 0.120 / 0.230 / 0.190 | evaluated |
| natural-distributed-systems-0 | natural | none | 0.240 | 0.110 / 0.120 / 0.240 | evaluated |
| natural-dsa-0 | natural | none | 0.240 | 0.140 / 0.220 / 0.240 | evaluated |
| natural-infrastructure-cloud-0 | natural | none | 0.190 | 0.100 / 0.120 / 0.190 | evaluated |
| natural-java-1 | natural | none | 0.240 | 0.070 / 0.040 / 0.240 | evaluated |
| natural-messaging-async-0 | natural | none | 0.170 | 0.110 / 0.060 / 0.170 | evaluated |
| natural-network-http-0 | natural | none | 0.290 | 0.130 / 0.260 / 0.290 | evaluated |
| natural-operating-systems-0 | natural | none | 0.250 | 0.110 / 0.120 / 0.250 | evaluated |
| natural-performance-observability-operations-0 | natural | none | 0.180 | 0.110 / 0.080 / 0.180 | evaluated |
| natural-security-0 | natural | none | 0.300 | 0.110 / 0.280 / 0.300 | evaluated |
| natural-spring-0 | natural | none | 0.190 | 0.170 / 0.080 / 0.190 | evaluated |
| natural-system-design-0 | natural | none | 0.280 | 0.170 / 0.250 / 0.280 | evaluated |
| history-0-before | historical | choice_rationale_misalignment | 0.380 | 0.230 / 0.200 / 0.380 | evaluated |
| history-0-after | historical | none | 0.260 | 0.140 / 0.100 / 0.260 | evaluated |
| history-1-before | historical | choice_rationale_conflict | 0.700 | 0.590 / 0.700 / 0.270 | evaluated |
| history-1-after | historical | none | 0.200 | 0.110 / 0.070 / 0.200 | evaluated |
| history-2-before | historical | choice_rationale_conflict | 0.220 | 0.050 / 0.040 / 0.220 | evaluated |
| history-2-after | historical | none | 0.210 | 0.070 / 0.040 / 0.210 | evaluated |
| synthetic-0-original | synthetic | none | 0.190 | 0.100 / 0.080 / 0.190 | evaluated |
| synthetic-0-edited | synthetic | choice_rationale_misalignment | 0.360 | 0.360 / 0.310 / 0.260 | evaluated |
| synthetic-1-original | synthetic | none | 0.160 | 0.110 / 0.090 / 0.160 | evaluated |
| synthetic-1-edited | synthetic | choice_rationale_conflict | 0.920 | 0.190 / 0.920 / 0.470 | evaluated |
| synthetic-2-original | synthetic | none | 0.200 | 0.100 / 0.130 / 0.200 | evaluated |
| synthetic-2-edited | synthetic | choice_rationale_shallow | 0.800 | 0.180 / 0.220 / 0.800 | evaluated |
