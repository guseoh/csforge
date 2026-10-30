CREATE VIEW search_document_view AS
WITH searchable_contexts AS (
    SELECT qc.question_id,
           c.id AS concept_id,
           c.content_key AS concept_content_key,
           c.level,
           t.content_key AS topic_content_key,
           t.title AS topic_title,
           a.slug AS area_slug,
           a.name AS area_name
    FROM question_concept qc
    JOIN concept c ON c.id = qc.concept_id
    JOIN topic t ON t.id = c.topic_id
    JOIN learning_area a ON a.id = t.learning_area_id
    WHERE c.status = 'PUBLISHED'
      AND t.active = TRUE
      AND a.active = TRUE
),
question_contexts AS (
    SELECT question_id,
           array_agg(DISTINCT area_slug ORDER BY area_slug) AS area_slugs,
           array_agg(DISTINCT area_name ORDER BY area_name) AS area_names,
           array_agg(DISTINCT topic_content_key ORDER BY topic_content_key) AS topic_content_keys,
           array_agg(DISTINCT topic_title ORDER BY topic_title) AS topic_titles,
           array_agg(DISTINCT concept_id ORDER BY concept_id) AS concept_ids,
           array_agg(DISTINCT concept_content_key ORDER BY concept_content_key) AS concept_content_keys,
           array_agg(DISTINCT level ORDER BY level) AS levels
    FROM searchable_contexts
    GROUP BY question_id
),
question_choices AS (
    SELECT question_id,
           string_agg(content_markdown, E'\n' ORDER BY display_order, id) AS choice_text
    FROM question_choice
    GROUP BY question_id
),
documents AS (
    SELECT 'CONCEPT'::text AS document_type,
           c.id AS source_id,
           'CONCEPT:' || c.id AS document_key,
           c.title::text AS title,
           c.content_markdown::text AS body,
           c.summary::text AS summary,
           ARRAY[a.slug]::text[] AS area_slugs,
           ARRAY[a.name]::text[] AS area_names,
           ARRAY[t.content_key]::text[] AS topic_content_keys,
           ARRAY[t.title]::text[] AS topic_titles,
           ARRAY[c.level]::smallint[] AS levels,
           c.updated_at,
           c.id AS concept_id,
           NULL::bigint AS question_id,
           NULL::text AS reference_url,
           ARRAY[c.content_key]::text[] AS content_keys,
           NULL::text AS question_type,
           NULL::text AS difficulty,
           NULL::text AS wrong_note_status,
           NULL::integer AS wrong_count
    FROM concept c
    JOIN topic t ON t.id = c.topic_id
    JOIN learning_area a ON a.id = t.learning_area_id
    WHERE c.status = 'PUBLISHED'
      AND t.active = TRUE
      AND a.active = TRUE

    UNION ALL

    SELECT 'QUESTION'::text,
           q.id,
           'QUESTION:' || q.id,
           CASE
               WHEN length(btrim(regexp_replace(q.prompt_markdown, '\s+', ' ', 'g'))) <= 120
                   THEN btrim(regexp_replace(q.prompt_markdown, '\s+', ' ', 'g'))
               ELSE left(btrim(regexp_replace(q.prompt_markdown, '\s+', ' ', 'g')), 117) || '...'
           END,
           concat_ws(E'\n', q.prompt_markdown, choices.choice_text, q.explanation_markdown),
           q.explanation_markdown,
           contexts.area_slugs,
           contexts.area_names,
           contexts.topic_content_keys,
           contexts.topic_titles,
           contexts.levels,
           q.updated_at,
           NULL::bigint,
           q.id,
           NULL::text,
           ARRAY[q.content_key]::text[] || contexts.concept_content_keys,
           q.question_type,
           q.difficulty,
           NULL::text,
           NULL::integer
    FROM question q
    JOIN question_contexts contexts ON contexts.question_id = q.id
    LEFT JOIN question_choices choices ON choices.question_id = q.id
    WHERE q.status = 'PUBLISHED'

    UNION ALL

    SELECT 'PERSONAL_NOTE'::text,
           n.id,
           'PERSONAL_NOTE:' || n.id,
           ('개인 노트 · ' || c.content_key)::text,
           n.content,
           n.content,
           ARRAY[a.slug]::text[],
           ARRAY[a.name]::text[],
           ARRAY[t.content_key]::text[],
           ARRAY[t.title]::text[],
           ARRAY[c.level]::smallint[],
           n.updated_at,
           c.id,
           NULL::bigint,
           NULL::text,
           ARRAY[c.content_key]::text[],
           NULL::text,
           NULL::text,
           NULL::text,
           NULL::integer
    FROM personal_note n
    JOIN concept c ON c.id = n.concept_id
    JOIN topic t ON t.id = c.topic_id
    JOIN learning_area a ON a.id = t.learning_area_id
    WHERE btrim(n.content) <> ''
      AND c.status = 'PUBLISHED'
      AND t.active = TRUE
      AND a.active = TRUE

    UNION ALL

    SELECT 'WRONG_NOTE'::text,
           w.id,
           'WRONG_NOTE:' || w.id,
           ('오답 노트 · ' || CASE
               WHEN length(btrim(regexp_replace(q.prompt_markdown, '\s+', ' ', 'g'))) <= 120
                   THEN btrim(regexp_replace(q.prompt_markdown, '\s+', ' ', 'g'))
               ELSE left(btrim(regexp_replace(q.prompt_markdown, '\s+', ' ', 'g')), 117) || '...'
           END)::text,
           concat_ws(E'\n', q.prompt_markdown, w.cause_note),
           w.cause_note,
           contexts.area_slugs,
           contexts.area_names,
           contexts.topic_content_keys,
           contexts.topic_titles,
           contexts.levels,
           w.updated_at,
           NULL::bigint,
           q.id,
           NULL::text,
           ARRAY[q.content_key]::text[] || contexts.concept_content_keys,
           NULL::text,
           q.difficulty,
           w.status,
           w.wrong_count
    FROM wrong_note w
    JOIN question q ON q.id = w.question_id
    JOIN question_contexts contexts ON contexts.question_id = q.id
    WHERE q.status = 'PUBLISHED'

    UNION ALL

    SELECT 'REFERENCE'::text,
           r.id,
           'REFERENCE:' || r.id,
           r.title::text,
           concat_ws(E'\n', r.url, r.recommendation, relation_notes.relation_text),
           r.recommendation,
           array_agg(DISTINCT a.slug ORDER BY a.slug),
           array_agg(DISTINCT a.name ORDER BY a.name),
           array_agg(DISTINCT t.content_key ORDER BY t.content_key),
           array_agg(DISTINCT t.title ORDER BY t.title),
           array_agg(DISTINCT c.level ORDER BY c.level),
           r.updated_at,
           NULL::bigint,
           NULL::bigint,
           r.url,
           array_agg(DISTINCT c.content_key ORDER BY c.content_key),
           NULL::text,
           NULL::text,
           NULL::text,
           NULL::integer
    FROM reference r
    JOIN concept_reference links ON links.reference_id = r.id
    JOIN concept c ON c.id = links.concept_id
    JOIN topic t ON t.id = c.topic_id
    JOIN learning_area a ON a.id = t.learning_area_id
    LEFT JOIN LATERAL (
        SELECT string_agg(linked.relation_note, E'\n' ORDER BY linked.concept_id, linked.display_order) AS relation_text
        FROM concept_reference linked
        JOIN concept linked_concept ON linked_concept.id = linked.concept_id
        JOIN topic linked_topic ON linked_topic.id = linked_concept.topic_id
        JOIN learning_area linked_area ON linked_area.id = linked_topic.learning_area_id
        WHERE linked.reference_id = r.id
          AND linked.relation_note IS NOT NULL
          AND linked_concept.status = 'PUBLISHED'
          AND linked_topic.active = TRUE
          AND linked_area.active = TRUE
    ) relation_notes ON TRUE
    WHERE c.status = 'PUBLISHED'
      AND t.active = TRUE
      AND a.active = TRUE
    GROUP BY r.id, r.url, r.title, r.recommendation, r.updated_at, relation_notes.relation_text
)
SELECT d.*,
       lower(concat_ws(
           ' ', d.title, d.body, d.summary,
           array_to_string(d.area_slugs, ' '),
           array_to_string(d.area_names, ' '),
           array_to_string(d.topic_content_keys, ' '),
           array_to_string(d.topic_titles, ' '),
           array_to_string(d.content_keys, ' ')
       )) AS search_text
FROM documents d;
