ALTER TABLE topic
    ADD CONSTRAINT topic_content_key_nonblank_ck CHECK (length(btrim(content_key)) > 0);

ALTER TABLE concept
    ADD CONSTRAINT concept_content_key_nonblank_ck CHECK (length(btrim(content_key)) > 0);

ALTER TABLE question
    ADD CONSTRAINT question_content_key_nonblank_ck CHECK (length(btrim(content_key)) > 0);

CREATE INDEX concept_reference_concept_order_idx
    ON concept_reference (concept_id, display_order, reference_id);
