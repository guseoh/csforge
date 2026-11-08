# Network Pilot Pack — 5 Reader visualizations

One bulk implementation/review for N-01 through N-05; no per-concept approval gate.
Sources: Issue #278, docs/learning-visualization.md, RFC 9293, RFC 9110/9112, RFC 1034.

| Pilot | Canonical source | Renderer |
| --- | --- | --- |
| N-01 | tcp/three-way-handshake.md | existing tcp-handshake, corrected editorial renderer |
| N-02 | request-journey/transport-establishment.md | network-core: http-over-tcp |
| N-03 | dns/iterative-resolution.md | network-core: dns-iterative |
| N-04 | tcp/connection-teardown.md | network-core: tcp-teardown |
| N-05 | tcp/sliding-window.md | network-core: tcp-sliding-window |

Only four fixed allowlisted network-core example identifiers are accepted in Zod and Java Import.
All diagram geometry, values, text, HTML and state transitions live in application source code.
Stable content keys, topic ordering, questions and references are retained.

Local preview: cd frontend; npm ci; npm run dev; visit /network-pilot-preview.html.
QA: all 5 Reader figures, dark/light at 1280/1440, all 5 handshake and 8 teardown states.
Unit tests and shared backend/frontend validation cover accepted/rejected payloads.

Not completed by this PR: all 127 Network Concept content review, isolated PostgreSQL Apply and repeat UNCHANGED, authenticated Reader/production data safety, or deploy.
Do not merge without final QA and explicit approval.