SET client_encoding = 'UTF8';

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.put_dashboard(
    p_sort smallint, p_image uuid, p_title_en text, p_title_id text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_section integer;
    v_item    integer;
BEGIN
    SELECT id INTO v_section FROM content_sections WHERE section_key = 'home_hero';
    IF v_section IS NULL THEN
        RAISE EXCEPTION 'Section home_hero not found: run 02_seed.sql first';
    END IF;

    SELECT id INTO v_item FROM section_items
    WHERE content_section_id = v_section AND sort_order = p_sort
    ORDER BY id LIMIT 1;

    IF v_item IS NULL THEN
        INSERT INTO section_items (content_section_id, sort_order, image_id)
        VALUES (v_section, p_sort, p_image)
        RETURNING id INTO v_item;
    ELSE
        UPDATE section_items SET image_id = p_image
        WHERE id = v_item AND image_id IS NULL AND p_image IS NOT NULL;
    END IF;

    INSERT INTO section_item_translations (section_item_id, locale_code, title)
    VALUES (v_item, 'en', p_title_en), (v_item, 'id', p_title_id)
    ON CONFLICT (section_item_id, locale_code) DO UPDATE
        SET title = EXCLUDED.title, updated_at = now();
END;
$$;

SELECT pg_temp.put_dashboard(10::smallint,
    (SELECT image_id FROM content_sections WHERE section_key = 'home_hero'),
    'AM² PTT', 'AM² PTT');
SELECT pg_temp.put_dashboard(20::smallint, NULL, 'AM² Command Center', 'AM² Command Center');

COMMIT;

SELECT si.id, si.sort_order, t.title, si.image_id
FROM section_items si
JOIN content_sections cs ON cs.id = si.content_section_id
LEFT JOIN section_item_translations t ON t.section_item_id = si.id AND t.locale_code = 'en'
WHERE cs.section_key = 'home_hero'
ORDER BY si.sort_order, si.id;
