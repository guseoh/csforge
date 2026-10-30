# Search count plan

`q=cache`, canonical content and history100.

```text
Aggregate  (cost=11641.34..11641.35 rows=1 width=8) (actual time=193.686..193.709 rows=1 loops=1)
  Buffers: shared hit=14780
  ->  Subquery Scan on d  (cost=363.90..11641.29 rows=4 width=548) (actual time=1.610..193.623 rows=477 loops=1)
        Filter: (lower(concat_ws(' '::text, d.title, d.body, d.summary, array_to_string(d.area_slugs, ' '::text), array_to_string(d.area_names, ' '::text), array_to_string(d.topic_content_keys, ' '::text), array_to_string(d.topic_titles, ' '::text), array_to_string(d.content_keys, ' '::text))) ~~* '%cache%'::text)
        Rows Removed by Filter: 3544
        Buffers: shared hit=14780
        CTE question_contexts
          ->  GroupAggregate  (cost=282.76..346.16 rows=1268 width=232) (actual time=2.434..14.296 rows=2525 loops=1)
                Group Key: qc.question_id
                Buffers: shared hit=139
                ->  Sort  (cost=282.76..285.93 rows=1268 width=515) (actual time=2.413..2.557 rows=2536 loops=1)
                      Sort Key: qc.question_id, a_3.slug
                      Sort Method: quicksort  Memory: 525kB
                      Buffers: shared hit=139
                      ->  Hash Join  (cost=157.64..217.40 rows=1268 width=515) (actual time=0.405..1.968 rows=2536 loops=1)
                            Hash Cond: (t_3.learning_area_id = a_3.id)
                            Buffers: shared hit=139
                            ->  Hash Join  (cost=145.04..197.97 rows=2536 width=119) (actual time=0.390..1.518 rows=2536 loops=1)
                                  Hash Cond: (c_3.topic_id = t_3.id)
                                  Buffers: shared hit=138
                                  ->  Hash Join  (cost=138.02..184.09 rows=2536 width=70) (actual time=0.344..1.006 rows=2536 loops=1)
                                        Hash Cond: (qc.concept_id = c_3.id)
                                        Buffers: shared hit=134
                                        ->  Seq Scan on question_concept qc  (cost=0.00..39.36 rows=2536 width=16) (actual time=0.003..0.151 rows=2536 loops=1)
                                              Buffers: shared hit=14
                                        ->  Hash  (cost=129.01..129.01 rows=721 width=62) (actual time=0.338..0.339 rows=721 loops=1)
                                              Buckets: 1024  Batches: 1  Memory Usage: 78kB
                                              Buffers: shared hit=120
                                              ->  Seq Scan on concept c_3  (cost=0.00..129.01 rows=721 width=62) (actual time=0.003..0.238 rows=721 loops=1)
                                                    Filter: ((status)::text = 'PUBLISHED'::text)
                                                    Buffers: shared hit=120
                                  ->  Hash  (cost=5.34..5.34 rows=134 width=65) (actual time=0.043..0.043 rows=134 loops=1)
                                        Buckets: 1024  Batches: 1  Memory Usage: 22kB
                                        Buffers: shared hit=4
                                        ->  Seq Scan on topic t_3  (cost=0.00..5.34 rows=134 width=65) (actual time=0.004..0.023 rows=134 loops=1)
                                              Filter: active
                                              Buffers: shared hit=4
                            ->  Hash  (cost=11.60..11.60 rows=80 width=412) (actual time=0.012..0.013 rows=15 loops=1)
                                  Buckets: 1024  Batches: 1  Memory Usage: 10kB
                                  Buffers: shared hit=1
                                  ->  Seq Scan on learning_area a_3  (cost=0.00..11.60 rows=80 width=412) (actual time=0.007..0.009 rows=15 loops=1)
                                        Filter: active
                                        Buffers: shared hit=1
        ->  Append  (cost=17.74..11211.04 rows=2803 width=516) (actual time=0.118..96.867 rows=4021 loops=1)
              Buffers: shared hit=14318
              ->  Hash Join  (cost=17.74..155.76 rows=360 width=1568) (actual time=0.118..1.456 rows=721 loops=1)
                    Hash Cond: (c.topic_id = t.id)
                    Buffers: shared hit=154
                    ->  Seq Scan on concept c  (cost=0.00..129.01 rows=721 width=1213) (actual time=0.006..0.446 rows=721 loops=1)
                          Filter: ((status)::text = 'PUBLISHED'::text)
                          Buffers: shared hit=120
                    ->  Hash  (cost=16.90..16.90 rows=67 width=461) (actual time=0.105..0.106 rows=134 loops=1)
                          Buckets: 1024  Batches: 1  Memory Usage: 25kB
                          Buffers: shared hit=34
                          ->  Nested Loop  (cost=0.15..16.90 rows=67 width=461) (actual time=0.011..0.082 rows=134 loops=1)
                                Buffers: shared hit=34
                                ->  Seq Scan on topic t  (cost=0.00..5.34 rows=134 width=65) (actual time=0.003..0.021 rows=134 loops=1)
                                      Filter: active
                                      Buffers: shared hit=4
                                ->  Memoize  (cost=0.15..0.53 rows=1 width=412) (actual time=0.000..0.000 rows=1 loops=134)
                                      Cache Key: t.learning_area_id
                                      Cache Mode: logical
                                      Hits: 119  Misses: 15  Evictions: 0  Overflows: 0  Memory Usage: 3kB
                                      Buffers: shared hit=30
                                      ->  Index Scan using learning_area_pkey on learning_area a  (cost=0.14..0.52 rows=1 width=412) (actual time=0.001..0.001 rows=1 loops=15)
                                            Index Cond: (id = t.learning_area_id)
                                            Filter: active
                                            Buffers: shared hit=30
              ->  Subquery Scan on "*SELECT* 2"  (cost=785.30..919.67 rows=1268 width=711) (actual time=21.142..76.535 rows=2525 loops=1)
                    Buffers: shared hit=472
                    ->  Hash Right Join  (cost=785.30..906.99 rows=1268 width=666) (actual time=21.139..75.629 rows=2525 loops=1)
                          Hash Cond: (question_choice.question_id = q.id)
                          Buffers: shared hit=472
                          ->  GroupAggregate  (cost=519.63..571.05 rows=1210 width=40) (actual time=2.246..3.740 rows=1210 loops=1)
                                Group Key: question_choice.question_id
                                Buffers: shared hit=175
                                ->  Sort  (cost=519.63..531.73 rows=4840 width=85) (actual time=2.238..2.490 rows=4840 loops=1)
                                      Sort Key: question_choice.question_id, question_choice.display_order, question_choice.id
                                      Sort Method: quicksort  Memory: 725kB
                                      Buffers: shared hit=175
                                      ->  Seq Scan on question_choice  (cost=0.00..223.40 rows=4840 width=85) (actual time=0.010..0.718 rows=4840 loops=1)
                                            Buffers: shared hit=175
                          ->  Hash  (cost=249.82..249.82 rows=1268 width=641) (actual time=18.856..18.857 rows=2525 loops=1)
                                Buckets: 4096 (originally 2048)  Batches: 1 (originally 1)  Memory Usage: 1912kB
                                Buffers: shared hit=297
                                ->  Hash Join  (cost=221.12..249.82 rows=1268 width=641) (actual time=3.656..17.376 rows=2525 loops=1)
                                      Hash Cond: (contexts.question_id = q.id)
                                      Buffers: shared hit=297
                                      ->  CTE Scan on question_contexts contexts  (cost=0.00..25.36 rows=1268 width=200) (actual time=2.437..15.231 rows=2525 loops=1)
                                            Buffers: shared hit=139
                                      ->  Hash  (cost=189.56..189.56 rows=2525 width=449) (actual time=1.214..1.214 rows=2525 loops=1)
                                            Buckets: 4096  Batches: 1  Memory Usage: 1236kB
                                            Buffers: shared hit=158
                                            ->  Seq Scan on question q  (cost=0.00..189.56 rows=2525 width=449) (actual time=0.005..0.677 rows=2525 loops=1)
                                                  Filter: ((status)::text = 'PUBLISHED'::text)
                                                  Buffers: shared hit=158
              ->  Hash Join  (cost=51.89..192.53 rows=438 width=516) (actual time=0.203..0.711 rows=100 loops=1)
                    Hash Cond: (c_1.id = n.concept_id)
                    Buffers: shared hit=156
                    ->  Hash Join  (cost=17.74..153.06 rows=360 width=507) (actual time=0.144..0.529 rows=721 loops=1)
                          Hash Cond: (c_1.topic_id = t_1.id)
                          Buffers: shared hit=154
                          ->  Seq Scan on concept c_1  (cost=0.00..129.01 rows=721 width=62) (actual time=0.018..0.258 rows=721 loops=1)
                                Filter: ((status)::text = 'PUBLISHED'::text)
                                Buffers: shared hit=120
                          ->  Hash  (cost=16.90..16.90 rows=67 width=461) (actual time=0.117..0.119 rows=134 loops=1)
                                Buckets: 1024  Batches: 1  Memory Usage: 25kB
                                Buffers: shared hit=34
                                ->  Nested Loop  (cost=0.15..16.90 rows=67 width=461) (actual time=0.021..0.094 rows=134 loops=1)
                                      Buffers: shared hit=34
                                      ->  Seq Scan on topic t_1  (cost=0.00..5.34 rows=134 width=65) (actual time=0.005..0.021 rows=134 loops=1)
                                            Filter: active
                                            Buffers: shared hit=4
                                      ->  Memoize  (cost=0.15..0.53 rows=1 width=412) (actual time=0.000..0.000 rows=1 loops=134)
                                            Cache Key: t_1.learning_area_id
                                            Cache Mode: logical
                                            Hits: 119  Misses: 15  Evictions: 0  Overflows: 0  Memory Usage: 3kB
                                            Buffers: shared hit=30
                                            ->  Index Scan using learning_area_pkey on learning_area a_1  (cost=0.14..0.52 rows=1 width=412) (actual time=0.001..0.001 rows=1 loops=15)
                                                  Index Cond: (id = t_1.learning_area_id)
                                                  Filter: active
                                                  Buffers: shared hit=30
                    ->  Hash  (cost=23.20..23.20 rows=876 width=56) (actual time=0.049..0.049 rows=100 loops=1)
                          Buckets: 1024  Batches: 1  Memory Usage: 16kB
                          Buffers: shared hit=2
                          ->  Seq Scan on personal_note n  (cost=0.00..23.20 rows=876 width=56) (actual time=0.007..0.034 rows=100 loops=1)
                                Filter: (btrim(content) <> ''::text)
                                Buffers: shared hit=2
              ->  Subquery Scan on "*SELECT* 4"  (cost=223.00..267.58 rows=241 width=516) (actual time=0.850..2.918 rows=100 loops=1)
                    Buffers: shared hit=160
                    ->  Hash Join  (cost=223.00..265.17 rows=241 width=508) (actual time=0.847..2.881 rows=100 loops=1)
                          Hash Cond: (contexts_1.question_id = q_1.id)
                          Buffers: shared hit=160
                          ->  CTE Scan on question_contexts contexts_1  (cost=0.00..25.36 rows=1268 width=200) (actual time=0.001..0.235 rows=2525 loops=1)
                          ->  Hash  (cost=217.00..217.00 rows=480 width=311) (actual time=0.819..0.820 rows=100 loops=1)
                                Buckets: 1024  Batches: 1  Memory Usage: 34kB
                                Buffers: shared hit=160
                                ->  Hash Join  (cost=20.80..217.00 rows=480 width=311) (actual time=0.052..0.748 rows=100 loops=1)
                                      Hash Cond: (q_1.id = w.question_id)
                                      Buffers: shared hit=160
                                      ->  Seq Scan on question q_1  (cost=0.00..189.56 rows=2525 width=201) (actual time=0.004..0.536 rows=2525 loops=1)
                                            Filter: ((status)::text = 'PUBLISHED'::text)
                                            Buffers: shared hit=158
                                      ->  Hash  (cost=14.80..14.80 rows=480 width=110) (actual time=0.044..0.045 rows=100 loops=1)
                                            Buckets: 1024  Batches: 1  Memory Usage: 16kB
                                            Buffers: shared hit=2
                                            ->  Seq Scan on wrong_note w  (cost=0.00..14.80 rows=480 width=110) (actual time=0.004..0.018 rows=100 loops=1)
                                                  Buffers: shared hit=2
              ->  Subquery Scan on "*SELECT* 5"  (cost=248.18..9661.49 rows=496 width=576) (actual time=3.329..14.904 rows=575 loops=1)
                    Buffers: shared hit=13376
                    ->  GroupAggregate  (cost=248.18..9656.53 rows=496 width=685) (actual time=3.327..14.707 rows=575 loops=1)
                          Group Key: r.id, (string_agg(linked.relation_note, '
'::text ORDER BY linked.concept_id, linked.display_order))
                          Buffers: shared hit=13376
                          ->  Incremental Sort  (cost=248.18..9629.25 rows=496 width=748) (actual time=2.600..10.991 rows=991 loops=1)
                                Sort Key: r.id, (string_agg(linked.relation_note, '
'::text ORDER BY linked.concept_id, linked.display_order)), a_2.slug
                                Presorted Key: r.id
                                Full-sort Groups: 30  Sort Method: quicksort  Average Memory: 51kB  Peak Memory: 51kB
                                Buffers: shared hit=13376
                                ->  Nested Loop Left Join  (cost=229.27..9606.93 rows=496 width=748) (actual time=1.395..10.522 rows=991 loops=1)
                                      Buffers: shared hit=13376
                                      ->  Merge Join  (cost=210.45..262.00 rows=496 width=716) (actual time=1.318..1.893 rows=991 loops=1)
                                            Merge Cond: (r.id = links.reference_id)
                                            Buffers: shared hit=186
                                            ->  Index Scan using reference_pkey on reference r  (cost=0.28..42.95 rows=575 width=217) (actual time=0.012..0.144 rows=575 loops=1)
                                                  Buffers: shared hit=21
                                            ->  Sort  (cost=210.17..211.41 rows=496 width=507) (actual time=1.302..1.368 rows=991 loops=1)
                                                  Sort Key: links.reference_id
                                                  Sort Method: quicksort  Memory: 181kB
                                                  Buffers: shared hit=165
                                                  ->  Hash Join  (cost=155.76..187.96 rows=496 width=507) (actual time=0.543..1.001 rows=991 loops=1)
                                                        Hash Cond: (c_2.topic_id = t_2.id)
                                                        Buffers: shared hit=165
                                                        ->  Hash Join  (cost=138.02..161.55 rows=991 width=62) (actual time=0.422..0.687 rows=991 loops=1)
                                                              Hash Cond: (links.concept_id = c_2.id)
                                                              Buffers: shared hit=131
                                                              ->  Seq Scan on concept_reference links  (cost=0.00..20.91 rows=991 width=16) (actual time=0.003..0.068 rows=991 loops=1)
                                                                    Buffers: shared hit=11
                                                              ->  Hash  (cost=129.01..129.01 rows=721 width=62) (actual time=0.408..0.408 rows=721 loops=1)
                                                                    Buckets: 1024  Batches: 1  Memory Usage: 78kB
                                                                    Buffers: shared hit=120
                                                                    ->  Seq Scan on concept c_2  (cost=0.00..129.01 rows=721 width=62) (actual time=0.003..0.230 rows=721 loops=1)
                                                                          Filter: ((status)::text = 'PUBLISHED'::text)
                                                                          Buffers: shared hit=120
                                                        ->  Hash  (cost=16.90..16.90 rows=67 width=461) (actual time=0.110..0.111 rows=134 loops=1)
                                                              Buckets: 1024  Batches: 1  Memory Usage: 25kB
                                                              Buffers: shared hit=34
                                                              ->  Nested Loop  (cost=0.15..16.90 rows=67 width=461) (actual time=0.013..0.082 rows=134 loops=1)
                                                                    Buffers: shared hit=34
                                                                    ->  Seq Scan on topic t_2  (cost=0.00..5.34 rows=134 width=65) (actual time=0.004..0.019 rows=134 loops=1)
                                                                          Filter: active
                                                                          Buffers: shared hit=4
                                                                    ->  Memoize  (cost=0.15..0.53 rows=1 width=412) (actual time=0.000..0.000 rows=1 loops=134)
                                                                          Cache Key: t_2.learning_area_id
                                                                          Cache Mode: logical
                                                                          Hits: 119  Misses: 15  Evictions: 0  Overflows: 0  Memory Usage: 3kB
                                                                          Buffers: shared hit=30
                                                                          ->  Index Scan using learning_area_pkey on learning_area a_2  (cost=0.14..0.52 rows=1 width=412) (actual time=0.001..0.001 rows=1 loops=15)
                                                                                Index Cond: (id = t_2.learning_area_id)
                                                                                Filter: active
                                                                                Buffers: shared hit=30
                                      ->  Aggregate  (cost=18.82..18.83 rows=1 width=32) (actual time=0.008..0.008 rows=1 loops=991)
                                            Buffers: shared hit=13190
                                            ->  Sort  (cost=18.81..18.82 rows=1 width=75) (actual time=0.008..0.008 rows=1 loops=991)
                                                  Sort Key: linked.concept_id, linked.display_order
                                                  Sort Method: quicksort  Memory: 25kB
                                                  Buffers: shared hit=13190
                                                  ->  Nested Loop  (cost=4.86..18.80 rows=1 width=75) (actual time=0.004..0.007 rows=1 loops=991)
                                                        Buffers: shared hit=13190
                                                        ->  Nested Loop  (cost=4.71..18.27 rows=1 width=83) (actual time=0.003..0.005 rows=1 loops=991)
                                                              Buffers: shared hit=10348
                                                              ->  Nested Loop  (cost=4.57..18.07 rows=1 width=83) (actual time=0.003..0.004 rows=1 loops=991)
                                                                    Buffers: shared hit=7506
                                                                    ->  Bitmap Heap Scan on concept_reference linked  (cost=4.29..9.76 rows=1 width=75) (actual time=0.002..0.002 rows=1 loops=991)
                                                                          Recheck Cond: (reference_id = r.id)
                                                                          Filter: (relation_note IS NOT NULL)
                                                                          Rows Removed by Filter: 3
                                                                          Heap Blocks: exact=1261
                                                                          Buffers: shared hit=3243
                                                                          ->  Bitmap Index Scan on concept_reference_reference_idx  (cost=0.00..4.29 rows=2 width=0) (actual time=0.001..0.001 rows=5 loops=991)
                                                                                Index Cond: (reference_id = r.id)
                                                                                Buffers: shared hit=1982
                                                                    ->  Index Scan using concept_pkey on concept linked_concept  (cost=0.28..8.29 rows=1 width=16) (actual time=0.001..0.001 rows=1 loops=1421)
                                                                          Index Cond: (id = linked.concept_id)
                                                                          Filter: ((status)::text = 'PUBLISHED'::text)
                                                                          Buffers: shared hit=4263
                                                              ->  Index Scan using topic_pkey on topic linked_topic  (cost=0.14..0.20 rows=1 width=16) (actual time=0.001..0.001 rows=1 loops=1421)
                                                                    Index Cond: (id = linked_concept.topic_id)
                                                                    Filter: active
                                                                    Buffers: shared hit=2842
                                                        ->  Index Scan using learning_area_pkey on learning_area linked_area  (cost=0.14..0.52 rows=1 width=8) (actual time=0.001..0.001 rows=1 loops=1421)
                                                              Index Cond: (id = linked_topic.learning_area_id)
                                                              Filter: active
                                                              Buffers: shared hit=2842
Planning:
  Buffers: shared hit=102
Planning Time: 2.531 ms
Execution Time: 194.166 ms
```
