SET client_encoding = 'UTF8';

BEGIN;

ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_platform_chk;
ALTER TABLE pages ADD CONSTRAINT pages_platform_chk CHECK (
    CASE
        WHEN template IN ('product', 'feature') THEN platform_id IS NOT NULL
        WHEN template = 'platform'              THEN true
        ELSE platform_id IS NULL
    END
);

CREATE UNIQUE INDEX IF NOT EXISTS pages_combined_platform_uidx
    ON pages (template) WHERE template = 'platform' AND platform_id IS NULL;

COMMENT ON TABLE  platforms IS 'The two AM² platforms: AM² PTT and AM² Command Center, presented together on one combined platform page (AM² PTT & Command Center). Used by the Product/Features pages and the "Product of Interest" option.';
COMMENT ON TABLE  pages IS 'Landing page pages. Routing: path without a language prefix.';
COMMENT ON COLUMN pages.platform_id IS 'Required for the product/feature templates. Platform template: one page per platform, or NULL for the single combined AM² PTT & Command Center page.';

CREATE FUNCTION pg_temp.page_id(p_path text)
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE v_id integer;
BEGIN
    IF p_path IS NULL THEN RETURN NULL; END IF;
    SELECT id INTO v_id FROM pages WHERE path = p_path;
    IF v_id IS NULL THEN RAISE EXCEPTION 'Migration 10: page % not found', p_path; END IF;
    RETURN v_id;
END;
$$;

CREATE FUNCTION pg_temp.section_image(p_key text)
RETURNS uuid LANGUAGE sql AS $$
    SELECT image_id FROM content_sections WHERE section_key = p_key;
$$;

CREATE FUNCTION pg_temp.item_image(p_key text, p_sort int)
RETURNS uuid LANGUAGE sql AS $$
    SELECT si.image_id
    FROM section_items si JOIN content_sections cs ON cs.id = si.content_section_id
    WHERE cs.section_key = p_key AND si.sort_order = p_sort
    ORDER BY si.id LIMIT 1;
$$;

CREATE FUNCTION pg_temp.product_image(p_code text)
RETURNS uuid LANGUAGE sql AS $$
    SELECT image_id FROM products WHERE code = p_code;
$$;

CREATE FUNCTION pg_temp.put_section(p_key text, p_type text, p_image uuid, p_cta_path text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO content_sections (section_key, section_type, image_id, cta_page_id)
    VALUES (p_key, p_type, p_image, pg_temp.page_id(p_cta_path))
    ON CONFLICT (section_key) DO UPDATE
        SET section_type = EXCLUDED.section_type,
            cta_page_id  = EXCLUDED.cta_page_id,
            image_id     = COALESCE(content_sections.image_id, EXCLUDED.image_id),
            updated_at   = now();
END;
$$;

CREATE FUNCTION pg_temp.put_section_text(
    p_key text, p_locale text, p_eyebrow text, p_heading text, p_highlight text, p_body text, p_cta text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_id integer;
BEGIN
    SELECT id INTO v_id FROM content_sections WHERE section_key = p_key;
    IF v_id IS NULL THEN RAISE EXCEPTION 'Migration 10: section % not found', p_key; END IF;
    INSERT INTO content_section_translations
        (content_section_id, locale_code, eyebrow, heading, heading_highlight, body, cta_label)
    VALUES (v_id, p_locale, p_eyebrow, p_heading, p_highlight, p_body, p_cta)
    ON CONFLICT (content_section_id, locale_code) DO UPDATE
        SET eyebrow = EXCLUDED.eyebrow, heading = EXCLUDED.heading,
            heading_highlight = EXCLUDED.heading_highlight, body = EXCLUDED.body,
            cta_label = EXCLUDED.cta_label, updated_at = now();
END;
$$;

CREATE FUNCTION pg_temp.put_item(p_key text, p_sort smallint, p_image uuid, p_link_path text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_section integer;
    v_item    integer;
BEGIN
    SELECT id INTO v_section FROM content_sections WHERE section_key = p_key;
    IF v_section IS NULL THEN RAISE EXCEPTION 'Migration 10: section % not found', p_key; END IF;

    SELECT id INTO v_item FROM section_items
    WHERE content_section_id = v_section AND sort_order = p_sort
    ORDER BY id LIMIT 1;

    IF v_item IS NULL THEN
        INSERT INTO section_items (content_section_id, sort_order, image_id, link_page_id)
        VALUES (v_section, p_sort, p_image, pg_temp.page_id(p_link_path));
    ELSE
        UPDATE section_items
        SET link_page_id = pg_temp.page_id(p_link_path),
            image_id     = COALESCE(image_id, p_image),
            updated_at   = now()
        WHERE id = v_item;
    END IF;
END;
$$;

CREATE FUNCTION pg_temp.put_item_text(
    p_key text, p_sort int, p_locale text, p_title text, p_description text, p_link text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_id integer;
BEGIN
    SELECT si.id INTO v_id
    FROM section_items si JOIN content_sections cs ON cs.id = si.content_section_id
    WHERE cs.section_key = p_key AND si.sort_order = p_sort
    ORDER BY si.id LIMIT 1;
    IF v_id IS NULL THEN RAISE EXCEPTION 'Migration 10: item % / sort % not found', p_key, p_sort; END IF;
    INSERT INTO section_item_translations (section_item_id, locale_code, title, description, link_label)
    VALUES (v_id, p_locale, p_title, p_description, p_link)
    ON CONFLICT (section_item_id, locale_code) DO UPDATE
        SET title = EXCLUDED.title, description = EXCLUDED.description,
            link_label = EXCLUDED.link_label, updated_at = now();
END;
$$;

CREATE FUNCTION pg_temp.place(p_path text, p_key text, p_sort smallint)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO page_content_sections (page_id, content_section_id, sort_order)
    SELECT pg_temp.page_id(p_path), cs.id, p_sort
    FROM content_sections cs WHERE cs.section_key = p_key
    ON CONFLICT (page_id, content_section_id) DO UPDATE
        SET sort_order = EXCLUDED.sort_order, is_visible = true, updated_at = now();
    IF NOT FOUND THEN RAISE EXCEPTION 'Migration 10: section % not found', p_key; END IF;
END;
$$;

INSERT INTO pages (path, template, platform_id, is_published)
VALUES ('/platforms/am2-ptt-command-center', 'platform', NULL, false)
ON CONFLICT (path) DO NOTHING;

INSERT INTO page_translations (page_id, locale_code, title, meta_description)
SELECT pg_temp.page_id('/platforms/am2-ptt-command-center'), v.locale, v.title, v.meta
FROM (VALUES
    ('en', 'AM² PTT & Command Center | Field Communication & Visual Operations',
     'Push-to-talk for field teams and body-camera visual workflows for supervisors, managed through WebAdmin. Available as Managed SaaS or On-Premise.'),
    ('id', 'AM² PTT & Command Center | Komunikasi Lapangan & Operasi Visual',
     'Push-to-talk untuk tim lapangan dan alur kerja visual body camera untuk supervisor, dikelola melalui WebAdmin. Tersedia sebagai Managed SaaS atau On-Premise.')
) AS v (locale, title, meta)
ON CONFLICT (page_id, locale_code) DO UPDATE
    SET title = EXCLUDED.title, meta_description = EXCLUDED.meta_description, updated_at = now();

SELECT pg_temp.put_section('platform_combined_hero', 'hero', pg_temp.section_image('platform_ptt_hero'), NULL);
SELECT pg_temp.put_section_text('platform_combined_hero', 'en', NULL,
    'One Platform for Field Voice and Visual Operations', 'Field Voice and Visual Operations',
    'AM² PTT & Command Center brings push-to-talk for field teams and body-camera visual workflows for supervisors together, managed through WebAdmin.', NULL);
SELECT pg_temp.put_section_text('platform_combined_hero', 'id', NULL,
    'Satu Platform untuk Komunikasi dan Operasi Visual Lapangan', 'Komunikasi dan Operasi Visual Lapangan',
    'AM² PTT & Command Center menyatukan push-to-talk untuk tim lapangan dan alur kerja visual body camera untuk supervisor, dikelola melalui WebAdmin.', NULL);

SELECT pg_temp.put_section('platform_combined_ptt', 'split_list', pg_temp.section_image('platform_ptt_capabilities'), NULL);
SELECT pg_temp.put_section_text('platform_combined_ptt', 'en', NULL,
    'AM² PTT: Push-to-Talk for Teams on the Move', 'Teams on the Move',
    'Channels, one-to-one voice, presence, and latest unit locations on Android devices.', NULL);
SELECT pg_temp.put_section_text('platform_combined_ptt', 'id', NULL,
    'AM² PTT: Push-to-Talk untuk Tim yang Terus Bergerak', 'Tim yang Terus Bergerak',
    'Channel, komunikasi satu-ke-satu, status online, dan lokasi terakhir unit di perangkat Android.', NULL);
SELECT pg_temp.put_item('platform_combined_ptt', 10::smallint, NULL, NULL);
SELECT pg_temp.put_item('platform_combined_ptt', 20::smallint, NULL, NULL);
SELECT pg_temp.put_item('platform_combined_ptt', 30::smallint, NULL, NULL);
SELECT pg_temp.put_item_text('platform_combined_ptt', 10, 'en', 'Channels & One-to-One Talk', 'Talk to a whole channel at once, or reach one person privately through the AM² relay.', NULL);
SELECT pg_temp.put_item_text('platform_combined_ptt', 10, 'id', 'Channel & Komunikasi Privat', 'Bicara ke satu channel sekaligus, atau hubungi satu orang secara privat melalui relay AM².', NULL);
SELECT pg_temp.put_item_text('platform_combined_ptt', 20, 'en', 'Presence & Latest Location', 'See who is online, who is speaking, and where each unit was last reported.', NULL);
SELECT pg_temp.put_item_text('platform_combined_ptt', 20, 'id', 'Status Online & Lokasi Terakhir', 'Lihat siapa yang online, siapa yang sedang bicara, dan posisi terakhir setiap unit.', NULL);
SELECT pg_temp.put_item_text('platform_combined_ptt', 30, 'en', 'Optional Video', 'Switch to live video when the device and platform setup support it.', NULL);
SELECT pg_temp.put_item_text('platform_combined_ptt', 30, 'id', 'Video Opsional', 'Beralih ke video langsung bila perangkat dan konfigurasi platform mendukung.', NULL);

SELECT pg_temp.put_section('platform_combined_command_center', 'split_list', pg_temp.section_image('platform_cc_capabilities'), NULL);
SELECT pg_temp.put_section_text('platform_combined_command_center', 'en', NULL,
    'AM² Command Center: Visual Operations for Supervisors', 'Visual Operations',
    'Body-camera video and visual workflows in one command environment.', NULL);
SELECT pg_temp.put_section_text('platform_combined_command_center', 'id', NULL,
    'AM² Command Center: Operasi Visual untuk Supervisor', 'Operasi Visual',
    'Video body camera dan alur kerja visual dalam satu pusat komando.', NULL);
SELECT pg_temp.put_item('platform_combined_command_center', 10::smallint, NULL, NULL);
SELECT pg_temp.put_item('platform_combined_command_center', 20::smallint, NULL, NULL);
SELECT pg_temp.put_item('platform_combined_command_center', 30::smallint, NULL, NULL);
SELECT pg_temp.put_item_text('platform_combined_command_center', 10, 'en', 'Body Camera Integration', 'Connect selected body-camera devices to your operational workflows.', NULL);
SELECT pg_temp.put_item_text('platform_combined_command_center', 10, 'id', 'Integrasi Body Camera', 'Hubungkan body camera pilihan ke alur kerja operasional Anda.', NULL);
SELECT pg_temp.put_item_text('platform_combined_command_center', 20, 'en', 'Visual Operational Workflow', 'Bring field video and its operational context together in one command environment.', NULL);
SELECT pg_temp.put_item_text('platform_combined_command_center', 20, 'id', 'Alur Kerja Visual', 'Satukan video dari lapangan dan konteks operasionalnya dalam satu pusat komando.', NULL);
SELECT pg_temp.put_item_text('platform_combined_command_center', 30, 'en', 'Supervisor & Administrator Workspace', 'Give supervisors and administrators one workspace for monitoring and coordination.', NULL);
SELECT pg_temp.put_item_text('platform_combined_command_center', 30, 'id', 'Ruang Kerja Supervisor & Admin', 'Beri supervisor dan administrator satu ruang kerja untuk pemantauan dan koordinasi.', NULL);

SELECT pg_temp.put_section('platform_combined_benefits', 'card_grid', NULL, NULL);
SELECT pg_temp.put_section_text('platform_combined_benefits', 'en', NULL,
    'Field Communication Meets Visual Context', 'Visual Context',
    'Voice from the field, visual context for supervisors, and central administration work together.', NULL);
SELECT pg_temp.put_section_text('platform_combined_benefits', 'id', NULL,
    'Komunikasi Lapangan Bertemu Konteks Visual', 'Konteks Visual',
    'Suara dari lapangan, konteks visual untuk supervisor, dan administrasi terpusat bekerja bersama.', NULL);
SELECT pg_temp.put_item('platform_combined_benefits', 10::smallint, pg_temp.item_image('platform_ptt_benefits', 10), NULL);
SELECT pg_temp.put_item('platform_combined_benefits', 20::smallint, pg_temp.item_image('platform_cc_benefits', 20), NULL);
SELECT pg_temp.put_item('platform_combined_benefits', 30::smallint, pg_temp.item_image('platform_cc_benefits', 30), NULL);
SELECT pg_temp.put_item_text('platform_combined_benefits', 10, 'en', 'Reach Teams Without Dialing', 'Address a whole team on its channel, or one unit privately, with a single press.', NULL);
SELECT pg_temp.put_item_text('platform_combined_benefits', 10, 'id', 'Jangkau Tim Tanpa Menelepon', 'Sampaikan pesan ke seluruh tim lewat channel, atau ke satu unit secara privat, cukup dengan sekali tekan.', NULL);
SELECT pg_temp.put_item_text('platform_combined_benefits', 20, 'en', 'See Operational Context', 'View available unit status, location, and video from the field.', NULL);
SELECT pg_temp.put_item_text('platform_combined_benefits', 20, 'id', 'Lihat Konteks Operasional', 'Pantau status unit, lokasi, dan video yang tersedia dari lapangan.', NULL);
SELECT pg_temp.put_item_text('platform_combined_benefits', 30, 'en', 'Coordinate from One Place', 'Supervisors and administrators manage visual workflows from a single workspace.', NULL);
SELECT pg_temp.put_item_text('platform_combined_benefits', 30, 'id', 'Koordinasi dari Satu Tempat', 'Supervisor dan administrator mengelola alur kerja visual dari satu ruang kerja.', NULL);

SELECT pg_temp.put_section('platform_combined_devices', 'card_grid', NULL, NULL);
SELECT pg_temp.put_section_text('platform_combined_devices', 'en', NULL,
    'Choose the Devices That Fit Your Operation', 'Fit Your Operation', NULL, NULL);
SELECT pg_temp.put_section_text('platform_combined_devices', 'id', NULL,
    'Pilih Perangkat yang Sesuai dengan Operasi Anda', 'Sesuai dengan Operasi Anda', NULL, NULL);
SELECT pg_temp.put_item('platform_combined_devices', 10::smallint, pg_temp.product_image('ht_poc_voice_maps'), '/products/am2-ptt');
SELECT pg_temp.put_item('platform_combined_devices', 20::smallint, pg_temp.product_image('body_camera'), '/products/am2-command-center');
SELECT pg_temp.put_item_text('platform_combined_devices', 10, 'en', 'AM² PTT Devices', 'Compare voice-only and video-capable Android handhelds for your teams.', 'View AM² PTT Devices');
SELECT pg_temp.put_item_text('platform_combined_devices', 10, 'id', 'Perangkat AM² PTT', 'Bandingkan HT Android khusus suara dan HT dengan video untuk tim Anda.', 'Lihat Perangkat AM² PTT');
SELECT pg_temp.put_item_text('platform_combined_devices', 20, 'en', 'AM² Command Center Devices', 'Selected body-camera models configured for your operational requirements.', 'View Command Center Devices');
SELECT pg_temp.put_item_text('platform_combined_devices', 20, 'id', 'Perangkat AM² Command Center', 'Model body camera pilihan yang dikonfigurasi sesuai kebutuhan operasional Anda.', 'Lihat Perangkat Command Center');

SELECT pg_temp.place('/platforms/am2-ptt-command-center', 'platform_combined_hero',           10::smallint);
SELECT pg_temp.place('/platforms/am2-ptt-command-center', 'platform_combined_ptt',            20::smallint);
SELECT pg_temp.place('/platforms/am2-ptt-command-center', 'platform_combined_command_center', 30::smallint);
SELECT pg_temp.place('/platforms/am2-ptt-command-center', 'platform_combined_benefits',       40::smallint);
SELECT pg_temp.place('/platforms/am2-ptt-command-center', 'platform_combined_devices',        50::smallint);
SELECT pg_temp.place('/platforms/am2-ptt-command-center', 'cta_fit_operation',                60::smallint);

CREATE TEMP TABLE old_platform_pages ON COMMIT DROP AS
SELECT id, path FROM pages WHERE path IN ('/platforms/am2-ptt', '/platforms/am2-command-center');

UPDATE navigation_items
SET page_id = pg_temp.page_id('/platforms/am2-ptt-command-center'), updated_at = now()
WHERE page_id = (SELECT id FROM old_platform_pages WHERE path = '/platforms/am2-ptt');

UPDATE navigation_items
SET is_visible = false, updated_at = now()
WHERE page_id = (SELECT id FROM old_platform_pages WHERE path = '/platforms/am2-command-center');

INSERT INTO navigation_item_translations (navigation_item_id, locale_code, label)
SELECT n.id, v.locale, 'AM² PTT & Command Center'
FROM navigation_items n
CROSS JOIN (VALUES ('en'), ('id')) AS v (locale)
WHERE n.menu_location = 'header'
  AND n.page_id = pg_temp.page_id('/platforms/am2-ptt-command-center')
ON CONFLICT (navigation_item_id, locale_code) DO UPDATE SET label = EXCLUDED.label, updated_at = now();

UPDATE content_sections
SET cta_page_id = pg_temp.page_id('/platforms/am2-ptt-command-center'), updated_at = now()
WHERE cta_page_id IN (SELECT id FROM old_platform_pages);

UPDATE section_items
SET link_page_id = pg_temp.page_id('/platforms/am2-ptt-command-center'), updated_at = now()
WHERE link_page_id IN (SELECT id FROM old_platform_pages);

SELECT pg_temp.put_section_text('home_platforms', 'en', NULL,
    E'AM² PTT & Command Center,\nManaged from One Place', 'Managed from One Place', NULL, NULL);
SELECT pg_temp.put_section_text('home_platforms', 'id', NULL,
    E'AM² PTT & Command Center,\nDikelola dari Satu Tempat', 'Dikelola dari Satu Tempat', NULL, NULL);

UPDATE page_translations pt
SET meta_description = v.meta, updated_at = now()
FROM (VALUES
    ('en', 'AM² combines purpose-configured Android devices, the AM² PTT & Command Center platform, and flexible deployment for field teams.'),
    ('id', 'AM² memadukan perangkat Android yang dikonfigurasi khusus, platform AM² PTT & Command Center, dan deployment fleksibel untuk tim lapangan.')
) AS v (locale, meta)
WHERE pt.page_id = pg_temp.page_id('/about-us') AND pt.locale_code = v.locale;

UPDATE pages
SET is_published = true, published_at = COALESCE(published_at, now()), updated_at = now()
WHERE path = '/platforms/am2-ptt-command-center';

UPDATE pages
SET is_published = false, updated_at = now()
WHERE id IN (SELECT id FROM old_platform_pages) AND is_published;

COMMIT;

SELECT path, template, platform_id, is_published
FROM pages WHERE path LIKE '/platforms/%' ORDER BY path;

SELECT pcs.sort_order, cs.section_key, cs.section_type, cs.image_id IS NOT NULL AS has_image,
       en.heading AS heading_en, idt.heading AS heading_id
FROM page_content_sections pcs
JOIN content_sections cs ON cs.id = pcs.content_section_id
LEFT JOIN content_section_translations en  ON en.content_section_id  = cs.id AND en.locale_code  = 'en'
LEFT JOIN content_section_translations idt ON idt.content_section_id = cs.id AND idt.locale_code = 'id'
WHERE pcs.page_id = (SELECT id FROM pages WHERE path = '/platforms/am2-ptt-command-center')
ORDER BY pcs.sort_order;

SELECT n.menu_location, n.sort_order, n.is_visible, p.path, t.label
FROM navigation_items n
JOIN pages p ON p.id = n.page_id
LEFT JOIN navigation_item_translations t ON t.navigation_item_id = n.id AND t.locale_code = 'en'
WHERE p.path LIKE '/platforms/%'
ORDER BY n.menu_location, n.id;
