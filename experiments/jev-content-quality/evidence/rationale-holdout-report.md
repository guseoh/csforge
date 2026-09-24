# Rationale quality holdout result

Rubric: rationale-quality-v2; model requested: jev-1.13.0; scoring: max of three probabilities.
Ranking uses stable caseId as tie-breaker. Budgets use ceil(n × 10/20/30%). ROC-AUC uses pairwise ties as 0.5.
Criterion FP/FN uses 0.5 only as a diagnostic threshold, not an operational policy.
Copy exclusion is deterministic before provider call. Cost uses the historical harness input-token assumption of $0.042/M; actual billing is unavailable.

Cases: 46; evaluated: 46; copy excluded: 0; errors: 0.
Tokens: input 44666, output 3220; estimated input cost: $0.001876; latency p50/p95: 252/631 ms.

| Set | n | positive | AUC | 10% recall / precision / lift | 20% recall / precision / lift | 30% recall / precision / lift |
| --- | ---: | ---: | ---: | --- | --- | --- |
| natural | 30 | 1 | 1.000 | 1.000 / 0.333 / 10.000 | 1.000 / 0.167 / 5.000 | 1.000 / 0.111 / 3.333 |
| historical | 4 | 2 | 0.750 | 0.500 / 1.000 / 2.000 | 0.500 / 1.000 / 2.000 | 0.500 / 0.500 / 1.000 |
| synthetic | 12 | 6 | 1.000 | 0.333 / 1.000 / 2.000 | 0.500 / 1.000 / 2.000 | 0.667 / 1.000 / 2.000 |

| Source | Criterion | gold positives | FP at 0.5 | FN at 0.5 | AUC |
| --- | --- | ---: | ---: | ---: | ---: |
| natural | choice_rationale_misalignment | 0 | 0 | 0 | N/A |
| natural | choice_rationale_conflict | 0 | 0 | 0 | N/A |
| natural | choice_rationale_shallow | 1 | 0 | 0 | 1.000 |
| historical | choice_rationale_misalignment | 1 | 0 | 1 | 0.667 |
| historical | choice_rationale_conflict | 1 | 0 | 1 | 1.000 |
| historical | choice_rationale_shallow | 0 | 0 | 0 | N/A |
| synthetic | choice_rationale_misalignment | 2 | 0 | 2 | 0.950 |
| synthetic | choice_rationale_conflict | 2 | 0 | 0 | 1.000 |
| synthetic | choice_rationale_shallow | 2 | 1 | 0 | 0.950 |

## Case diagnostics

| Case | Source | Gold | Score | Probabilities M/C/S | Status |
| --- | --- | --- | ---: | --- | --- |
| natural-backend-engineering-1 | natural | none | 0.180 | 0.050 / 0.030 / 0.180 | evaluated |
| natural-backend-engineering-2 | natural | none | 0.260 | 0.130 / 0.130 / 0.260 | evaluated |
| natural-cache-1 | natural | none | 0.250 | 0.080 / 0.050 / 0.250 | evaluated |
| natural-cache-2 | natural | none | 0.220 | 0.130 / 0.110 / 0.220 | evaluated |
| natural-computer-architecture-1 | natural | none | 0.210 | 0.050 / 0.030 / 0.210 | evaluated |
| natural-computer-architecture-2 | natural | none | 0.160 | 0.080 / 0.050 / 0.160 | evaluated |
| natural-database-1 | natural | none | 0.220 | 0.060 / 0.040 / 0.220 | evaluated |
| natural-database-2 | natural | none | 0.210 | 0.110 / 0.080 / 0.210 | evaluated |
| natural-distributed-systems-1 | natural | none | 0.160 | 0.050 / 0.030 / 0.160 | evaluated |
| natural-distributed-systems-2 | natural | none | 0.190 | 0.100 / 0.080 / 0.190 | evaluated |
| natural-dsa-1 | natural | none | 0.210 | 0.040 / 0.030 / 0.210 | evaluated |
| natural-dsa-2 | natural | none | 0.220 | 0.120 / 0.120 / 0.220 | evaluated |
| natural-infrastructure-cloud-1 | natural | none | 0.230 | 0.060 / 0.050 / 0.230 | evaluated |
| natural-infrastructure-cloud-2 | natural | none | 0.180 | 0.080 / 0.070 / 0.180 | evaluated |
| natural-java-0 | natural | choice_rationale_shallow | 0.530 | 0.170 / 0.050 / 0.530 | evaluated |
| natural-java-2 | natural | none | 0.210 | 0.090 / 0.110 / 0.210 | evaluated |
| natural-messaging-async-1 | natural | none | 0.190 | 0.060 / 0.050 / 0.190 | evaluated |
| natural-messaging-async-2 | natural | none | 0.170 | 0.110 / 0.060 / 0.170 | evaluated |
| natural-network-http-1 | natural | none | 0.220 | 0.060 / 0.050 / 0.220 | evaluated |
| natural-network-http-2 | natural | none | 0.190 | 0.120 / 0.120 / 0.190 | evaluated |
| natural-operating-systems-1 | natural | none | 0.310 | 0.090 / 0.040 / 0.310 | evaluated |
| natural-operating-systems-2 | natural | none | 0.190 | 0.100 / 0.100 / 0.190 | evaluated |
| natural-performance-observability-operations-1 | natural | none | 0.170 | 0.060 / 0.070 / 0.170 | evaluated |
| natural-performance-observability-operations-2 | natural | none | 0.280 | 0.120 / 0.100 / 0.280 | evaluated |
| natural-security-1 | natural | none | 0.150 | 0.070 / 0.050 / 0.150 | evaluated |
| natural-security-2 | natural | none | 0.360 | 0.120 / 0.360 / 0.250 | evaluated |
| natural-spring-1 | natural | none | 0.190 | 0.070 / 0.030 / 0.190 | evaluated |
| natural-spring-2 | natural | none | 0.200 | 0.090 / 0.160 / 0.200 | evaluated |
| natural-system-design-1 | natural | none | 0.180 | 0.050 / 0.030 / 0.180 | evaluated |
| natural-system-design-2 | natural | none | 0.210 | 0.110 / 0.070 / 0.210 | evaluated |
| history-3-before | historical | choice_rationale_misalignment | 0.330 | 0.070 / 0.050 / 0.330 | evaluated |
| history-3-after | historical | none | 0.270 | 0.070 / 0.030 / 0.270 | evaluated |
| history-4-before | historical | choice_rationale_conflict | 0.220 | 0.070 / 0.170 / 0.220 | evaluated |
| history-4-after | historical | none | 0.140 | 0.040 / 0.020 / 0.140 | evaluated |
| synthetic-3-original | synthetic | none | 0.190 | 0.150 / 0.090 / 0.190 | evaluated |
| synthetic-3-edited | synthetic | choice_rationale_misalignment | 0.490 | 0.460 / 0.490 / 0.300 | evaluated |
| synthetic-4-original | synthetic | none | 0.270 | 0.100 / 0.090 / 0.270 | evaluated |
| synthetic-4-edited | synthetic | choice_rationale_conflict | 0.950 | 0.180 / 0.950 / 0.680 | evaluated |
| synthetic-5-original | synthetic | none | 0.260 | 0.140 / 0.150 / 0.260 | evaluated |
| synthetic-5-edited | synthetic | choice_rationale_shallow | 0.730 | 0.350 / 0.220 / 0.730 | evaluated |
| synthetic-6-original | synthetic | none | 0.220 | 0.130 / 0.090 / 0.220 | evaluated |
| synthetic-6-edited | synthetic | choice_rationale_misalignment | 0.320 | 0.320 / 0.280 / 0.270 | evaluated |
| synthetic-7-original | synthetic | none | 0.160 | 0.090 / 0.090 / 0.160 | evaluated |
| synthetic-7-edited | synthetic | choice_rationale_conflict | 0.860 | 0.190 / 0.860 / 0.460 | evaluated |
| synthetic-8-original | synthetic | none | 0.240 | 0.140 / 0.240 / 0.240 | evaluated |
| synthetic-8-edited | synthetic | choice_rationale_shallow | 0.580 | 0.210 / 0.280 / 0.580 | evaluated |
