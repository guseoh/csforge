# Rationale quality development result

Rubric: rationale-quality-v1; model requested: jev-1.13.0; scoring: max of three probabilities.
Ranking uses stable caseId as tie-breaker. Budgets use ceil(n × 10/20/30%). ROC-AUC uses pairwise ties as 0.5.
Criterion FP/FN uses 0.5 only as a diagnostic threshold, not an operational policy.
Copy exclusion is deterministic before provider call. Cost uses the historical harness input-token assumption of $0.042/M; actual billing is unavailable.

Cases: 27; evaluated: 27; copy excluded: 0; errors: 0.
Tokens: input 23245, output 1890; estimated input cost: $0.000976; latency p50/p95: 327/510 ms.

| Set | n | positive | AUC | 10% recall / precision / lift | 20% recall / precision / lift | 30% recall / precision / lift |
| --- | ---: | ---: | ---: | --- | --- | --- |
| natural | 15 | 0 | N/A | N/A / 0.000 / N/A | N/A / 0.000 / N/A | N/A / 0.000 / N/A |
| historical | 6 | 3 | 0.222 | 0.000 / 0.000 / 0.000 | 0.000 / 0.000 / 0.000 | 0.000 / 0.000 / 0.000 |
| synthetic | 6 | 3 | 0.333 | 0.333 / 1.000 / 2.000 | 0.333 / 0.500 / 1.000 | 0.333 / 0.500 / 1.000 |

| Source | Criterion | gold positives | FP at 0.5 | FN at 0.5 | AUC |
| --- | --- | ---: | ---: | ---: | ---: |
| natural | choice_rationale_misalignment | 0 | 13 | 0 | N/A |
| natural | choice_rationale_conflict | 0 | 1 | 0 | N/A |
| natural | choice_rationale_shallow | 0 | 1 | 0 | N/A |
| historical | choice_rationale_misalignment | 1 | 4 | 0 | 0.200 |
| historical | choice_rationale_conflict | 2 | 0 | 1 | 0.500 |
| historical | choice_rationale_shallow | 0 | 0 | 0 | N/A |
| synthetic | choice_rationale_misalignment | 1 | 3 | 0 | 0.400 |
| synthetic | choice_rationale_conflict | 1 | 0 | 0 | 1.000 |
| synthetic | choice_rationale_shallow | 1 | 1 | 0 | 1.000 |

## Case diagnostics

| Case | Source | Gold | Score | Probabilities M/C/S | Status |
| --- | --- | --- | ---: | --- | --- |
| natural-backend-engineering-0 | natural | none | 0.640 | 0.640 / 0.060 / 0.240 | evaluated |
| natural-cache-0 | natural | none | 0.750 | 0.750 / 0.130 / 0.260 | evaluated |
| natural-computer-architecture-0 | natural | none | 0.810 | 0.810 / 0.220 / 0.190 | evaluated |
| natural-database-0 | natural | none | 0.700 | 0.700 / 0.400 / 0.250 | evaluated |
| natural-distributed-systems-0 | natural | none | 0.660 | 0.660 / 0.210 / 0.300 | evaluated |
| natural-dsa-0 | natural | none | 0.710 | 0.470 / 0.710 / 0.540 | evaluated |
| natural-infrastructure-cloud-0 | natural | none | 0.810 | 0.810 / 0.170 / 0.210 | evaluated |
| natural-java-1 | natural | none | 0.400 | 0.400 / 0.050 / 0.220 | evaluated |
| natural-messaging-async-0 | natural | none | 0.700 | 0.700 / 0.110 / 0.170 | evaluated |
| natural-network-http-0 | natural | none | 0.630 | 0.630 / 0.310 / 0.280 | evaluated |
| natural-operating-systems-0 | natural | none | 0.650 | 0.650 / 0.220 / 0.310 | evaluated |
| natural-performance-observability-operations-0 | natural | none | 0.760 | 0.760 / 0.310 / 0.160 | evaluated |
| natural-security-0 | natural | none | 0.640 | 0.640 / 0.420 / 0.240 | evaluated |
| natural-spring-0 | natural | none | 0.740 | 0.740 / 0.240 / 0.300 | evaluated |
| natural-system-design-0 | natural | none | 0.600 | 0.600 / 0.310 / 0.350 | evaluated |
| history-0-before | historical | choice_rationale_misalignment | 0.510 | 0.510 / 0.380 / 0.390 | evaluated |
| history-0-after | historical | none | 0.620 | 0.620 / 0.140 / 0.390 | evaluated |
| history-1-before | historical | choice_rationale_conflict | 0.670 | 0.440 / 0.670 / 0.280 | evaluated |
| history-1-after | historical | none | 0.710 | 0.710 / 0.110 / 0.220 | evaluated |
| history-2-before | historical | choice_rationale_conflict | 0.660 | 0.660 / 0.040 / 0.220 | evaluated |
| history-2-after | historical | none | 0.700 | 0.700 / 0.050 / 0.210 | evaluated |
| synthetic-0-original | synthetic | none | 0.820 | 0.820 / 0.140 / 0.210 | evaluated |
| synthetic-0-edited | synthetic | choice_rationale_misalignment | 0.550 | 0.550 / 0.310 / 0.250 | evaluated |
| synthetic-1-original | synthetic | none | 0.820 | 0.820 / 0.170 / 0.220 | evaluated |
| synthetic-1-edited | synthetic | choice_rationale_conflict | 0.940 | 0.280 / 0.940 / 0.530 | evaluated |
| synthetic-2-original | synthetic | none | 0.830 | 0.830 / 0.190 / 0.180 | evaluated |
| synthetic-2-edited | synthetic | choice_rationale_shallow | 0.690 | 0.150 / 0.200 / 0.690 | evaluated |
