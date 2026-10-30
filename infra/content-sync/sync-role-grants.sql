-- Apply as the database owner after creating the dedicated non-owner login.
-- The job cannot mutate personal learning tables or alter the database schema.
GRANT CONNECT ON DATABASE neondb TO csforge_content_sync;
GRANT USAGE ON SCHEMA public TO csforge_content_sync;
GRANT SELECT ON public.learning_area, public.topic, public.concept, public.reference,
    public.concept_reference, public.question, public.question_choice, public.question_answer,
    public.question_concept, public.content_import_lock, public.content_sync_checkpoint,
    public.content_sync_run TO csforge_content_sync;
GRANT SELECT (question_id) ON public.attempt, public.quiz_question, public.wrong_note,
    public.review_history, public.review_schedule TO csforge_content_sync;
GRANT INSERT, UPDATE ON public.topic, public.concept, public.reference,
    public.content_sync_checkpoint TO csforge_content_sync;
GRANT INSERT, UPDATE ON public.question, public.question_choice,
    public.question_answer, public.question_concept TO csforge_content_sync;
GRANT DELETE ON public.question_choice, public.question_answer,
    public.question_concept TO csforge_content_sync;
GRANT INSERT, UPDATE, DELETE ON public.concept_reference TO csforge_content_sync;
GRANT INSERT ON public.content_sync_run TO csforge_content_sync;
GRANT UPDATE (id) ON public.content_import_lock TO csforge_content_sync;
GRANT USAGE ON SEQUENCE public.topic_id_seq, public.concept_id_seq, public.reference_id_seq,
    public.question_id_seq, public.question_choice_id_seq, public.question_answer_id_seq TO csforge_content_sync;
