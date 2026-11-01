SET client_encoding = 'UTF8';

BEGIN;

CREATE SCHEMA IF NOT EXISTS copy_backup;

DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'locales', 'page_translations', 'navigation_item_translations',
        'content_section_translations', 'section_item_translations', 'product_translations',
        'responsibility_translations', 'operating_location_translations', 'file_translations'
    ] LOOP
        IF to_regclass('public.' || t) IS NOT NULL AND to_regclass('copy_backup.' || t) IS NULL THEN
            EXECUTE format('CREATE TABLE copy_backup.%I AS TABLE public.%I', t, t);
        END IF;
    END LOOP;
END;
$$;

CREATE FUNCTION pg_temp.put_page(p_path text, p_locale text, p_title text, p_meta text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_id integer;
BEGIN
    SELECT id INTO v_id FROM pages WHERE path = p_path;
    IF v_id IS NULL THEN RAISE WARNING 'Copy: page % not found, skipped', p_path; RETURN; END IF;
    INSERT INTO page_translations (page_id, locale_code, title, meta_description)
    VALUES (v_id, p_locale, p_title, p_meta)
    ON CONFLICT (page_id, locale_code) DO UPDATE
        SET title = EXCLUDED.title, meta_description = EXCLUDED.meta_description, updated_at = now();
END;
$$;

CREATE FUNCTION pg_temp.nav_id(p_menu text, p_at int[])
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE
    v_id integer := NULL;
    v_sort int;
BEGIN
    FOREACH v_sort IN ARRAY p_at LOOP
        SELECT id INTO v_id FROM navigation_items
        WHERE menu_location = p_menu AND parent_id IS NOT DISTINCT FROM v_id AND sort_order = v_sort
        ORDER BY id LIMIT 1;
        IF v_id IS NULL THEN RETURN NULL; END IF;
    END LOOP;
    RETURN v_id;
END;
$$;

CREATE FUNCTION pg_temp.put_nav(p_menu text, p_at int[], p_locale text, p_label text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_id integer := pg_temp.nav_id(p_menu, p_at);
BEGIN
    IF v_id IS NULL THEN RAISE WARNING 'Copy: % menu item at % not found, skipped', p_menu, p_at; RETURN; END IF;
    INSERT INTO navigation_item_translations (navigation_item_id, locale_code, label)
    VALUES (v_id, p_locale, p_label)
    ON CONFLICT (navigation_item_id, locale_code) DO UPDATE SET label = EXCLUDED.label, updated_at = now();
END;
$$;

CREATE FUNCTION pg_temp.put_section(
    p_key text, p_locale text, p_eyebrow text, p_heading text, p_highlight text, p_body text, p_cta text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_id integer;
BEGIN
    SELECT id INTO v_id FROM content_sections WHERE section_key = p_key;
    IF v_id IS NULL THEN RAISE WARNING 'Copy: section % not found, skipped', p_key; RETURN; END IF;
    INSERT INTO content_section_translations
        (content_section_id, locale_code, eyebrow, heading, heading_highlight, body, cta_label)
    VALUES (v_id, p_locale, p_eyebrow, p_heading, p_highlight, p_body, p_cta)
    ON CONFLICT (content_section_id, locale_code) DO UPDATE
        SET eyebrow = EXCLUDED.eyebrow, heading = EXCLUDED.heading,
            heading_highlight = EXCLUDED.heading_highlight, body = EXCLUDED.body,
            cta_label = EXCLUDED.cta_label, updated_at = now();
END;
$$;

CREATE FUNCTION pg_temp.put_item(
    p_key text, p_sort int, p_locale text, p_title text, p_description text, p_link text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_id integer;
BEGIN
    SELECT si.id INTO v_id
    FROM section_items si JOIN content_sections cs ON cs.id = si.content_section_id
    WHERE cs.section_key = p_key AND si.sort_order = p_sort
    ORDER BY si.id LIMIT 1;
    IF v_id IS NULL THEN RAISE WARNING 'Copy: item % / sort % not found, skipped', p_key, p_sort; RETURN; END IF;
    INSERT INTO section_item_translations (section_item_id, locale_code, title, description, link_label)
    VALUES (v_id, p_locale, p_title, p_description, p_link)
    ON CONFLICT (section_item_id, locale_code) DO UPDATE
        SET title = EXCLUDED.title, description = EXCLUDED.description,
            link_label = EXCLUDED.link_label, updated_at = now();
END;
$$;

CREATE FUNCTION pg_temp.put_alt(p_file uuid, p_locale text, p_alt text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    IF p_file IS NULL OR to_regclass('public.file_translations') IS NULL THEN RETURN; END IF;
    INSERT INTO file_translations (directus_files_id, locale_code, alt_text)
    VALUES (p_file, p_locale, p_alt)
    ON CONFLICT (directus_files_id, locale_code) DO UPDATE SET alt_text = EXCLUDED.alt_text, updated_at = now();
END;
$$;

UPDATE locales SET name = 'Bahasa Indonesia', is_active = true WHERE code = 'id';

SELECT pg_temp.put_page('/', 'en', 'AM² | Push-to-Talk, Unit Location & Video for Field Teams', 'Push-to-talk, latest unit locations, optional video, and central administration for field teams on Android. Available as Managed SaaS or On-Premise.');
SELECT pg_temp.put_page('/', 'id', 'AM² | Push-to-Talk, Lokasi Unit & Video untuk Tim Lapangan', 'Push-to-talk, lokasi terakhir unit, video opsional, dan administrasi terpusat untuk tim lapangan di Android. Tersedia sebagai Managed SaaS atau On-Premise.');
SELECT pg_temp.put_page('/solutions/why-am2', 'en', 'Why AM² | Communication Built Around Your Operation', 'See how AM² brings voice, unit visibility, administration, and flexible deployment together for teams spread across sites and shifts.');
SELECT pg_temp.put_page('/solutions/why-am2', 'id', 'Mengapa AM² | Komunikasi yang Mengikuti Operasi Anda', 'Pelajari cara AM² menyatukan komunikasi suara, visibilitas unit, administrasi, dan deployment fleksibel untuk tim yang tersebar di banyak lokasi.');
SELECT pg_temp.put_page('/platforms/am2-ptt', 'en', 'AM² PTT | Push-to-Talk Platform for Field Teams', 'Channels, one-to-one voice, presence, latest unit locations, and optional video for field teams on Android devices.');
SELECT pg_temp.put_page('/platforms/am2-ptt', 'id', 'AM² PTT | Platform Push-to-Talk untuk Tim Lapangan', 'Channel, komunikasi satu-ke-satu, status online, lokasi terakhir unit, dan video opsional untuk tim lapangan di perangkat Android.');
SELECT pg_temp.put_page('/platforms/am2-command-center', 'en', 'AM² Command Center | Visual Operations Platform', 'Bring body-camera video and visual workflows into one command environment for supervisors and administrators.');
SELECT pg_temp.put_page('/platforms/am2-command-center', 'id', 'AM² Command Center | Platform Operasi Visual', 'Satukan video body camera dan alur kerja visual dalam satu pusat komando untuk supervisor dan administrator.');
SELECT pg_temp.put_page('/products/am2-ptt', 'en', 'AM² PTT Devices | Android PoC Handhelds', 'Compare HT PoC Voice + Maps and HT PoC Voice & Video + Maps, selected Android handhelds configured for AM² PTT.');
SELECT pg_temp.put_page('/products/am2-ptt', 'id', 'Perangkat AM² PTT | HT Android PoC', 'Bandingkan HT PoC Voice + Maps dan HT PoC Voice & Video + Maps, HT Android pilihan yang dikonfigurasi untuk AM² PTT.');
SELECT pg_temp.put_page('/products/am2-command-center', 'en', 'AM² Command Center Devices | Body Cameras', 'Selected body-camera models configured for AM² Command Center and your operational requirements.');
SELECT pg_temp.put_page('/products/am2-command-center', 'id', 'Perangkat AM² Command Center | Body Camera', 'Model body camera pilihan yang dikonfigurasi untuk AM² Command Center sesuai kebutuhan operasional Anda.');
SELECT pg_temp.put_page('/services/saas', 'en', 'Managed SaaS | AM²', 'AM² operates the platform infrastructure and updates. Your team manages users, devices, channels, and field connectivity.');
SELECT pg_temp.put_page('/services/saas', 'id', 'Managed SaaS | AM²', 'AM² mengoperasikan infrastruktur platform dan pembaruannya. Tim Anda mengelola pengguna, perangkat, channel, dan konektivitas lapangan.');
SELECT pg_temp.put_page('/services/on-premise', 'en', 'On-Premise Deployment | AM²', 'Run AM² on infrastructure your organization controls, with software, implementation guidance, and updates from AM².');
SELECT pg_temp.put_page('/services/on-premise', 'id', 'Deployment On-Premise | AM²', 'Jalankan AM² di infrastruktur yang dikendalikan organisasi Anda, dengan software, panduan implementasi, dan pembaruan dari AM².');
SELECT pg_temp.put_page('/features/am2-ptt-application', 'en', 'AM² PTT App Features | Android Push-to-Talk', 'Channel push-to-talk, private voice and video, latest unit location, and presence in the AM² PTT app for Android.');
SELECT pg_temp.put_page('/features/am2-ptt-application', 'id', 'Fitur Aplikasi AM² PTT | Push-to-Talk Android', 'Push-to-talk via channel, suara dan video privat, lokasi terakhir unit, dan status kehadiran di aplikasi AM² PTT untuk Android.');
SELECT pg_temp.put_page('/features/am2-ptt-webadmin', 'en', 'AM² PTT WebAdmin Features | Central Administration', 'Manage organizations, users, channels, permissions, features, and device sessions for AM² PTT from one web console.');
SELECT pg_temp.put_page('/features/am2-ptt-webadmin', 'id', 'Fitur AM² PTT WebAdmin | Administrasi Terpusat', 'Kelola organisasi, pengguna, channel, hak akses, fitur, dan sesi perangkat AM² PTT dari satu konsol web.');
SELECT pg_temp.put_page('/features/am2-command-center-application', 'en', 'AM² Command Center App Features | Visual Coordination', 'One visual workspace where supervisors follow body-camera video, unit status, and location to coordinate field activity.');
SELECT pg_temp.put_page('/features/am2-command-center-application', 'id', 'Fitur Aplikasi AM² Command Center | Koordinasi Visual', 'Satu ruang kerja visual bagi supervisor untuk memantau video body camera, status, dan lokasi unit saat mengoordinasikan aktivitas lapangan.');
SELECT pg_temp.put_page('/features/am2-command-center-webadmin', 'en', 'AM² Command Center WebAdmin Features | Access Control', 'Manage organizations, users, roles, body-camera assignments, and feature access for AM² Command Center.');
SELECT pg_temp.put_page('/features/am2-command-center-webadmin', 'id', 'Fitur AM² Command Center WebAdmin | Kontrol Akses', 'Kelola organisasi, pengguna, peran, penetapan body camera, dan akses fitur untuk AM² Command Center.');
SELECT pg_temp.put_page('/contact-sales', 'en', 'Contact Sales | Plan Your AM² Deployment', 'Tell the AM² team about your operating environment, unit count, and preferred deployment model to get a recommended setup.');
SELECT pg_temp.put_page('/contact-sales', 'id', 'Hubungi Sales | Rencanakan Deployment AM²', 'Ceritakan lingkungan operasional, jumlah unit, dan model deployment yang Anda inginkan kepada tim AM² untuk mendapatkan rekomendasi konfigurasi.');
SELECT pg_temp.put_page('/about-us', 'en', 'About AM² | Operational Communication for Field Teams', 'AM² combines purpose-configured Android devices, two communication platforms, and flexible deployment for field teams.');
SELECT pg_temp.put_page('/about-us', 'id', 'Tentang AM² | Komunikasi Operasional untuk Tim Lapangan', 'AM² memadukan perangkat Android yang dikonfigurasi khusus, dua platform komunikasi, dan deployment fleksibel untuk tim lapangan.');

SELECT pg_temp.put_nav('header', ARRAY[10]::int[], 'en', 'Home');
SELECT pg_temp.put_nav('header', ARRAY[10]::int[], 'id', 'Beranda');
SELECT pg_temp.put_nav('header', ARRAY[20]::int[], 'en', 'Solutions');
SELECT pg_temp.put_nav('header', ARRAY[20]::int[], 'id', 'Solusi');
SELECT pg_temp.put_nav('header', ARRAY[20, 10]::int[], 'en', 'Why AM²');
SELECT pg_temp.put_nav('header', ARRAY[20, 10]::int[], 'id', 'Mengapa AM²');
SELECT pg_temp.put_nav('header', ARRAY[30]::int[], 'en', 'Ecosystems');
SELECT pg_temp.put_nav('header', ARRAY[30]::int[], 'id', 'Ekosistem');
SELECT pg_temp.put_nav('header', ARRAY[30, 10]::int[], 'en', 'Products');
SELECT pg_temp.put_nav('header', ARRAY[30, 10]::int[], 'id', 'Produk');
SELECT pg_temp.put_nav('header', ARRAY[30, 10, 10]::int[], 'en', 'AM² PTT Devices');
SELECT pg_temp.put_nav('header', ARRAY[30, 10, 10]::int[], 'id', 'Perangkat AM² PTT');
SELECT pg_temp.put_nav('header', ARRAY[30, 10, 20]::int[], 'en', 'AM² Command Center Devices');
SELECT pg_temp.put_nav('header', ARRAY[30, 10, 20]::int[], 'id', 'Perangkat AM² Command Center');
SELECT pg_temp.put_nav('header', ARRAY[30, 20]::int[], 'en', 'Services');
SELECT pg_temp.put_nav('header', ARRAY[30, 20]::int[], 'id', 'Layanan');
SELECT pg_temp.put_nav('header', ARRAY[30, 20, 10]::int[], 'en', 'Managed SaaS');
SELECT pg_temp.put_nav('header', ARRAY[30, 20, 10]::int[], 'id', 'Managed SaaS');
SELECT pg_temp.put_nav('header', ARRAY[30, 20, 20]::int[], 'en', 'On-Premise');
SELECT pg_temp.put_nav('header', ARRAY[30, 20, 20]::int[], 'id', 'On-Premise');
SELECT pg_temp.put_nav('header', ARRAY[30, 30]::int[], 'en', 'Platforms');
SELECT pg_temp.put_nav('header', ARRAY[30, 30]::int[], 'id', 'Platform');
SELECT pg_temp.put_nav('header', ARRAY[30, 30, 10]::int[], 'en', 'AM² PTT');
SELECT pg_temp.put_nav('header', ARRAY[30, 30, 10]::int[], 'id', 'AM² PTT');
SELECT pg_temp.put_nav('header', ARRAY[30, 30, 20]::int[], 'en', 'AM² Command Center');
SELECT pg_temp.put_nav('header', ARRAY[30, 30, 20]::int[], 'id', 'AM² Command Center');
SELECT pg_temp.put_nav('header', ARRAY[40]::int[], 'en', 'Features');
SELECT pg_temp.put_nav('header', ARRAY[40]::int[], 'id', 'Fitur');
SELECT pg_temp.put_nav('header', ARRAY[40, 10]::int[], 'en', 'AM² PTT App');
SELECT pg_temp.put_nav('header', ARRAY[40, 10]::int[], 'id', 'Aplikasi AM² PTT');
SELECT pg_temp.put_nav('header', ARRAY[40, 20]::int[], 'en', 'AM² PTT WebAdmin');
SELECT pg_temp.put_nav('header', ARRAY[40, 20]::int[], 'id', 'AM² PTT WebAdmin');
SELECT pg_temp.put_nav('header', ARRAY[40, 30]::int[], 'en', 'AM² Command Center App');
SELECT pg_temp.put_nav('header', ARRAY[40, 30]::int[], 'id', 'Aplikasi AM² Command Center');
SELECT pg_temp.put_nav('header', ARRAY[40, 40]::int[], 'en', 'AM² Command Center WebAdmin');
SELECT pg_temp.put_nav('header', ARRAY[40, 40]::int[], 'id', 'AM² Command Center WebAdmin');
SELECT pg_temp.put_nav('header', ARRAY[70]::int[], 'en', 'Contact Sales');
SELECT pg_temp.put_nav('header', ARRAY[70]::int[], 'id', 'Hubungi Sales');
SELECT pg_temp.put_nav('header', ARRAY[80]::int[], 'en', 'About Us');
SELECT pg_temp.put_nav('header', ARRAY[80]::int[], 'id', 'Tentang Kami');
SELECT pg_temp.put_nav('footer', ARRAY[10]::int[], 'en', 'Solutions');
SELECT pg_temp.put_nav('footer', ARRAY[10]::int[], 'id', 'Solusi');
SELECT pg_temp.put_nav('footer', ARRAY[10, 10]::int[], 'en', 'Why AM²');
SELECT pg_temp.put_nav('footer', ARRAY[10, 10]::int[], 'id', 'Mengapa AM²');
SELECT pg_temp.put_nav('footer', ARRAY[20]::int[], 'en', 'Ecosystems');
SELECT pg_temp.put_nav('footer', ARRAY[20]::int[], 'id', 'Ekosistem');
SELECT pg_temp.put_nav('footer', ARRAY[20, 10]::int[], 'en', 'Platforms');
SELECT pg_temp.put_nav('footer', ARRAY[20, 10]::int[], 'id', 'Platform');
SELECT pg_temp.put_nav('footer', ARRAY[20, 20]::int[], 'en', 'Products');
SELECT pg_temp.put_nav('footer', ARRAY[20, 20]::int[], 'id', 'Produk');
SELECT pg_temp.put_nav('footer', ARRAY[20, 30]::int[], 'en', 'Services');
SELECT pg_temp.put_nav('footer', ARRAY[20, 30]::int[], 'id', 'Layanan');
SELECT pg_temp.put_nav('footer', ARRAY[30]::int[], 'en', 'Features');
SELECT pg_temp.put_nav('footer', ARRAY[30]::int[], 'id', 'Fitur');
SELECT pg_temp.put_nav('footer', ARRAY[30, 10]::int[], 'en', 'PTT App');
SELECT pg_temp.put_nav('footer', ARRAY[30, 10]::int[], 'id', 'Aplikasi PTT');
SELECT pg_temp.put_nav('footer', ARRAY[30, 20]::int[], 'en', 'PTT WebAdmin');
SELECT pg_temp.put_nav('footer', ARRAY[30, 20]::int[], 'id', 'WebAdmin PTT');

SELECT pg_temp.put_section('site_footer', 'en', NULL, NULL, NULL, 'Push-to-talk, unit location, and central administration for field teams—as Managed SaaS or On-Premise.', NULL);
SELECT pg_temp.put_section('site_footer', 'id', NULL, NULL, NULL, 'Push-to-talk, lokasi unit, dan administrasi terpusat untuk tim lapangan—sebagai Managed SaaS atau On-Premise.', NULL);

SELECT pg_temp.put_section('home_hero', 'en', NULL, E'Press Once,\nYour Team Hears You.', 'Your Team Hears You.', 'Push-to-talk, latest unit locations, optional video, and one admin console for your Android devices—run by AM² or on your own servers.', NULL);
SELECT pg_temp.put_section('home_hero', 'id', NULL, E'Sekali Tekan,\nTim Langsung Mendengar.', 'Tim Langsung Mendengar.', 'Push-to-talk, lokasi terakhir unit, video opsional, dan satu konsol admin untuk perangkat Android Anda—dikelola AM² atau di server sendiri.', NULL);

SELECT pg_temp.put_item('home_outcomes', 10, 'en', 'Talk Without Dialing', 'Press once to speak to a whole channel, or reach one unit privately.', NULL);
SELECT pg_temp.put_item('home_outcomes', 10, 'id', 'Bicara Tanpa Menelepon', 'Tekan sekali untuk bicara ke satu channel, atau hubungi satu unit secara privat.', NULL);
SELECT pg_temp.put_item('home_outcomes', 20, 'en', 'Know Who''s Available', 'See which units are online, who is speaking, and where each unit was last reported.', NULL);
SELECT pg_temp.put_item('home_outcomes', 20, 'id', 'Tahu Siapa yang Siaga', 'Lihat unit yang online, siapa yang sedang bicara, dan lokasi terakhir setiap unit.', NULL);
SELECT pg_temp.put_item('home_outcomes', 30, 'en', 'Control Access Centrally', 'Manage users, channels, permissions, and devices from one WebAdmin console.', NULL);
SELECT pg_temp.put_item('home_outcomes', 30, 'id', 'Atur Akses dari Satu Tempat', 'Kelola pengguna, channel, hak akses, dan perangkat lewat satu konsol WebAdmin.', NULL);
SELECT pg_temp.put_item('home_outcomes', 40, 'en', 'Add Video When It Matters', 'Switch to live video from video-enabled handhelds or body cameras when the situation needs eyes on it.', NULL);
SELECT pg_temp.put_item('home_outcomes', 40, 'id', 'Tambahkan Video Saat Diperlukan', 'Gunakan video langsung dari HT berkamera atau body camera saat kondisi di lapangan perlu dilihat.', NULL);

SELECT pg_temp.put_section('home_platforms', 'en', NULL, E'Two Platforms,\nManaged from One Place', 'Managed from One Place', NULL, NULL);
SELECT pg_temp.put_section('home_platforms', 'id', NULL, E'Dua Platform,\nDikelola dari Satu Tempat', 'Dikelola dari Satu Tempat', NULL, NULL);
SELECT pg_temp.put_item('home_platforms', 10, 'en', 'AM² PTT', 'Push-to-talk channels, one-to-one voice, latest unit locations, presence, and optional video for teams on the move.', 'Explore AM² PTT');
SELECT pg_temp.put_item('home_platforms', 10, 'id', 'AM² PTT', 'Channel push-to-talk, komunikasi satu-ke-satu, lokasi terakhir unit, status online, dan video opsional untuk tim yang terus bergerak.', 'Pelajari AM² PTT');
SELECT pg_temp.put_item('home_platforms', 20, 'en', 'AM² Command Center', 'Body cameras and visual workflows in one command environment, so supervisors see what the field sees.', 'Explore AM² Command Center');
SELECT pg_temp.put_item('home_platforms', 20, 'id', 'AM² Command Center', 'Body camera dan alur kerja visual dalam satu pusat komando, agar supervisor melihat apa yang dilihat tim di lapangan.', 'Pelajari AM² Command Center');

SELECT pg_temp.put_section('home_operational_models', 'en', NULL, 'Choose Where Your Platform Runs', NULL, 'Let AM² operate it as Managed SaaS, or run it on infrastructure your organization controls.', NULL);
SELECT pg_temp.put_section('home_operational_models', 'id', NULL, 'Pilih di Mana Platform Anda Berjalan', NULL, 'Serahkan pengoperasiannya kepada AM² lewat Managed SaaS, atau jalankan di infrastruktur yang dikendalikan organisasi Anda.', NULL);
SELECT pg_temp.put_item('home_operational_models', 10, 'en', 'Managed SaaS', 'AM² runs the servers and delivers software updates under your service agreement. Your team manages users, devices, and field connectivity.', 'Explore Managed SaaS');
SELECT pg_temp.put_item('home_operational_models', 10, 'id', 'Managed SaaS', 'AM² mengelola server dan pembaruan software sesuai perjanjian layanan. Tim Anda cukup mengatur pengguna, perangkat, dan konektivitas di lapangan.', 'Pelajari Managed SaaS');
SELECT pg_temp.put_item('home_operational_models', 20, 'en', 'On-Premise', 'Run the platform on your own infrastructure. Your team controls servers, network, backup, and monitoring; AM² provides the software and updates.', 'Explore On-Premise');
SELECT pg_temp.put_item('home_operational_models', 20, 'id', 'On-Premise', 'Jalankan platform di infrastruktur Anda sendiri. Tim Anda mengendalikan server, jaringan, backup, dan monitoring; AM² menyediakan software dan pembaruannya.', 'Pelajari On-Premise');

SELECT pg_temp.put_section('home_security_controls', 'en', NULL, 'Security, Spelled Out', NULL, 'Concrete controls on connections, device sessions, and administration—easy for your IT team to review.', NULL);
SELECT pg_temp.put_section('home_security_controls', 'id', NULL, 'Keamanan yang Dijelaskan, Bukan Sekadar Dijanjikan', NULL, 'Kontrol nyata pada koneksi, sesi perangkat, dan administrasi—mudah ditinjau oleh tim IT Anda.', NULL);
SELECT pg_temp.put_item('home_security_controls', 10, 'en', 'TLS-Protected Connections', 'App and admin traffic is encrypted in transit over HTTPS/WSS with TLS.', NULL);
SELECT pg_temp.put_item('home_security_controls', 10, 'id', 'Koneksi Terlindungi TLS', 'Lalu lintas aplikasi dan admin dienkripsi selama transit melalui HTTPS/WSS dengan TLS.', NULL);
SELECT pg_temp.put_item('home_security_controls', 20, 'en', 'Revocable Device Sessions', 'Revoke a device session or sign a unit out remotely the moment access should end.', NULL);
SELECT pg_temp.put_item('home_security_controls', 20, 'id', 'Sesi Perangkat yang Dapat Dicabut', 'Cabut sesi perangkat atau keluarkan unit dari jarak jauh begitu aksesnya perlu dihentikan.', NULL);
SELECT pg_temp.put_item('home_security_controls', 30, 'en', 'Central Access Control', 'Users, channels, memberships, and feature permissions are managed in one WebAdmin.', NULL);
SELECT pg_temp.put_item('home_security_controls', 30, 'id', 'Kontrol Akses Terpusat', 'Pengguna, channel, keanggotaan, dan izin fitur dikelola dalam satu WebAdmin.', NULL);

SELECT pg_temp.put_section('home_industries', 'en', NULL, 'Built for Work Beyond the Desk', 'Beyond the Desk', 'Configure AM² around the way your field teams already work, whatever the industry.', NULL);
SELECT pg_temp.put_section('home_industries', 'id', NULL, 'Dirancang untuk Pekerjaan di Luar Kantor', 'di Luar Kantor', 'Sesuaikan AM² dengan cara kerja tim lapangan Anda, apa pun industrinya.', NULL);
SELECT pg_temp.put_item('home_industries', 10, 'en', 'Logistics & Transportation', 'Keep drivers, dispatchers, hubs, and supervisors on the same channel, with each unit''s latest location in view.', NULL);
SELECT pg_temp.put_item('home_industries', 10, 'id', 'Logistik & Transportasi', 'Satukan pengemudi, dispatcher, hub, dan supervisor dalam satu channel, lengkap dengan lokasi terakhir setiap unit.', NULL);
SELECT pg_temp.put_item('home_industries', 20, 'en', 'Mining & Energy', 'Connect crews across sites and work areas wherever suitable IP connectivity is available.', NULL);
SELECT pg_temp.put_item('home_industries', 20, 'id', 'Pertambangan & Energi', 'Hubungkan kru di berbagai site dan area kerja selama tersedia konektivitas IP yang memadai.', NULL);
SELECT pg_temp.put_item('home_industries', 30, 'en', 'Construction', 'Coordinate supervisors, operators, security, and project teams across every work zone.', NULL);
SELECT pg_temp.put_item('home_industries', 30, 'id', 'Konstruksi', 'Koordinasikan supervisor, operator, petugas keamanan, dan tim proyek di setiap zona kerja.', NULL);
SELECT pg_temp.put_item('home_industries', 40, 'en', 'Manufacturing & Warehousing', 'Give production, warehouse, and maintenance teams their own channels for a faster response.', NULL);
SELECT pg_temp.put_item('home_industries', 40, 'id', 'Manufaktur & Pergudangan', 'Beri tim produksi, gudang, dan maintenance channel masing-masing agar respons lebih cepat.', NULL);
SELECT pg_temp.put_item('home_industries', 50, 'en', 'Security & Facilities', 'Link officers, control rooms, and supervisors by voice and location, with video where the device supports it.', NULL);
SELECT pg_temp.put_item('home_industries', 50, 'id', 'Keamanan & Fasilitas', 'Hubungkan petugas, control room, dan supervisor lewat suara dan lokasi, plus video bila perangkat mendukung.', NULL);
SELECT pg_temp.put_item('home_industries', 60, 'en', 'Government & Public Operations', 'Coordinate field units with deployment options and access policies set to your organization''s needs.', NULL);
SELECT pg_temp.put_item('home_industries', 60, 'id', 'Pemerintahan & Layanan Publik', 'Koordinasikan unit lapangan dengan pilihan deployment dan kebijakan akses yang disesuaikan dengan kebutuhan instansi Anda.', NULL);

SELECT pg_temp.put_section('home_faq', 'en', 'FAQ', 'Common Questions About AM²', 'AM²', NULL, NULL);
SELECT pg_temp.put_section('home_faq', 'id', 'FAQ', 'Pertanyaan Seputar AM²', 'AM²', NULL, NULL);
SELECT pg_temp.put_item('home_faq', 10, 'en', 'What is Push-to-Talk over Cellular (PoC)?', 'It''s walkie-talkie-style communication that runs over cellular data or Wi-Fi instead of a dedicated radio network. Press a button to talk to a channel or to one person, on compatible devices.', NULL);
SELECT pg_temp.put_item('home_faq', 10, 'id', 'Apa itu Push-to-Talk over Cellular (PoC)?', 'Komunikasi ala HT yang berjalan di jaringan data seluler atau Wi-Fi, bukan di jaringan radio khusus. Cukup tekan tombol untuk bicara ke satu channel atau satu orang, menggunakan perangkat yang kompatibel.', NULL);
SELECT pg_temp.put_item('home_faq', 20, 'en', 'How is AM² PTT different from AM² Command Center?', 'AM² PTT focuses on voice, location, and optional video through Android handhelds. AM² Command Center focuses on body cameras and visual workflows for supervisors. Both are administered through WebAdmin.', NULL);
SELECT pg_temp.put_item('home_faq', 20, 'id', 'Apa bedanya AM² PTT dan AM² Command Center?', 'AM² PTT berfokus pada komunikasi suara, lokasi, dan video opsional lewat HT Android. AM² Command Center berfokus pada body camera dan alur kerja visual untuk supervisor. Keduanya dikelola melalui WebAdmin.', NULL);
SELECT pg_temp.put_item('home_faq', 30, 'en', 'What is the difference between Managed SaaS and On-Premise?', 'With Managed SaaS, AM² operates the platform infrastructure for you. With On-Premise, the platform runs on your infrastructure and your team operates it, while AM² provides the software, implementation guidance, and updates under your agreement.', NULL);
SELECT pg_temp.put_item('home_faq', 30, 'id', 'Apa perbedaan Managed SaaS dan On-Premise?', 'Pada Managed SaaS, infrastruktur platform dioperasikan oleh AM². Pada On-Premise, platform berjalan di infrastruktur Anda dan dioperasikan tim Anda, sementara AM² menyediakan software, panduan implementasi, dan pembaruan sesuai perjanjian.', NULL);
SELECT pg_temp.put_item('home_faq', 40, 'en', 'Does AM² need a specific network?', 'AM² needs compatible IP connectivity between devices and the platform, such as cellular data or Wi-Fi. Audio quality depends on coverage, bandwidth, latency, the device, and your network setup.', NULL);
SELECT pg_temp.put_item('home_faq', 40, 'id', 'Apakah AM² membutuhkan jaringan tertentu?', 'AM² membutuhkan konektivitas IP yang kompatibel antara perangkat dan platform, misalnya data seluler atau Wi-Fi. Kualitas suara bergantung pada cakupan sinyal, bandwidth, latensi, perangkat, dan konfigurasi jaringan Anda.', NULL);
SELECT pg_temp.put_item('home_faq', 50, 'en', 'Does AM² manufacture its own devices?', 'No. AM² uses selected white-label devices from OEM partners and configures them for the AM² platform. Specifications and certifications depend on the model you choose.', NULL);
SELECT pg_temp.put_item('home_faq', 50, 'id', 'Apakah perangkatnya buatan AM² sendiri?', 'Tidak. AM² menggunakan perangkat white-label pilihan dari mitra OEM dan mengonfigurasinya untuk platform AM². Spesifikasi dan sertifikasi bergantung pada model yang Anda pilih.', NULL);
SELECT pg_temp.put_item('home_faq', 60, 'en', 'Is AM² communication encrypted?', 'Connections between the apps and the platform use HTTPS/WSS with TLS, which protects data while it is in transit.', NULL);
SELECT pg_temp.put_item('home_faq', 60, 'id', 'Apakah komunikasi AM² terenkripsi?', 'Koneksi antara aplikasi dan platform menggunakan HTTPS/WSS dengan TLS untuk melindungi data selama transit.', NULL);
SELECT pg_temp.put_item('home_faq', 70, 'en', 'How is AM² priced?', 'Pricing depends on device type and quantity, active users or capacity, features, deployment model, implementation, and support. Contact our team for a proposal based on your requirements.', NULL);
SELECT pg_temp.put_item('home_faq', 70, 'id', 'Bagaimana harga AM² ditentukan?', 'Harga bergantung pada jenis dan jumlah perangkat, jumlah pengguna aktif atau kapasitas, fitur, model deployment, implementasi, dan paket dukungan. Hubungi tim kami untuk mendapatkan proposal sesuai kebutuhan Anda.', NULL);
SELECT pg_temp.put_item('home_faq', 80, 'en', 'How can I evaluate AM²?', 'Book a technical demo and tell us your expected unit count, operating locations, network environment, and preference for Managed SaaS or On-Premise.', NULL);
SELECT pg_temp.put_item('home_faq', 80, 'id', 'Bagaimana cara mencoba AM²?', 'Jadwalkan demo teknis dan sampaikan perkiraan jumlah unit, lokasi operasi, kondisi jaringan, serta pilihan Managed SaaS atau On-Premise.', NULL);

SELECT pg_temp.put_section('home_why_am2', 'en', NULL, 'Why Choose AM²?', 'AM²?', E'Better field communication rarely comes from adding another app. It comes from tools that fit how your people already work.\n\nAM² brings devices, platforms, administration, and deployment together in one engagement—from choosing the right handhelds to configuring channels and training your team.', 'Explore Our Approach');
SELECT pg_temp.put_section('home_why_am2', 'id', NULL, 'Mengapa Memilih AM²?', 'AM²?', E'Komunikasi lapangan yang lebih baik jarang lahir dari menambah aplikasi baru. Hasilnya justru datang dari alat yang sesuai dengan cara kerja tim Anda.\n\nAM² menyatukan perangkat, platform, administrasi, dan deployment dalam satu kerja sama—mulai dari memilih HT yang tepat, mengatur channel, hingga melatih tim Anda.', 'Pelajari Pendekatan Kami');

SELECT pg_temp.put_section('cta_configure_operation', 'en', NULL, 'Ready to Plan Your Rollout?', NULL, 'Tell us about your teams, sites, and preferred deployment. We''ll recommend the devices and setup to start with.', 'Contact Sales');
SELECT pg_temp.put_section('cta_configure_operation', 'id', NULL, 'Siap Merencanakan Implementasi?', NULL, 'Ceritakan tim, lokasi kerja, dan model deployment yang Anda inginkan. Kami akan merekomendasikan perangkat dan konfigurasi awal yang tepat.', 'Hubungi Sales');

SELECT pg_temp.put_section('solutions_hero', 'en', NULL, 'Communication That Fits How You Work', 'How You Work', 'Voice, unit visibility, administration, and deployment in one solution for teams spread across sites, vehicles, and shifts.', NULL);
SELECT pg_temp.put_section('solutions_hero', 'id', NULL, 'Komunikasi yang Mengikuti Cara Kerja Anda', 'Cara Kerja Anda', 'Suara, visibilitas unit, administrasi, dan deployment dalam satu solusi untuk tim yang tersebar di berbagai lokasi, kendaraan, dan shift.', NULL);

SELECT pg_temp.put_section('solutions_challenge', 'en', NULL, 'When Teams Spread Out, Coordination Breaks Down', 'Coordination Breaks Down', 'Calls go unanswered, updates arrive late, and nobody is sure which units are free. Supervisors juggle phones, chat groups, and spreadsheets just to know who is where—and every extra tool means another account to manage.', NULL);
SELECT pg_temp.put_section('solutions_challenge', 'id', NULL, 'Saat Tim Tersebar, Koordinasi Mudah Tersendat', 'Koordinasi Mudah Tersendat', 'Telepon tidak diangkat, laporan datang terlambat, dan tidak ada yang tahu unit mana yang sedang kosong. Supervisor berpindah dari telepon ke grup chat dan spreadsheet hanya untuk tahu siapa berada di mana—dan setiap alat tambahan menambah akun yang harus dikelola.', NULL);

SELECT pg_temp.put_section('solutions_pillars', 'en', NULL, 'Two Platforms. One Way to Run the Field.', 'One Way to Run the Field.', 'AM² PTT and AM² Command Center bring voice, unit visibility, and administration together, so your teams spend less time chasing updates.', NULL);
SELECT pg_temp.put_section('solutions_pillars', 'id', NULL, 'Dua Platform. Satu Cara Mengelola Lapangan.', 'Satu Cara Mengelola Lapangan.', 'AM² PTT dan AM² Command Center menyatukan komunikasi suara, visibilitas unit, dan administrasi, sehingga tim Anda tidak lagi sibuk mengejar kabar terbaru.', NULL);
SELECT pg_temp.put_item('solutions_pillars', 10, 'en', 'Communication', 'Reach a whole channel or a single unit with one press.', NULL);
SELECT pg_temp.put_item('solutions_pillars', 10, 'id', 'Komunikasi', 'Jangkau satu channel penuh atau satu unit saja dengan sekali tekan.', NULL);
SELECT pg_temp.put_item('solutions_pillars', 20, 'en', 'Visibility', 'See who is online, who is speaking, and each unit''s latest available location.', NULL);
SELECT pg_temp.put_item('solutions_pillars', 20, 'id', 'Visibilitas', 'Lihat siapa yang online, siapa yang sedang bicara, dan lokasi terakhir setiap unit.', NULL);
SELECT pg_temp.put_item('solutions_pillars', 30, 'en', 'Control', 'Manage users, channels, permissions, and device sessions from WebAdmin.', NULL);
SELECT pg_temp.put_item('solutions_pillars', 30, 'id', 'Kendali', 'Kelola pengguna, channel, hak akses, dan sesi perangkat dari WebAdmin.', NULL);

SELECT pg_temp.put_section('solutions_capabilities', 'en', NULL, 'What You Get with AM²', 'AM²', NULL, NULL);
SELECT pg_temp.put_section('solutions_capabilities', 'id', NULL, 'Yang Anda Dapatkan dari AM²', 'AM²', NULL, NULL);
SELECT pg_temp.put_item('solutions_capabilities', 40, 'en', 'Flexible Deployment', 'Choose Managed SaaS operated by AM², or an On-Premise deployment operated by your own team.', NULL);
SELECT pg_temp.put_item('solutions_capabilities', 40, 'id', 'Deployment yang Fleksibel', 'Pilih Managed SaaS yang dioperasikan AM², atau On-Premise yang dioperasikan tim Anda sendiri.', NULL);

SELECT pg_temp.put_section('platform_ptt_hero', 'en', NULL, 'Push-to-Talk for Teams on the Move', 'Teams on the Move', 'AM² PTT connects field teams through channels, one-to-one voice, presence, and latest unit locations on Android devices.', NULL);
SELECT pg_temp.put_section('platform_ptt_hero', 'id', NULL, 'Push-to-Talk untuk Tim yang Terus Bergerak', 'Tim yang Terus Bergerak', 'AM² PTT menghubungkan tim lapangan lewat channel, komunikasi satu-ke-satu, status online, dan lokasi terakhir unit di perangkat Android.', NULL);

SELECT pg_temp.put_section('platform_ptt_capabilities', 'en', NULL, 'Built for Field Coordination', 'Field Coordination', NULL, NULL);
SELECT pg_temp.put_section('platform_ptt_capabilities', 'id', NULL, 'Dirancang untuk Koordinasi Lapangan', 'Koordinasi Lapangan', NULL, NULL);
SELECT pg_temp.put_item('platform_ptt_capabilities', 10, 'en', 'Channels & One-to-One Talk', 'Talk to a whole channel at once, or reach one person privately through the AM² relay.', NULL);
SELECT pg_temp.put_item('platform_ptt_capabilities', 10, 'id', 'Channel & Komunikasi Privat', 'Bicara ke satu channel sekaligus, atau hubungi satu orang secara privat melalui relay AM².', NULL);
SELECT pg_temp.put_item('platform_ptt_capabilities', 20, 'en', 'Presence & Latest Location', 'See who is online, who is speaking, and where each unit was last reported.', NULL);
SELECT pg_temp.put_item('platform_ptt_capabilities', 20, 'id', 'Status Online & Lokasi Terakhir', 'Lihat siapa yang online, siapa yang sedang bicara, dan posisi terakhir setiap unit.', NULL);
SELECT pg_temp.put_item('platform_ptt_capabilities', 30, 'en', 'Optional Video', 'Switch to live video when the device and platform setup support it.', NULL);
SELECT pg_temp.put_item('platform_ptt_capabilities', 30, 'id', 'Video Opsional', 'Beralih ke video langsung bila perangkat dan konfigurasi platform mendukung.', NULL);

SELECT pg_temp.put_section('platform_ptt_benefits', 'en', NULL, 'More Than Push-to-Talk', 'Push-to-Talk', 'Fewer calls to chase, clearer unit status, and visual context when a voice update isn''t enough.', NULL);
SELECT pg_temp.put_section('platform_ptt_benefits', 'id', NULL, 'Lebih dari Sekadar Push-to-Talk', 'Push-to-Talk', 'Lebih sedikit telepon yang harus dikejar, status unit yang lebih jelas, dan konteks visual saat laporan suara belum cukup.', NULL);
SELECT pg_temp.put_item('platform_ptt_benefits', 10, 'en', 'Reach Teams Without Dialing', 'Address a whole team on its channel, or one unit privately, with a single press.', NULL);
SELECT pg_temp.put_item('platform_ptt_benefits', 10, 'id', 'Jangkau Tim Tanpa Menelepon', 'Sampaikan pesan ke seluruh tim lewat channel, atau ke satu unit secara privat, cukup dengan sekali tekan.', NULL);
SELECT pg_temp.put_item('platform_ptt_benefits', 20, 'en', 'See Which Units Are Active', 'Online status, active speakers, and the latest available location in one view.', NULL);
SELECT pg_temp.put_item('platform_ptt_benefits', 20, 'id', 'Lihat Unit yang Aktif', 'Status online, siapa yang sedang bicara, dan lokasi terakhir unit dalam satu tampilan.', NULL);
SELECT pg_temp.put_item('platform_ptt_benefits', 30, 'en', 'Add Visual Context When Needed', 'Use video-enabled devices for jobs where seeing the situation speeds up the decision.', NULL);
SELECT pg_temp.put_item('platform_ptt_benefits', 30, 'id', 'Tambahkan Konteks Visual', 'Gunakan perangkat berkamera untuk pekerjaan yang butuh melihat langsung kondisi di lapangan.', NULL);

SELECT pg_temp.put_section('platform_ptt_cta', 'en', NULL, 'Find the Right AM² PTT Device', NULL, 'Compare voice-only and video-capable handhelds for your teams.', 'View AM² PTT Devices');
SELECT pg_temp.put_section('platform_ptt_cta', 'id', NULL, 'Temukan Perangkat AM² PTT yang Tepat', NULL, 'Bandingkan HT khusus suara dan HT dengan video untuk tim Anda.', 'Lihat Perangkat AM² PTT');

SELECT pg_temp.put_section('platform_cc_hero', 'en', NULL, 'See What Your Field Teams See', 'Your Field Teams', 'AM² Command Center brings body-camera video and visual workflows into one place, so supervisors can follow field activity and coordinate a response.', NULL);
SELECT pg_temp.put_section('platform_cc_hero', 'id', NULL, 'Lihat Apa yang Dilihat Tim Lapangan Anda', 'Tim Lapangan Anda', 'AM² Command Center menyatukan video body camera dan alur kerja visual di satu tempat, agar supervisor bisa memantau aktivitas lapangan dan mengoordinasikan respons.', NULL);

SELECT pg_temp.put_section('platform_cc_capabilities', 'en', NULL, 'Built for Visual Operations', 'Visual Operations', NULL, NULL);
SELECT pg_temp.put_section('platform_cc_capabilities', 'id', NULL, 'Dirancang untuk Operasi Visual', 'Operasi Visual', NULL, NULL);
SELECT pg_temp.put_item('platform_cc_capabilities', 10, 'en', 'Body Camera Integration', 'Connect selected body-camera devices to your operational workflows.', NULL);
SELECT pg_temp.put_item('platform_cc_capabilities', 10, 'id', 'Integrasi Body Camera', 'Hubungkan body camera pilihan ke alur kerja operasional Anda.', NULL);
SELECT pg_temp.put_item('platform_cc_capabilities', 20, 'en', 'Visual Operational Workflow', 'Bring field video and its operational context together in one command environment.', NULL);
SELECT pg_temp.put_item('platform_cc_capabilities', 20, 'id', 'Alur Kerja Visual', 'Satukan video dari lapangan dan konteks operasionalnya dalam satu pusat komando.', NULL);
SELECT pg_temp.put_item('platform_cc_capabilities', 30, 'en', 'Supervisor & Administrator Workspace', 'Give supervisors and administrators one workspace for monitoring and coordination.', NULL);
SELECT pg_temp.put_item('platform_cc_capabilities', 30, 'id', 'Ruang Kerja Supervisor & Admin', 'Beri supervisor dan administrator satu ruang kerja untuk pemantauan dan koordinasi.', NULL);

SELECT pg_temp.put_section('platform_cc_benefits', 'en', NULL, 'Visual Context from the Field', 'from the Field', 'Body cameras, unit status, and central administration work together, so decisions rest on what is actually happening.', NULL);
SELECT pg_temp.put_section('platform_cc_benefits', 'id', NULL, 'Konteks Visual Langsung dari Lapangan', 'Langsung dari Lapangan', 'Body camera, status unit, dan administrasi terpusat bekerja bersama, sehingga keputusan diambil berdasarkan kondisi yang sebenarnya.', NULL);
SELECT pg_temp.put_item('platform_cc_benefits', 10, 'en', 'Connect Field Devices', 'Bring body-camera units into one central operating environment.', NULL);
SELECT pg_temp.put_item('platform_cc_benefits', 10, 'id', 'Hubungkan Perangkat Lapangan', 'Satukan unit body camera dalam satu lingkungan operasional terpusat.', NULL);
SELECT pg_temp.put_item('platform_cc_benefits', 20, 'en', 'See Operational Context', 'View available unit status, location, and video from the field.', NULL);
SELECT pg_temp.put_item('platform_cc_benefits', 20, 'id', 'Lihat Konteks Operasional', 'Pantau status unit, lokasi, dan video yang tersedia dari lapangan.', NULL);
SELECT pg_temp.put_item('platform_cc_benefits', 30, 'en', 'Coordinate from One Place', 'Supervisors and administrators manage visual workflows from a single workspace.', NULL);
SELECT pg_temp.put_item('platform_cc_benefits', 30, 'id', 'Koordinasi dari Satu Tempat', 'Supervisor dan administrator mengelola alur kerja visual dari satu ruang kerja.', NULL);

SELECT pg_temp.put_section('platform_cc_cta', 'en', NULL, 'Choose Body Cameras for Your Team', NULL, 'See the body-camera options available for AM² Command Center.', 'View Command Center Devices');
SELECT pg_temp.put_section('platform_cc_cta', 'id', NULL, 'Pilih Body Camera untuk Tim Anda', NULL, 'Lihat pilihan body camera yang tersedia untuk AM² Command Center.', 'Lihat Perangkat Command Center');

SELECT pg_temp.put_section('product_ptt_hero', 'en', NULL, 'Choose the Handheld That Fits the Job', 'Fits the Job', 'AM² PTT runs on selected Android handhelds from OEM partners. Final specifications depend on the model, your operational needs, and deployment size.', NULL);
SELECT pg_temp.put_section('product_ptt_hero', 'id', NULL, 'Pilih HT yang Pas untuk Pekerjaan Anda', 'Pas untuk Pekerjaan Anda', 'AM² PTT berjalan di HT Android pilihan dari mitra OEM. Spesifikasi akhir menyesuaikan model, kebutuhan operasional, dan skala deployment Anda.', NULL);

SELECT pg_temp.put_section('product_cc_hero', 'en', NULL, 'Body Cameras for Visual Operations', 'Visual Operations', 'AM² Command Center works with selected body-camera models, configured for your operational requirements and deployment scope.', NULL);
SELECT pg_temp.put_section('product_cc_hero', 'id', NULL, 'Body Camera untuk Operasi Visual', 'Operasi Visual', 'AM² Command Center mendukung model body camera pilihan yang dikonfigurasi sesuai kebutuhan operasional dan cakupan deployment Anda.', NULL);

SELECT pg_temp.put_section('service_saas_hero', 'en', NULL, 'Run the Platform, Not the Servers', 'Not the Servers', 'AM² operates the infrastructure and updates. Your team manages users, devices, channels, and field connectivity.', NULL);
SELECT pg_temp.put_section('service_saas_hero', 'id', NULL, 'Fokus pada Operasi, Bukan Server', 'Bukan Server', 'AM² mengoperasikan infrastruktur dan pembaruannya. Tim Anda cukup mengelola pengguna, perangkat, channel, dan konektivitas lapangan.', NULL);

SELECT pg_temp.put_section('service_saas_how_it_works', 'en', NULL, 'How Managed SaaS Works', 'Managed SaaS', NULL, NULL);
SELECT pg_temp.put_section('service_saas_how_it_works', 'id', NULL, 'Cara Kerja Managed SaaS', 'Managed SaaS', NULL, NULL);
SELECT pg_temp.put_item('service_saas_how_it_works', 10, 'en', 'Platform Infrastructure', 'AM² hosts and operates the platform servers, so your team has no servers to install or maintain.', NULL);
SELECT pg_temp.put_item('service_saas_how_it_works', 10, 'id', 'Infrastruktur Platform', 'AM² menyediakan dan mengoperasikan server platform, jadi tim Anda tidak perlu memasang atau merawat server sendiri.', NULL);
SELECT pg_temp.put_item('service_saas_how_it_works', 20, 'en', 'Software & Updates', 'AM² delivers software and product updates according to your service agreement.', NULL);
SELECT pg_temp.put_item('service_saas_how_it_works', 20, 'id', 'Software & Pembaruan', 'AM² menghadirkan pembaruan software dan produk sesuai perjanjian layanan Anda.', NULL);
SELECT pg_temp.put_item('service_saas_how_it_works', 30, 'en', 'Users, Devices & Operations', 'Your administrators manage users, devices, and daily operations from WebAdmin.', NULL);
SELECT pg_temp.put_item('service_saas_how_it_works', 30, 'id', 'Pengguna, Perangkat & Operasi', 'Administrator Anda mengelola pengguna, perangkat, dan operasional harian dari WebAdmin.', NULL);

SELECT pg_temp.put_section('service_on_premise_hero', 'en', NULL, E'Your Infrastructure.\nYour Control.', 'Your Control.', 'Run AM² inside your own environment. After a technical assessment, your team operates the servers and network while AM² provides the software, guidance, and updates.', NULL);
SELECT pg_temp.put_section('service_on_premise_hero', 'id', NULL, E'Infrastruktur Anda.\nKendali di Tangan Anda.', 'Kendali di Tangan Anda.', 'Jalankan AM² di lingkungan IT Anda sendiri. Setelah asesmen teknis, tim Anda mengoperasikan server dan jaringan; AM² menyediakan software, panduan, dan pembaruan.', NULL);

SELECT pg_temp.put_section('service_on_premise_how_it_works', 'en', NULL, 'How On-Premise Works', 'On-Premise', NULL, NULL);
SELECT pg_temp.put_section('service_on_premise_how_it_works', 'id', NULL, 'Cara Kerja On-Premise', 'On-Premise', NULL, NULL);
SELECT pg_temp.put_item('service_on_premise_how_it_works', 10, 'en', 'Your Infrastructure', 'The platform runs on servers, network, backup, and monitoring that your organization controls.', NULL);
SELECT pg_temp.put_item('service_on_premise_how_it_works', 10, 'id', 'Infrastruktur Anda', 'Platform berjalan di server, jaringan, backup, dan monitoring yang dikendalikan organisasi Anda.', NULL);
SELECT pg_temp.put_item('service_on_premise_how_it_works', 20, 'en', 'Software & Updates', 'AM² provides the software, implementation guidance, and updates within the agreed scope.', NULL);
SELECT pg_temp.put_item('service_on_premise_how_it_works', 20, 'id', 'Software & Pembaruan', 'AM² menyediakan software, panduan implementasi, dan pembaruan sesuai cakupan yang disepakati.', NULL);
SELECT pg_temp.put_item('service_on_premise_how_it_works', 30, 'en', 'Users, Devices & Operations', 'Your team manages users, devices, and day-to-day operations.', NULL);
SELECT pg_temp.put_item('service_on_premise_how_it_works', 30, 'id', 'Pengguna, Perangkat & Operasi', 'Tim Anda mengelola pengguna, perangkat, dan operasional sehari-hari.', NULL);

SELECT pg_temp.put_section('service_responsibility_matrix', 'en', NULL, E'Clear Responsibilities.\nOne Operating Model.', 'One Operating Model.', 'See exactly what AM² handles and what stays with your team.', NULL);
SELECT pg_temp.put_section('service_responsibility_matrix', 'id', NULL, E'Tanggung Jawab yang Jelas.\nSatu Model Operasional.', 'Satu Model Operasional.', 'Lihat dengan jelas bagian yang ditangani AM² dan bagian yang tetap dikelola tim Anda.', NULL);

SELECT pg_temp.put_section('cta_discuss_deployment', 'en', NULL, 'Ready to Discuss Your Deployment?', NULL, 'Share your device count, sites, network setup, and preferred model. We''ll outline the next steps.', 'Discuss Your Deployment');
SELECT pg_temp.put_section('cta_discuss_deployment', 'id', NULL, 'Siap Membahas Deployment Anda?', NULL, 'Sampaikan jumlah perangkat, lokasi, kondisi jaringan, dan model yang Anda inginkan. Kami akan menyusun langkah berikutnya.', 'Diskusikan Deployment');

SELECT pg_temp.put_section('feature_ptt_app_hero', 'en', NULL, 'Field Communication, Built for Android', 'Built for Android', 'The AM² PTT app lets field teams talk on channels, reach individual units, and see the latest unit locations.', NULL);
SELECT pg_temp.put_section('feature_ptt_app_hero', 'id', NULL, 'Komunikasi Lapangan Berbasis Android', 'Berbasis Android', 'Aplikasi AM² PTT memudahkan tim lapangan berbicara lewat channel, menghubungi unit tertentu, dan melihat lokasi terakhir unit.', NULL);

SELECT pg_temp.put_section('feature_ptt_app_list', 'en', NULL, 'Inside the AM² PTT App', 'AM² PTT App', NULL, NULL);
SELECT pg_temp.put_section('feature_ptt_app_list', 'id', NULL, 'Di Dalam Aplikasi AM² PTT', 'Aplikasi AM² PTT', NULL, NULL);
SELECT pg_temp.put_item('feature_ptt_app_list', 10, 'en', 'Channel Push-to-Talk', 'Talk on organization-defined channels, with clear transmit and active-speaker indicators.', NULL);
SELECT pg_temp.put_item('feature_ptt_app_list', 10, 'id', 'Push-to-Talk via Channel', 'Bicara di channel yang ditetapkan organisasi, dengan indikator transmisi dan pembicara aktif yang jelas.', NULL);
SELECT pg_temp.put_item('feature_ptt_app_list', 20, 'en', 'Private Communication', 'Reach one unit through a private voice or video session routed by the AM² platform.', NULL);
SELECT pg_temp.put_item('feature_ptt_app_list', 20, 'id', 'Komunikasi Privat', 'Hubungi satu unit lewat sesi suara atau video privat yang dirutekan oleh platform AM².', NULL);
SELECT pg_temp.put_item('feature_ptt_app_list', 30, 'en', 'Latest Unit Location', 'See where online units were last reported, when device permissions and connectivity allow.', NULL);
SELECT pg_temp.put_item('feature_ptt_app_list', 30, 'id', 'Lokasi Terakhir Unit', 'Lihat posisi terakhir unit yang online, selama izin lokasi perangkat dan koneksinya tersedia.', NULL);
SELECT pg_temp.put_item('feature_ptt_app_list', 40, 'en', 'Presence', 'Know who is online and who is speaking or streaming on each channel.', NULL);
SELECT pg_temp.put_item('feature_ptt_app_list', 40, 'id', 'Status Kehadiran', 'Ketahui siapa yang online serta siapa yang sedang bicara atau mengirim video di setiap channel.', NULL);

SELECT pg_temp.put_section('feature_ptt_webadmin_hero', 'en', NULL, 'Users, Channels, and Access in One Console', 'One Console', 'AM² PTT WebAdmin gives administrators central control of users, channels, memberships, permissions, and device sessions.', NULL);
SELECT pg_temp.put_section('feature_ptt_webadmin_hero', 'id', NULL, 'Pengguna, Channel, dan Akses di Satu Konsol', 'Satu Konsol', 'AM² PTT WebAdmin memberi administrator kendali terpusat atas pengguna, channel, keanggotaan, hak akses, dan sesi perangkat.', NULL);

SELECT pg_temp.put_section('feature_ptt_webadmin_list', 'en', NULL, 'Inside AM² PTT WebAdmin', 'AM² PTT WebAdmin', NULL, NULL);
SELECT pg_temp.put_section('feature_ptt_webadmin_list', 'id', NULL, 'Di Dalam AM² PTT WebAdmin', 'AM² PTT WebAdmin', NULL, NULL);
SELECT pg_temp.put_item('feature_ptt_webadmin_list', 10, 'en', 'Organization & User Administration', 'Manage organizations or tenant structures, administrators, and field users.', NULL);
SELECT pg_temp.put_item('feature_ptt_webadmin_list', 10, 'id', 'Administrasi Organisasi & Pengguna', 'Kelola struktur organisasi atau tenant, administrator, dan pengguna lapangan.', NULL);
SELECT pg_temp.put_item('feature_ptt_webadmin_list', 20, 'en', 'Channel Management', 'Create channels, manage memberships, and set default channel assignments.', NULL);
SELECT pg_temp.put_item('feature_ptt_webadmin_list', 20, 'id', 'Manajemen Channel', 'Buat channel, atur keanggotaan, dan tentukan channel default.', NULL);
SELECT pg_temp.put_item('feature_ptt_webadmin_list', 30, 'en', 'Access Policies', 'Apply user, channel, and feature permissions that match each operational role.', NULL);
SELECT pg_temp.put_item('feature_ptt_webadmin_list', 30, 'id', 'Kebijakan Akses', 'Terapkan izin pengguna, channel, dan fitur sesuai peran operasional masing-masing.', NULL);
SELECT pg_temp.put_item('feature_ptt_webadmin_list', 40, 'en', 'Feature Configuration', 'Turn supported features such as maps, video, and private communication on or off.', NULL);
SELECT pg_temp.put_item('feature_ptt_webadmin_list', 40, 'id', 'Konfigurasi Fitur', 'Aktifkan atau nonaktifkan fitur yang didukung, seperti peta, video, dan komunikasi privat.', NULL);

SELECT pg_temp.put_section('feature_cc_app_hero', 'en', NULL, 'Visual Coordination for Body-Camera Teams', 'Body-Camera Teams', 'AM² Command Center gives supervisors and administrators one visual workspace for their AM² body-camera deployments.', NULL);
SELECT pg_temp.put_section('feature_cc_app_hero', 'id', NULL, 'Koordinasi Visual untuk Tim Body Camera', 'Tim Body Camera', 'AM² Command Center memberi supervisor dan administrator satu ruang kerja visual untuk deployment body camera AM².', NULL);

SELECT pg_temp.put_section('feature_cc_app_list', 'en', NULL, 'Inside AM² Command Center', 'AM² Command Center', NULL, NULL);
SELECT pg_temp.put_section('feature_cc_app_list', 'id', NULL, 'Di Dalam AM² Command Center', 'AM² Command Center', NULL, NULL);
SELECT pg_temp.put_item('feature_cc_app_list', 10, 'en', 'Visual Operations Workspace', 'Follow live body-camera video and coordinate field activity from one screen.', NULL);
SELECT pg_temp.put_item('feature_cc_app_list', 10, 'id', 'Ruang Kerja Operasi Visual', 'Pantau video body camera secara langsung dan koordinasikan aktivitas lapangan dari satu layar.', NULL);
SELECT pg_temp.put_item('feature_cc_app_list', 20, 'en', 'Supervisor Access', 'Assign role-based permissions that match each supervisor''s and administrator''s responsibilities.', NULL);
SELECT pg_temp.put_item('feature_cc_app_list', 20, 'id', 'Akses Supervisor', 'Tetapkan izin berbasis peran sesuai tanggung jawab setiap supervisor dan administrator.', NULL);
SELECT pg_temp.put_item('feature_cc_app_list', 30, 'en', 'Operational Context', 'See video alongside unit status and location, so the team acts on the full picture.', NULL);
SELECT pg_temp.put_item('feature_cc_app_list', 30, 'id', 'Konteks Operasional', 'Lihat video bersama status dan lokasi unit, agar tim bertindak berdasarkan gambaran yang utuh.', NULL);
SELECT pg_temp.put_item('feature_cc_app_list', 40, 'en', 'Deployment Choice', 'Run it as Managed SaaS or as a customer-operated On-Premise deployment.', NULL);
SELECT pg_temp.put_item('feature_cc_app_list', 40, 'id', 'Pilihan Deployment', 'Gunakan sebagai Managed SaaS atau On-Premise yang dioperasikan tim Anda sendiri.', NULL);

SELECT pg_temp.put_section('feature_cc_webadmin_hero', 'en', NULL, 'Controlled Access for Visual Operations', 'Controlled Access', 'AM² Command Center WebAdmin centralizes organization, user, device, and access management for your deployment.', NULL);
SELECT pg_temp.put_section('feature_cc_webadmin_hero', 'id', NULL, 'Akses Terkendali untuk Operasi Visual', 'Akses Terkendali', 'AM² Command Center WebAdmin memusatkan pengelolaan organisasi, pengguna, perangkat, dan akses untuk deployment Anda.', NULL);

SELECT pg_temp.put_section('feature_cc_webadmin_list', 'en', NULL, 'Inside Command Center WebAdmin', 'Command Center WebAdmin', NULL, NULL);
SELECT pg_temp.put_section('feature_cc_webadmin_list', 'id', NULL, 'Di Dalam Command Center WebAdmin', 'Command Center WebAdmin', NULL, NULL);
SELECT pg_temp.put_item('feature_cc_webadmin_list', 10, 'en', 'Organization Management', 'Set up organizational structures, tenant scopes, and administrative boundaries.', NULL);
SELECT pg_temp.put_item('feature_cc_webadmin_list', 10, 'id', 'Manajemen Organisasi', 'Atur struktur organisasi, cakupan tenant, dan batas kewenangan administrator.', NULL);
SELECT pg_temp.put_item('feature_cc_webadmin_list', 20, 'en', 'User & Access Control', 'Assign roles and permissions based on operational responsibilities.', NULL);
SELECT pg_temp.put_item('feature_cc_webadmin_list', 20, 'id', 'Kontrol Pengguna & Akses', 'Tetapkan peran dan izin berdasarkan tanggung jawab operasional.', NULL);
SELECT pg_temp.put_item('feature_cc_webadmin_list', 30, 'en', 'Device & Feature Management', 'Assign body cameras to users and control which Command Center features they can use.', NULL);
SELECT pg_temp.put_item('feature_cc_webadmin_list', 30, 'id', 'Manajemen Perangkat & Fitur', 'Tetapkan body camera ke pengguna dan atur fitur Command Center yang dapat mereka gunakan.', NULL);
SELECT pg_temp.put_item('feature_cc_webadmin_list', 40, 'en', 'Deployment Administration', 'Supports both Managed SaaS and customer-operated On-Premise deployments.', NULL);
SELECT pg_temp.put_item('feature_cc_webadmin_list', 40, 'id', 'Administrasi Deployment', 'Mendukung deployment Managed SaaS maupun On-Premise yang dioperasikan tim Anda.', NULL);

SELECT pg_temp.put_section('cta_fit_operation', 'en', NULL, 'See How AM² Fits Your Operation', NULL, 'Tell us about your teams, devices, sites, and deployment preference. We''ll shape a demo around them.', 'Book a Demo');
SELECT pg_temp.put_section('cta_fit_operation', 'id', NULL, 'Cari Tahu Apakah AM² Cocok untuk Tim Anda', NULL, 'Ceritakan tim, perangkat, lokasi kerja, dan model deployment yang Anda inginkan. Kami akan menyiapkan demo yang sesuai dengan kebutuhan tersebut.', 'Jadwalkan Demo');

SELECT pg_temp.put_section('contact_sales_form', 'en', 'Discuss Your Requirements', 'Plan Your AM² Deployment', 'Plan Your AM² Deployment', 'Tell us about your operating environment, unit count, and preferred deployment model. Our team will get back to you with a recommended setup.', NULL);
SELECT pg_temp.put_section('contact_sales_form', 'id', 'Diskusikan Kebutuhan Anda', 'Rencanakan Deployment AM² Anda', 'Rencanakan Deployment AM² Anda', 'Ceritakan lingkungan operasional, jumlah unit, dan model deployment yang Anda inginkan. Tim kami akan menghubungi Anda dengan rekomendasi konfigurasi.', NULL);

SELECT pg_temp.put_section('about_hero', 'en', NULL, 'About AM²', NULL, 'AM² builds operational communication for field teams. We combine purpose-configured Android devices, two communication platforms, and flexible deployment, so push-to-talk, unit location, optional video, and administration work as one system.', NULL);
SELECT pg_temp.put_section('about_hero', 'id', NULL, 'Tentang AM²', NULL, 'AM² menghadirkan komunikasi operasional untuk tim lapangan. Kami memadukan perangkat Android yang dikonfigurasi khusus, dua platform komunikasi, dan deployment yang fleksibel, sehingga push-to-talk, lokasi unit, video opsional, dan administrasi bekerja sebagai satu sistem.', NULL);

SELECT pg_temp.put_section('about_what_we_do', 'en', NULL, 'What We Do', NULL, 'Devices, platforms, and deployment support, delivered as one solution.', NULL);
SELECT pg_temp.put_section('about_what_we_do', 'id', NULL, 'Apa yang Kami Kerjakan', NULL, 'Perangkat, platform, dan dukungan deployment dalam satu solusi.', NULL);
SELECT pg_temp.put_item('about_what_we_do', 10, 'en', 'Field Communications', 'Push-to-talk, private communication, latest unit location, optional video, and presence on mobile devices.', NULL);
SELECT pg_temp.put_item('about_what_we_do', 10, 'id', 'Komunikasi Lapangan', 'Push-to-talk, komunikasi privat, lokasi terakhir unit, video opsional, dan status online di perangkat mobile.', NULL);
SELECT pg_temp.put_item('about_what_we_do', 20, 'en', 'Operational Administration', 'Central management of users, channels, access policies, feature permissions, and device sessions in WebAdmin.', NULL);
SELECT pg_temp.put_item('about_what_we_do', 20, 'id', 'Administrasi Operasional', 'Pengelolaan terpusat untuk pengguna, channel, kebijakan akses, izin fitur, dan sesi perangkat di WebAdmin.', NULL);
SELECT pg_temp.put_item('about_what_we_do', 30, 'en', 'Deployment', 'Managed SaaS operated by AM², or On-Premise operated by your team.', NULL);
SELECT pg_temp.put_item('about_what_we_do', 30, 'id', 'Deployment', 'Managed SaaS yang dioperasikan AM², atau On-Premise yang dioperasikan tim Anda.', NULL);
SELECT pg_temp.put_item('about_what_we_do', 40, 'en', 'Services', 'Planning, configuration, device provisioning, training, updates, and support within the agreed scope.', NULL);
SELECT pg_temp.put_item('about_what_we_do', 40, 'id', 'Layanan', 'Perencanaan, konfigurasi, penyiapan perangkat, pelatihan, pembaruan, dan dukungan sesuai cakupan yang disepakati.', NULL);

SELECT pg_temp.put_section('about_how_we_work', 'en', NULL, 'How We Work', NULL, NULL, NULL);
SELECT pg_temp.put_section('about_how_we_work', 'id', NULL, 'Cara Kami Bekerja', NULL, NULL, NULL);
SELECT pg_temp.put_item('about_how_we_work', 10, 'en', NULL, 'We start with your operation: teams, sites, networks, workflows, and access needs. Then we define the devices, platform, and deployment that fit.', NULL);
SELECT pg_temp.put_item('about_how_we_work', 10, 'id', NULL, 'Kami mulai dari operasional Anda: tim, lokasi, jaringan, alur kerja, dan kebutuhan akses. Setelah itu kami menentukan perangkat, platform, dan deployment yang sesuai.', NULL);
SELECT pg_temp.put_item('about_how_we_work', 20, 'en', NULL, 'We configure the platform, users, channels, permissions, and devices, then onboard your administrators, supervisors, and field teams.', NULL);
SELECT pg_temp.put_item('about_how_we_work', 20, 'id', NULL, 'Kami mengonfigurasi platform, pengguna, channel, hak akses, dan perangkat, lalu mendampingi administrator, supervisor, dan tim lapangan Anda saat mulai menggunakannya.', NULL);
SELECT pg_temp.put_item('about_how_we_work', 30, 'en', NULL, 'After go-live, we keep the platform current with software updates and ongoing support under your agreement.', NULL);
SELECT pg_temp.put_item('about_how_we_work', 30, 'id', NULL, 'Setelah go-live, kami menjaga platform tetap mutakhir melalui pembaruan software dan dukungan berkelanjutan sesuai perjanjian.', NULL);

INSERT INTO product_translations (product_id, locale_code, name, description)
SELECT pr.id, v.locale_code, v.name, v.description
FROM (VALUES
    ('ht_poc_voice_maps', 'en', 'HT PoC Voice + Maps', 'A Push-to-Talk over Cellular (PoC) handheld for channel and one-to-one voice, latest unit location, online and speaker presence, and voice-activated transmission (VOX).'),
    ('ht_poc_voice_maps', 'id', 'HT PoC Voice + Maps', 'HT Push-to-Talk over Cellular (PoC) untuk komunikasi suara via channel maupun satu-ke-satu, lokasi terakhir unit, status online dan pembicara, serta VOX (aktivasi suara).'),
    ('ht_poc_voice_video_maps', 'en', 'HT PoC Voice & Video + Maps', 'Everything in HT PoC Voice + Maps, plus live video for channels and private sessions through the AM² relay. Front or rear camera support depends on the model.'),
    ('ht_poc_voice_video_maps', 'id', 'HT PoC Voice & Video + Maps', 'Semua kemampuan HT PoC Voice + Maps, ditambah video langsung untuk channel maupun sesi privat melalui relay AM². Dukungan kamera depan atau belakang bergantung pada model.'),
    ('body_camera', 'en', 'Body Camera', 'A body-worn camera that brings live video and unit location from the field into AM² Command Center, with each device assigned to a user.'),
    ('body_camera', 'id', 'Body Camera', 'Kamera yang dikenakan di badan untuk mengirim video langsung dan lokasi unit dari lapangan ke AM² Command Center, dengan setiap perangkat ditetapkan ke satu pengguna.')
) AS v (code, locale_code, name, description)
JOIN products pr ON pr.code = v.code
ON CONFLICT (product_id, locale_code) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now();

INSERT INTO responsibility_translations (responsibility_id, locale_code, name)
SELECT r.id, v.locale_code, v.name
FROM (VALUES
    ('platform_infrastructure', 'en', 'Platform Infrastructure'),
    ('platform_infrastructure', 'id', 'Infrastruktur Platform'),
    ('platform_operation', 'en', 'Platform Operation'),
    ('platform_operation', 'id', 'Operasional Platform'),
    ('software_updates', 'en', 'Software Updates'),
    ('software_updates', 'id', 'Pembaruan Software'),
    ('agreed_support', 'en', 'Support (per Agreement)'),
    ('agreed_support', 'id', 'Dukungan (sesuai Perjanjian)'),
    ('users', 'en', 'Users'),
    ('users', 'id', 'Pengguna'),
    ('channels', 'en', 'Channels'),
    ('channels', 'id', 'Channel'),
    ('devices', 'en', 'Devices'),
    ('devices', 'id', 'Perangkat'),
    ('field_connectivity', 'en', 'Field Connectivity'),
    ('field_connectivity', 'id', 'Konektivitas Lapangan'),
    ('daily_administration', 'en', 'Daily Administration'),
    ('daily_administration', 'id', 'Administrasi Harian')
) AS v (code, locale_code, name)
JOIN responsibilities r ON r.code = v.code
ON CONFLICT (responsibility_id, locale_code) DO UPDATE SET name = EXCLUDED.name, updated_at = now();

INSERT INTO operating_location_translations (operating_location_id, locale_code, name)
SELECT ol.id, v.locale_code, v.name
FROM (VALUES
    ('single_site', 'en', 'Single site'),
    ('single_site', 'id', 'Satu lokasi'),
    ('multi_site_city', 'en', 'Several sites in one city'),
    ('multi_site_city', 'id', 'Beberapa lokasi dalam satu kota'),
    ('multi_province', 'en', 'Several cities or provinces'),
    ('multi_province', 'id', 'Beberapa kota atau provinsi'),
    ('nationwide', 'en', 'Nationwide (Indonesia)'),
    ('nationwide', 'id', 'Seluruh Indonesia'),
    ('international', 'en', 'International'),
    ('international', 'id', 'Internasional')
) AS v (code, locale_code, name)
JOIN operating_locations ol ON ol.code = v.code
ON CONFLICT (operating_location_id, locale_code) DO UPDATE SET name = EXCLUDED.name, updated_at = now();

SELECT pg_temp.put_alt((SELECT image_id FROM content_sections WHERE section_key = 'home_hero'), 'en', 'AM² WebAdmin dashboard on a laptop next to the AM² PTT app on a phone');
SELECT pg_temp.put_alt((SELECT image_id FROM content_sections WHERE section_key = 'home_hero'), 'id', 'Dashboard AM² WebAdmin di laptop dan aplikasi AM² PTT di ponsel');
SELECT pg_temp.put_alt((SELECT si.image_id FROM section_items si JOIN content_sections cs ON cs.id = si.content_section_id WHERE cs.section_key = 'about_hero' AND si.sort_order = 10 ORDER BY si.id LIMIT 1), 'en', 'Android push-to-talk handheld for AM² PTT');
SELECT pg_temp.put_alt((SELECT si.image_id FROM section_items si JOIN content_sections cs ON cs.id = si.content_section_id WHERE cs.section_key = 'about_hero' AND si.sort_order = 10 ORDER BY si.id LIMIT 1), 'id', 'HT Android push-to-talk untuk AM² PTT');
SELECT pg_temp.put_alt((SELECT si.image_id FROM section_items si JOIN content_sections cs ON cs.id = si.content_section_id WHERE cs.section_key = 'about_hero' AND si.sort_order = 20 ORDER BY si.id LIMIT 1), 'en', 'Body camera for AM² Command Center');
SELECT pg_temp.put_alt((SELECT si.image_id FROM section_items si JOIN content_sections cs ON cs.id = si.content_section_id WHERE cs.section_key = 'about_hero' AND si.sort_order = 20 ORDER BY si.id LIMIT 1), 'id', 'Body camera untuk AM² Command Center');

COMMIT;

SELECT 'page_translations' AS table_name,
       count(*) FILTER (WHERE locale_code = 'en') AS en, count(*) FILTER (WHERE locale_code = 'id') AS id
FROM page_translations
UNION ALL SELECT 'navigation_item_translations', count(*) FILTER (WHERE locale_code = 'en'), count(*) FILTER (WHERE locale_code = 'id') FROM navigation_item_translations
UNION ALL SELECT 'content_section_translations', count(*) FILTER (WHERE locale_code = 'en'), count(*) FILTER (WHERE locale_code = 'id') FROM content_section_translations
UNION ALL SELECT 'section_item_translations', count(*) FILTER (WHERE locale_code = 'en'), count(*) FILTER (WHERE locale_code = 'id') FROM section_item_translations
UNION ALL SELECT 'product_translations', count(*) FILTER (WHERE locale_code = 'en'), count(*) FILTER (WHERE locale_code = 'id') FROM product_translations
UNION ALL SELECT 'responsibility_translations', count(*) FILTER (WHERE locale_code = 'en'), count(*) FILTER (WHERE locale_code = 'id') FROM responsibility_translations
UNION ALL SELECT 'operating_location_translations', count(*) FILTER (WHERE locale_code = 'en'), count(*) FILTER (WHERE locale_code = 'id') FROM operating_location_translations;

-- -----------------------------------------------------------------------------
-- Undo: restore the text from before the first run (remove the comment marks)
-- -----------------------------------------------------------------------------
-- BEGIN;
-- UPDATE locales l SET name = b.name, is_active = b.is_active FROM copy_backup.locales b WHERE b.code = l.code;
-- DELETE FROM page_translations;               INSERT INTO page_translations               SELECT * FROM copy_backup.page_translations;
-- DELETE FROM navigation_item_translations;    INSERT INTO navigation_item_translations    SELECT * FROM copy_backup.navigation_item_translations;
-- DELETE FROM content_section_translations;    INSERT INTO content_section_translations    SELECT * FROM copy_backup.content_section_translations;
-- DELETE FROM section_item_translations;       INSERT INTO section_item_translations       SELECT * FROM copy_backup.section_item_translations;
-- DELETE FROM product_translations;            INSERT INTO product_translations            SELECT * FROM copy_backup.product_translations;
-- DELETE FROM responsibility_translations;     INSERT INTO responsibility_translations     SELECT * FROM copy_backup.responsibility_translations;
-- DELETE FROM operating_location_translations; INSERT INTO operating_location_translations SELECT * FROM copy_backup.operating_location_translations;
-- DELETE FROM file_translations;               INSERT INTO file_translations               SELECT * FROM copy_backup.file_translations;
-- COMMIT;
-- When you are happy with the new copy, the backup can be removed: DROP SCHEMA copy_backup CASCADE;
