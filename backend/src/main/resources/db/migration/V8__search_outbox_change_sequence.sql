CREATE SEQUENCE search_outbox_change_sequence_seq;

ALTER TABLE search_outbox_event
    ADD COLUMN change_sequence BIGINT;

UPDATE search_outbox_event
SET change_sequence = id;

SELECT setval(
    'search_outbox_change_sequence_seq',
    GREATEST(COALESCE((SELECT MAX(change_sequence) FROM search_outbox_event), 0) + 1, 1),
    false
);

ALTER TABLE search_outbox_event
    ALTER COLUMN change_sequence SET DEFAULT nextval('search_outbox_change_sequence_seq'),
    ALTER COLUMN change_sequence SET NOT NULL;

CREATE UNIQUE INDEX search_outbox_event_change_sequence_uk
    ON search_outbox_event (change_sequence);

CREATE INDEX search_outbox_event_change_sequence_idx
    ON search_outbox_event (change_sequence, id);
