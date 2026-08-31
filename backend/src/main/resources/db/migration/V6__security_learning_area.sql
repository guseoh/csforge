INSERT INTO learning_area (slug, name, description, display_order)
VALUES ('security', 'Security', '웹 애플리케이션의 위협, 인증·인가와 안전한 backend 경계', 15)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    active = TRUE,
    updated_at = CURRENT_TIMESTAMP;
