\set locale 'en'
\set path '/'

SELECT p.id,
       p.template,
       p.platform_id,
       p.deployment_model_id,
       COALESCE(t.title, d.title)                       AS title,
       COALESCE(t.meta_description, d.meta_description) AS meta_description
FROM pages p
CROSS JOIN (SELECT code FROM locales WHERE is_default) dl
LEFT JOIN page_translations t ON t.page_id = p.id AND t.locale_code = :'locale'
LEFT JOIN page_translations d ON d.page_id = p.id AND d.locale_code = dl.code
WHERE p.path = :'path'
  AND p.is_published;

SELECT pcs.sort_order,
       cs.section_key,
       cs.section_type,
       COALESCE(t.eyebrow, d.eyebrow)                     AS eyebrow,
       COALESCE(t.heading, d.heading)                     AS heading,
       COALESCE(t.heading_highlight, d.heading_highlight) AS heading_highlight,
       COALESCE(t.body, d.body)                           AS body,
       COALESCE(t.cta_label, d.cta_label)                 AS cta_label,
       cta.path                                           AS cta_path,
       cs.image_id                                        AS image_id,
       COALESCE(items.items, '[]'::jsonb)                 AS items
FROM pages p
CROSS JOIN (SELECT code FROM locales WHERE is_default) dl
JOIN page_content_sections pcs ON pcs.page_id = p.id AND pcs.is_visible
JOIN content_sections cs        ON cs.id = pcs.content_section_id
LEFT JOIN content_section_translations t ON t.content_section_id = cs.id AND t.locale_code = :'locale'
LEFT JOIN content_section_translations d ON d.content_section_id = cs.id AND d.locale_code = dl.code
LEFT JOIN pages cta        ON cta.id = cs.cta_page_id AND cta.is_published
LEFT JOIN LATERAL (
    SELECT jsonb_agg(
               jsonb_build_object(
                   'title',       COALESCE(it.title, itd.title),
                   'description', COALESCE(it.description, itd.description),
                   'link_label',  COALESCE(it.link_label, itd.link_label),
                   'link_path',   lp.path,
                   'icon_key',    si.icon_key,
                   'image_id',    si.image_id,
                   'image_alt',   COALESCE(ft.alt_text, ftd.alt_text, '')
               )
               ORDER BY si.sort_order
           ) AS items
    FROM section_items si
    LEFT JOIN section_item_translations it  ON it.section_item_id  = si.id AND it.locale_code  = :'locale'
    LEFT JOIN section_item_translations itd ON itd.section_item_id = si.id AND itd.locale_code = dl.code
    LEFT JOIN pages lp         ON lp.id = si.link_page_id AND lp.is_published
    LEFT JOIN file_translations ft  ON ft.directus_files_id  = si.image_id AND ft.locale_code  = :'locale'
    LEFT JOIN file_translations ftd ON ftd.directus_files_id = si.image_id AND ftd.locale_code = dl.code
    WHERE si.content_section_id = cs.id
      AND si.is_visible
) items ON true
WHERE p.path = :'path'
  AND p.is_published
ORDER BY pcs.sort_order, pcs.id;

WITH RECURSIVE tree AS (
    SELECT n.id, n.parent_id, n.page_id, 1 AS depth, ARRAY[n.sort_order::int, n.id] AS sort_path
    FROM navigation_items n
    WHERE n.menu_location = 'header'
      AND n.parent_id IS NULL
      AND n.is_visible
    UNION ALL
    SELECT c.id, c.parent_id, c.page_id, t.depth + 1, t.sort_path || ARRAY[c.sort_order::int, c.id]
    FROM navigation_items c
    JOIN tree t ON c.parent_id = t.id
    WHERE c.is_visible
)
SELECT tree.id,
       tree.parent_id,
       tree.depth,
       repeat('    ', tree.depth - 1) || COALESCE(lt.label, ld.label) AS label,
       pg.path
FROM tree
CROSS JOIN (SELECT code FROM locales WHERE is_default) dl
LEFT JOIN navigation_item_translations lt ON lt.navigation_item_id = tree.id AND lt.locale_code = :'locale'
LEFT JOIN navigation_item_translations ld ON ld.navigation_item_id = tree.id AND ld.locale_code = dl.code
LEFT JOIN pages pg ON pg.id = tree.page_id
WHERE tree.page_id IS NULL OR pg.is_published
ORDER BY tree.sort_path;

SELECT COALESCE(t.name, d.name)               AS name,
       COALESCE(t.description, d.description) AS description,
       pr.image_id                            AS image_id,
       platform_page.path                     AS explore_platform_path
FROM pages p
CROSS JOIN (SELECT code FROM locales WHERE is_default) dl
JOIN products pr ON pr.platform_id = p.platform_id AND pr.is_active
LEFT JOIN product_translations t ON t.product_id = pr.id AND t.locale_code = :'locale'
LEFT JOIN product_translations d ON d.product_id = pr.id AND d.locale_code = dl.code
LEFT JOIN pages platform_page    ON platform_page.platform_id = pr.platform_id
                                AND platform_page.template = 'platform'
                                AND platform_page.is_published
WHERE p.path = '/products/am2-ptt'
ORDER BY pr.sort_order, pr.id;

SELECT COALESCE(t.name, d.name)          AS responsibility,
       dmr.owner_party = 'am2'           AS checked_am2,
       dmr.owner_party = 'customer'      AS checked_customer
FROM pages p
CROSS JOIN (SELECT code FROM locales WHERE is_default) dl
JOIN deployment_model_responsibilities dmr ON dmr.deployment_model_id = p.deployment_model_id
JOIN responsibilities r ON r.id = dmr.responsibility_id
LEFT JOIN responsibility_translations t ON t.responsibility_id = r.id AND t.locale_code = :'locale'
LEFT JOIN responsibility_translations d ON d.responsibility_id = r.id AND d.locale_code = dl.code
WHERE p.path = '/services/on-premise'
ORDER BY r.sort_order;

SELECT id AS value, name AS label FROM platforms WHERE is_active ORDER BY sort_order;

SELECT id AS value, name AS label FROM deployment_models WHERE is_active ORDER BY sort_order;

SELECT ol.id AS value, COALESCE(t.name, d.name) AS label
FROM operating_locations ol
CROSS JOIN (SELECT code FROM locales WHERE is_default) dl
LEFT JOIN operating_location_translations t ON t.operating_location_id = ol.id AND t.locale_code = :'locale'
LEFT JOIN operating_location_translations d ON d.operating_location_id = ol.id AND d.locale_code = dl.code
WHERE ol.is_active
ORDER BY ol.sort_order;

SELECT channel_type, value FROM contact_channels WHERE is_active ORDER BY sort_order;


INSERT INTO contact_requests (
    full_name, work_email, phone_number, company_name, job_role,
    platform_id, deployment_model_id, operating_location_id,
    message, consent_given_at, locale_code, source_page_id, ip_address, user_agent
)
VALUES (
    'Budi Santoso', 'budi@contoh.co.id', '+6281234567890', 'PT Contoh Logistik', 'Operations Manager',
    (SELECT id FROM platforms           WHERE code = 'am2_ptt'),
    (SELECT id FROM deployment_models   WHERE code = 'managed_saas'),
    (SELECT id FROM operating_locations WHERE code = 'multi_province'),
    'Kami punya ±120 unit lapangan di 3 provinsi.',
    now(), :'locale',
    (SELECT id FROM pages WHERE path = '/services/saas'),
    '203.0.113.10', 'Mozilla/5.0'
);

SELECT cr.id,
       cr.created_at,
       cr.full_name,
       cr.company_name,
       cr.work_email,
       pl.name  AS product_of_interest,
       dm.name  AS deployment_preference,
       COALESCE(olt.name, cr.operating_location_id::text) AS operating_location,
       src.path AS source_page
FROM contact_requests cr
JOIN platforms pl          ON pl.id = cr.platform_id
JOIN deployment_models dm  ON dm.id = cr.deployment_model_id
LEFT JOIN operating_location_translations olt
       ON olt.operating_location_id = cr.operating_location_id
      AND olt.locale_code = (SELECT code FROM locales WHERE is_default)
LEFT JOIN pages src        ON src.id = cr.source_page_id
WHERE cr.status = 'new'
ORDER BY cr.created_at DESC
LIMIT 50;

SELECT dm.code AS deployment_model, r.code AS missing_responsibility
FROM deployment_models dm
CROSS JOIN responsibilities r
LEFT JOIN deployment_model_responsibilities x
       ON x.deployment_model_id = dm.id AND x.responsibility_id = r.id
WHERE x.responsibility_id IS NULL;

SELECT l.code AS locale_code, cs.section_key
FROM content_sections cs
JOIN content_section_translations base ON base.content_section_id = cs.id
JOIN locales base_l ON base_l.code = base.locale_code AND base_l.is_default
CROSS JOIN locales l
LEFT JOIN content_section_translations tr
       ON tr.content_section_id = cs.id AND tr.locale_code = l.code
WHERE NOT l.is_default
  AND tr.content_section_id IS NULL
ORDER BY l.code, cs.section_key;