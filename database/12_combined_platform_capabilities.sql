SET client_encoding = 'UTF8';

-- Combined platform page (/platforms/am2-ptt-command-center): the two capability sections
-- (AM² PTT and AM² Command Center, 3 points each) become one section with 4 points.
-- platform_combined_ptt is reused as the combined section (photo on the right);
-- platform_combined_command_center is hidden on the page, not deleted, so it can be restored.

BEGIN;

INSERT INTO content_section_translations (
    content_section_id, locale_code, eyebrow, heading, heading_highlight, body, cta_label
)
SELECT cs.id, v.locale_code, NULL, 'AM² PTT & Command Center', 'Command Center', v.body, NULL
FROM content_sections cs
CROSS JOIN (
    VALUES
        ('en', 'Push-to-talk for teams on the move and visual operations for supervisors, in one platform.'),
        ('id', 'Push-to-talk untuk tim yang terus bergerak dan operasi visual untuk supervisor, dalam satu platform.')
) AS v (locale_code, body)
WHERE cs.section_key = 'platform_combined_ptt'
ON CONFLICT (content_section_id, locale_code) DO UPDATE
SET eyebrow = EXCLUDED.eyebrow,
    heading = EXCLUDED.heading,
    heading_highlight = EXCLUDED.heading_highlight,
    body = EXCLUDED.body,
    cta_label = EXCLUDED.cta_label,
    updated_at = now();

-- Fourth point (sort 40); points 10-30 already exist from migration 10
INSERT INTO section_items (content_section_id, sort_order)
SELECT cs.id, 40
FROM content_sections cs
WHERE cs.section_key = 'platform_combined_ptt'
  AND NOT EXISTS (
      SELECT 1 FROM section_items si
      WHERE si.content_section_id = cs.id AND si.sort_order = 40
  );

UPDATE section_items si
SET is_visible = true, updated_at = now()
FROM content_sections cs
WHERE cs.id = si.content_section_id
  AND cs.section_key = 'platform_combined_ptt'
  AND si.sort_order IN (10, 20, 30, 40);

-- 10 and 20 keep the AM² PTT copy; 30 merges Optional Video + Body Camera Integration;
-- 40 merges Visual Operational Workflow + Supervisor & Administrator Workspace
INSERT INTO section_item_translations (section_item_id, locale_code, title, description, link_label)
SELECT si.id, v.locale_code, v.title, v.description, NULL
FROM section_items si
JOIN content_sections cs ON cs.id = si.content_section_id
JOIN (
    VALUES
        (10, 'en', 'Channels & One-to-One Talk',
         'Talk to a whole channel at once, or reach one person privately through the AM² relay.'),
        (10, 'id', 'Channel & Komunikasi Privat',
         'Bicara ke satu channel sekaligus, atau hubungi satu orang secara privat melalui relay AM².'),
        (20, 'en', 'Presence & Latest Location',
         'See who is online, who is speaking, and where each unit was last reported.'),
        (20, 'id', 'Status Online & Lokasi Terakhir',
         'Lihat siapa yang online, siapa yang sedang bicara, dan posisi terakhir setiap unit.'),
        (30, 'en', 'Body Camera & Live Video',
         'Bring live video from selected body cameras, or from handhelds whose setup supports it, into your operational workflows.'),
        (30, 'id', 'Body Camera & Video Langsung',
         'Hadirkan video langsung dari body camera pilihan, atau dari HT yang konfigurasinya mendukung, ke alur kerja operasional Anda.'),
        (40, 'en', 'Supervisor Command Workspace',
         'Supervisors and administrators monitor field video with its operational context and coordinate from one command environment.'),
        (40, 'id', 'Ruang Kerja Komando Supervisor',
         'Supervisor dan administrator memantau video lapangan beserta konteks operasionalnya, lalu berkoordinasi dari satu pusat komando.')
) AS v (sort_order, locale_code, title, description) ON v.sort_order = si.sort_order
WHERE cs.section_key = 'platform_combined_ptt'
ON CONFLICT (section_item_id, locale_code) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    link_label = EXCLUDED.link_label,
    updated_at = now();

UPDATE page_content_sections pcs
SET is_visible = false, updated_at = now()
FROM content_sections cs, pages p
WHERE cs.id = pcs.content_section_id
  AND p.id = pcs.page_id
  AND p.path = '/platforms/am2-ptt-command-center'
  AND cs.section_key = 'platform_combined_command_center';

COMMIT;

SELECT pcs.sort_order, cs.section_key, pcs.is_visible, en.heading AS heading_en, idt.heading AS heading_id
FROM page_content_sections pcs
JOIN content_sections cs ON cs.id = pcs.content_section_id
LEFT JOIN content_section_translations en  ON en.content_section_id  = cs.id AND en.locale_code  = 'en'
LEFT JOIN content_section_translations idt ON idt.content_section_id = cs.id AND idt.locale_code = 'id'
WHERE pcs.page_id = (SELECT id FROM pages WHERE path = '/platforms/am2-ptt-command-center')
ORDER BY pcs.sort_order;

SELECT si.sort_order, si.is_visible, en.title AS title_en, idt.title AS title_id
FROM section_items si
JOIN content_sections cs ON cs.id = si.content_section_id
LEFT JOIN section_item_translations en  ON en.section_item_id  = si.id AND en.locale_code  = 'en'
LEFT JOIN section_item_translations idt ON idt.section_item_id = si.id AND idt.locale_code = 'id'
WHERE cs.section_key = 'platform_combined_ptt'
ORDER BY si.sort_order, si.id;
