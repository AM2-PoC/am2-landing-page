SET client_encoding = 'UTF8';

BEGIN;

UPDATE section_items si
SET
    link_page_id = (
        SELECT id
        FROM pages
        WHERE path = '/platforms/am2-ptt-command-center'
    ),
    is_visible = true,
    updated_at = now()
FROM content_sections cs
WHERE cs.id = si.content_section_id
  AND cs.section_key = 'home_platforms'
  AND si.sort_order = 10;

UPDATE section_items si
SET
    is_visible = false,
    updated_at = now()
FROM content_sections cs
WHERE cs.id = si.content_section_id
  AND cs.section_key = 'home_platforms'
  AND si.sort_order = 20;

INSERT INTO content_section_translations (
    content_section_id,
    locale_code,
    eyebrow,
    heading,
    heading_highlight,
    body,
    cta_label
)
SELECT
    cs.id,
    v.locale_code,
    NULL,
    v.heading,
    v.heading_highlight,
    NULL,
    NULL
FROM content_sections cs
CROSS JOIN (
    VALUES
        (
            'en',
            E'AM² PTT & Command Center,\nManaged from One Place',
            'Managed from One Place'
        ),
        (
            'id',
            E'AM² PTT & Command Center,\nDikelola dari Satu Tempat',
            'Dikelola dari Satu Tempat'
        )
) AS v(locale_code, heading, heading_highlight)
WHERE cs.section_key = 'home_platforms'
ON CONFLICT (content_section_id, locale_code) DO UPDATE
SET
    eyebrow = EXCLUDED.eyebrow,
    heading = EXCLUDED.heading,
    heading_highlight = EXCLUDED.heading_highlight,
    body = EXCLUDED.body,
    cta_label = EXCLUDED.cta_label,
    updated_at = now();

INSERT INTO section_item_translations (
    section_item_id,
    locale_code,
    title,
    description,
    link_label
)
SELECT
    si.id,
    v.locale_code,
    'AM² PTT & Command Center',
    v.description,
    v.link_label
FROM section_items si
JOIN content_sections cs ON cs.id = si.content_section_id
CROSS JOIN (
    VALUES
        (
            'en',
            'Bring push-to-talk communication for field teams and body-camera visual workflows for supervisors into one operational platform, managed through WebAdmin.',
            'Explore AM² PTT & Command Center'
        ),
        (
            'id',
            'Satukan komunikasi push-to-talk untuk tim lapangan dan alur kerja visual body camera untuk supervisor dalam satu platform operasional, yang dikelola melalui WebAdmin.',
            'Pelajari AM² PTT & Command Center'
        )
) AS v(locale_code, description, link_label)
WHERE cs.section_key = 'home_platforms'
  AND si.sort_order = 10
ON CONFLICT (section_item_id, locale_code) DO UPDATE
SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    link_label = EXCLUDED.link_label,
    updated_at = now();

COMMIT;

SELECT
    si.sort_order,
    si.is_visible,
    p.path AS target_path,
    en.title AS title_en,
    idt.title AS title_id
FROM section_items si
JOIN content_sections cs ON cs.id = si.content_section_id
LEFT JOIN pages p ON p.id = si.link_page_id
LEFT JOIN section_item_translations en
    ON en.section_item_id = si.id AND en.locale_code = 'en'
LEFT JOIN section_item_translations idt
    ON idt.section_item_id = si.id AND idt.locale_code = 'id'
WHERE cs.section_key = 'home_platforms'
ORDER BY si.sort_order, si.id;
