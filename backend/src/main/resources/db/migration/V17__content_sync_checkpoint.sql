CREATE TABLE content_import_lock (id bigint PRIMARY KEY CHECK (id = 1));
INSERT INTO content_import_lock (id) VALUES (1);
CREATE TABLE content_sync_checkpoint (
    scope varchar(64) PRIMARY KEY,
    source_sha varchar(40) NOT NULL,
    manifest text NOT NULL
);
CREATE TABLE content_sync_run (
    id uuid PRIMARY KEY,
    scope varchar(64) NOT NULL,
    source_sha varchar(40) NOT NULL,
    manifest_digest varchar(64) NOT NULL,
    mode varchar(24) NOT NULL,
    changed_files integer NOT NULL,
    updated_items integer NOT NULL,
    created_items integer NOT NULL,
    completed_at timestamp with time zone NOT NULL
);
