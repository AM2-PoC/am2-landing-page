BEGIN;

INSERT INTO operating_location_translations (operating_location_id, locale_code, name)
SELECT ol.id, 'id', v.name
FROM (VALUES
	('single_site',     'Satu lokasi'),
	('multi_site_city', 'Beberapa lokasi dalam satu kota'),
	('multi_province',  'Beberapa kota / provinsi'),
	('nationwide',      'Nasional (seluruh Indonesia)'),
	('international',   'Internasional')
) AS v(code, name)
JOIN operating_locations ol ON ol.code = v.code
ON CONFLICT (operating_location_id, locale_code) DO UPDATE SET name = EXCLUDED.name;

COMMIT;

SELECT ol.code, t.locale_code, t.name
FROM operating_locations ol
JOIN operating_location_translations t ON t.operating_location_id = ol.id
ORDER BY ol.sort_order, t.locale_code;