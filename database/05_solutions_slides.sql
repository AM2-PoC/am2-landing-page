SET client_encoding = 'UTF8';

BEGIN;

CREATE FUNCTION pg_temp.put_slide(p_sort smallint, p_locale text, p_title text, p_description text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_section integer;
    v_item    integer;
BEGIN
    SELECT id INTO v_section FROM content_sections WHERE section_key = 'solutions_capabilities';
    IF v_section IS NULL THEN
        RAISE EXCEPTION 'Section solutions_capabilities not found: run 02_seed.sql first';
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

UPDATE section_items si
SET sort_order = 40, updated_at = now()
FROM content_sections cs
WHERE cs.id = si.content_section_id
  AND cs.section_key = 'solutions_capabilities'
  AND si.sort_order = 10
  AND EXISTS (
      SELECT 1 FROM section_item_translations t
      WHERE t.section_item_id = si.id AND t.locale_code = 'en' AND t.title = 'Flexible Deployment'
  )
  AND NOT EXISTS (
      SELECT 1 FROM section_items other
      WHERE other.content_section_id = si.content_section_id AND other.sort_order = 40
  );

SELECT pg_temp.put_slide(10::smallint, 'en', 'Clearer Communication',
    'Connect teams through structured PTT channels, with private calls when needed.');
SELECT pg_temp.put_slide(10::smallint, 'id', 'Komunikasi yang Lebih Jelas',
    'Hubungkan tim lewat channel PTT yang tertata, dengan panggilan privat saat dibutuhkan.');

SELECT pg_temp.put_slide(20::smallint, 'en', 'Visibility Across Field Units',
    'See who is online and each unit''s latest available location, so coordination stays on track.');
SELECT pg_temp.put_slide(20::smallint, 'id', 'Visibilitas Seluruh Unit Lapangan',
    'Lihat siapa yang online dan lokasi terakhir setiap unit, sehingga koordinasi tetap terarah.');

SELECT pg_temp.put_slide(30::smallint, 'en', 'Centralized Administration',
    'Manage users, channels, access, and device sessions from one WebAdmin console.');
SELECT pg_temp.put_slide(30::smallint, 'id', 'Administrasi Terpusat',
    'Kelola pengguna, channel, hak akses, dan sesi perangkat dari satu konsol WebAdmin.');

SELECT pg_temp.put_slide(40::smallint, 'en', 'Flexible Deployment',
    'Choose Managed SaaS operated by AM², or an On-Premise deployment operated by your own team.');
SELECT pg_temp.put_slide(40::smallint, 'id', 'Deployment yang Fleksibel',
    'Pilih Managed SaaS yang dioperasikan AM², atau On-Premise yang dioperasikan tim Anda sendiri.');

COMMIT;

SELECT si.id, si.sort_order, si.is_visible,
       si.image_id IS NOT NULL AS has_image,
       en.title AS title_en, idt.title AS title_id
FROM section_items si
JOIN content_sections cs ON cs.id = si.content_section_id
LEFT JOIN section_item_translations en  ON en.section_item_id  = si.id AND en.locale_code  = 'en'
LEFT JOIN section_item_translations idt ON idt.section_item_id = si.id AND idt.locale_code = 'id'
WHERE cs.section_key = 'solutions_capabilities'
ORDER BY si.sort_order, si.id;
