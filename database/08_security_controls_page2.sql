SET client_encoding = 'UTF8';

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.put_security_card(
    p_sort smallint, p_locale text, p_title text, p_description text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_section integer;
    v_item    integer;
BEGIN
    SELECT id INTO v_section FROM content_sections WHERE section_key = 'home_security_controls';
    IF v_section IS NULL THEN
        RAISE EXCEPTION 'Section home_security_controls not found: run 02_seed.sql first';
    END IF;

    SELECT id INTO v_item FROM section_items
    WHERE content_section_id = v_section AND sort_order = p_sort
    ORDER BY id LIMIT 1;

    IF v_item IS NULL THEN
        INSERT INTO section_items (content_section_id, sort_order)
        VALUES (v_section, p_sort)
        RETURNING id INTO v_item;
    END IF;

    INSERT INTO section_item_translations (section_item_id, locale_code, title, description)
    VALUES (v_item, p_locale, p_title, p_description)
    ON CONFLICT (section_item_id, locale_code) DO UPDATE
        SET title = EXCLUDED.title, description = EXCLUDED.description, updated_at = now();
END;
$$;

SELECT pg_temp.put_security_card(40::smallint, 'en', 'Controlled Software Lifecycle',
    'Builds and updates follow controlled release and integrity processes.');
SELECT pg_temp.put_security_card(40::smallint, 'id', 'Siklus Software yang Terkendali',
    'Build dan pembaruan mengikuti proses rilis dan pemeriksaan integritas yang terkendali.');

SELECT pg_temp.put_security_card(50::smallint, 'en', 'On-Premise Infrastructure',
    'Keep the infrastructure boundary within your own environment.');
SELECT pg_temp.put_security_card(50::smallint, 'id', 'Infrastruktur On-Premise',
    'Batas infrastruktur tetap berada di dalam lingkungan Anda sendiri.');

SELECT pg_temp.put_security_card(60::smallint, 'en', 'Role-Based Access',
    'Access follows the permissions assigned to each user.');
SELECT pg_temp.put_security_card(60::smallint, 'id', 'Akses Berbasis Peran',
    'Akses mengikuti izin yang diberikan kepada setiap pengguna.');

COMMIT;

SELECT si.id, si.sort_order, t.title, si.image_id
FROM section_items si
JOIN content_sections cs ON cs.id = si.content_section_id
LEFT JOIN section_item_translations t ON t.section_item_id = si.id AND t.locale_code = 'en'
WHERE cs.section_key = 'home_security_controls'
ORDER BY si.sort_order, si.id;
