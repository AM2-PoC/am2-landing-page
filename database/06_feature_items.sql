SET client_encoding = 'UTF8';

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.put_feature(
    p_key text, p_sort smallint, p_locale text, p_title text, p_description text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_section integer;
    v_item    integer;
BEGIN
    SELECT id INTO v_section FROM content_sections WHERE section_key = p_key;
    IF v_section IS NULL THEN
        RAISE EXCEPTION 'Section % not found: run 02_seed.sql first', p_key;
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

SELECT pg_temp.put_feature('feature_ptt_app_list', 50::smallint, 'en', 'Optional Video',
    'Share channel or private video when the device and platform configuration support it.');
SELECT pg_temp.put_feature('feature_ptt_app_list', 50::smallint, 'id', 'Video Opsional',
    'Bagikan video di channel atau secara privat bila perangkat dan konfigurasi platform mendukung.');

SELECT pg_temp.put_feature('feature_ptt_app_list', 60::smallint, 'en', 'Configurable Field Controls',
    'Talk with on-screen controls, compatible device keys, headset and media buttons, or tested BLE accessories.');
SELECT pg_temp.put_feature('feature_ptt_app_list', 60::smallint, 'id', 'Kontrol Lapangan yang Dapat Diatur',
    'Bicara lewat tombol di layar, tombol perangkat yang kompatibel, tombol headset dan media, atau aksesori BLE yang sudah diuji.');

SELECT pg_temp.put_feature('feature_ptt_app_list', 70::smallint, 'en', 'VOX',
    'Transmit hands-free with configurable voice activation for supported workflows.');
SELECT pg_temp.put_feature('feature_ptt_app_list', 70::smallint, 'id', 'VOX',
    'Kirim suara tanpa menekan tombol dengan aktivasi suara yang dapat diatur, untuk alur kerja yang didukung.');

SELECT pg_temp.put_feature('feature_ptt_app_list', 80::smallint, 'en', 'Foreground Operation and Reconnect',
    'Runs as an Android foreground service and tries to reconnect after the connection drops.');
SELECT pg_temp.put_feature('feature_ptt_app_list', 80::smallint, 'id', 'Berjalan di Latar Depan & Tersambung Ulang',
    'Berjalan sebagai foreground service Android dan mencoba tersambung kembali setelah koneksi terputus.');

SELECT pg_temp.put_feature('feature_ptt_webadmin_list', 50::smallint, 'en', 'Device Session Control',
    'See active device sessions and sign out assigned units remotely when needed.');
SELECT pg_temp.put_feature('feature_ptt_webadmin_list', 50::smallint, 'id', 'Kontrol Sesi Perangkat',
    'Pantau sesi perangkat yang aktif dan keluarkan unit dari jarak jauh bila diperlukan.');

SELECT pg_temp.put_feature('feature_ptt_webadmin_list', 60::smallint, 'en', 'Operational Visibility',
    'Review available user, channel, and activity information in one place.');
SELECT pg_temp.put_feature('feature_ptt_webadmin_list', 60::smallint, 'id', 'Visibilitas Operasional',
    'Tinjau informasi pengguna, channel, dan aktivitas yang tersedia di satu tempat.');

SELECT pg_temp.put_feature('feature_ptt_webadmin_list', 70::smallint, 'en', 'Application Update Support',
    'Support managed app update workflows for approved deployments.');
SELECT pg_temp.put_feature('feature_ptt_webadmin_list', 70::smallint, 'id', 'Dukungan Pembaruan Aplikasi',
    'Dukung alur pembaruan aplikasi yang terkelola untuk deployment yang disetujui.');

COMMIT;

SELECT cs.section_key, si.id, si.sort_order,
       en.title AS title_en, idt.title AS title_id
FROM section_items si
JOIN content_sections cs ON cs.id = si.content_section_id
LEFT JOIN section_item_translations en  ON en.section_item_id  = si.id AND en.locale_code  = 'en'
LEFT JOIN section_item_translations idt ON idt.section_item_id = si.id AND idt.locale_code = 'id'
WHERE cs.section_key IN ('feature_ptt_app_list', 'feature_ptt_webadmin_list')
ORDER BY cs.section_key, si.sort_order, si.id;
