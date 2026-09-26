ALTER TABLE quiz_session
    ADD COLUMN creation_request_id UUID,
    ADD COLUMN creation_fingerprint VARCHAR(64),
    ADD CONSTRAINT quiz_session_creation_identity_ck CHECK (
        (creation_request_id IS NULL AND creation_fingerprint IS NULL)
        OR (creation_request_id IS NOT NULL AND creation_fingerprint IS NOT NULL)
    );

CREATE UNIQUE INDEX quiz_session_creation_request_id_uk
    ON quiz_session (creation_request_id);
