BEGIN;

CREATE FUNCTION pg_temp.page_id(p_path text)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
    v_id bigint;
BEGIN
    IF p_path IS NULL THEN
        RETURN NULL;
    END IF;
    SELECT id INTO v_id FROM pages WHERE path = p_path;
    IF v_id IS NULL THEN
        RAISE EXCEPTION 'Seed: page path "%" not found', p_path;
    END IF;
    RETURN v_id;
END;
$$;

CREATE FUNCTION pg_temp.add_section(
    p_key        text,
    p_type       text,
    p_eyebrow    text DEFAULT NULL,
    p_heading    text DEFAULT NULL,
    p_highlight  text DEFAULT NULL,
    p_body       text DEFAULT NULL,
    p_cta_label  text DEFAULT NULL,
    p_cta_path   text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
    v_id bigint;
BEGIN
    INSERT INTO content_sections (section_key, section_type, cta_page_id)
    VALUES (p_key, p_type, pg_temp.page_id(p_cta_path))
    RETURNING id INTO v_id;

    IF COALESCE(p_eyebrow, p_heading, p_body, p_cta_label) IS NOT NULL THEN
        INSERT INTO content_section_translations
            (content_section_id, locale_code, eyebrow, heading, heading_highlight, body, cta_label)
        VALUES (v_id, 'en', p_eyebrow, p_heading, p_highlight, p_body, p_cta_label);
    END IF;

    RETURN v_id;
END;
$$;

CREATE FUNCTION pg_temp.add_item(
    p_section_key  text,
    p_sort         smallint,
    p_title        text DEFAULT NULL,
    p_description  text DEFAULT NULL,
    p_link_label   text DEFAULT NULL,
    p_link_path    text DEFAULT NULL,
    p_icon_key     text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
    v_id bigint;
BEGIN
    INSERT INTO section_items (content_section_id, icon_key, link_page_id, sort_order)
    SELECT cs.id, p_icon_key, pg_temp.page_id(p_link_path), p_sort
    FROM content_sections cs
    WHERE cs.section_key = p_section_key
    RETURNING id INTO v_id;

    IF v_id IS NULL THEN
        RAISE EXCEPTION 'Seed: section "%" not found', p_section_key;
    END IF;

    IF COALESCE(p_title, p_description, p_link_label) IS NOT NULL THEN
        INSERT INTO section_item_translations (section_item_id, locale_code, title, description, link_label)
        VALUES (v_id, 'en', p_title, p_description, p_link_label);
    END IF;

    RETURN v_id;
END;
$$;

CREATE FUNCTION pg_temp.place(p_path text, p_section_key text, p_sort smallint)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO page_content_sections (page_id, content_section_id, sort_order)
    SELECT pg_temp.page_id(p_path), cs.id, p_sort
    FROM content_sections cs
    WHERE cs.section_key = p_section_key;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Seed: section "%" not found', p_section_key;
    END IF;
END;
$$;

CREATE FUNCTION pg_temp.add_nav(
    p_location  text,
    p_parent_id bigint,
    p_sort      smallint,
    p_label     text,
    p_path      text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
    v_id bigint;
BEGIN
    INSERT INTO navigation_items (menu_location, parent_id, page_id, sort_order)
    VALUES (p_location, p_parent_id, pg_temp.page_id(p_path), p_sort)
    RETURNING id INTO v_id;

    INSERT INTO navigation_item_translations (navigation_item_id, locale_code, label)
    VALUES (v_id, 'en', p_label);

    RETURN v_id;
END;
$$;

INSERT INTO locales (code, name, is_default, is_active) VALUES
    ('en', 'English',          true,  true),
    ('id', 'Bahasa Indonesia', false, false);

INSERT INTO platforms (code, name, sort_order) VALUES
    ('am2_ptt',            'AM² PTT',            10),
    ('am2_command_center', 'AM² Command Center', 20);

INSERT INTO deployment_models (code, name, sort_order) VALUES
    ('managed_saas', 'Managed SaaS', 10),
    ('on_premise',   'On-Premise',   20);

INSERT INTO responsibilities (code, sort_order) VALUES
    ('platform_infrastructure', 10),
    ('platform_operation',      20),
    ('software_updates',        30),
    ('agreed_support',          40),
    ('users',                   50),
    ('channels',                60),
    ('devices',                 70),
    ('field_connectivity',      80),
    ('daily_administration',    90);

INSERT INTO responsibility_translations (responsibility_id, locale_code, name)
SELECT r.id, 'en', v.name
FROM (VALUES
    ('platform_infrastructure', 'Platform Infrastructure'),
    ('platform_operation',      'Platform Operation'),
    ('software_updates',        'Software Updates'),
    ('agreed_support',          'Agreed Support'),
    ('users',                   'Users'),
    ('channels',                'Channels'),
    ('devices',                 'Devices'),
    ('field_connectivity',      'Field Connectivity'),
    ('daily_administration',    'Daily Administration')
) AS v (code, name)
JOIN responsibilities r ON r.code = v.code;

INSERT INTO deployment_model_responsibilities (deployment_model_id, responsibility_id, owner_party)
SELECT dm.id, r.id, v.owner_party
FROM (VALUES
    ('managed_saas', 'platform_infrastructure', 'am2'),
    ('managed_saas', 'platform_operation',      'am2'),
    ('managed_saas', 'software_updates',        'am2'),
    ('managed_saas', 'agreed_support',          'am2'),
    ('managed_saas', 'users',                   'customer'),
    ('managed_saas', 'channels',                'customer'),
    ('managed_saas', 'devices',                 'customer'),
    ('managed_saas', 'field_connectivity',      'customer'),
    ('managed_saas', 'daily_administration',    'customer'),
    ('on_premise',   'platform_infrastructure', 'customer'),
    ('on_premise',   'platform_operation',      'customer'),
    ('on_premise',   'software_updates',        'am2'),
    ('on_premise',   'agreed_support',          'am2'),
    ('on_premise',   'users',                   'customer'),
    ('on_premise',   'channels',                'customer'),
    ('on_premise',   'devices',                 'customer'),
    ('on_premise',   'field_connectivity',      'customer'),
    ('on_premise',   'daily_administration',    'customer')
) AS v (deployment_model_code, responsibility_code, owner_party)
JOIN deployment_models dm ON dm.code = v.deployment_model_code
JOIN responsibilities  r  ON r.code  = v.responsibility_code;

INSERT INTO products (platform_id, code, sort_order)
SELECT p.id, v.code, v.sort_order
FROM (VALUES
    ('am2_ptt',            'ht_poc_voice_maps',       10::smallint),
    ('am2_ptt',            'ht_poc_voice_video_maps', 20::smallint),
    ('am2_command_center', 'body_camera',             10::smallint)
) AS v (platform_code, code, sort_order)
JOIN platforms p ON p.code = v.platform_code;

INSERT INTO product_translations (product_id, locale_code, name, description)
SELECT pr.id, 'en', v.name, v.description
FROM (VALUES
    ('ht_poc_voice_maps', 'HT PoC Voice + Maps',
     'Push-to-Talk over Cellular (PoC) devices for channel-based and private voice communication, with latest unit location, online and speaker presence, and Voice Operated Exchange (VOX) to support connected field team communications.'),
    ('ht_poc_voice_video_maps', 'HT PoC Voice & Video + Maps',
     'Push-to-Talk over Cellular (PoC) devices that add live video to voice and location capabilities for workflows requiring visual context, with support for all HT Voice capabilities, video channels, private video via AM² relay, and front and rear cameras.'),
    ('body_camera', 'Body Camera',
     'Body-worn camera devices that bring visual context from the field to AM² Command Center, with support for live video, device and user assignment, recording, unit location, and playback and export.')
) AS v (code, name, description)
JOIN products pr ON pr.code = v.code;

INSERT INTO operating_locations (code, sort_order) VALUES
    ('single_site',     10),
    ('multi_site_city', 20),
    ('multi_province',  30),
    ('nationwide',      40),
    ('international',   50);

INSERT INTO operating_location_translations (operating_location_id, locale_code, name)
SELECT ol.id, 'en', v.name
FROM (VALUES
    ('single_site',     'Single site'),
    ('multi_site_city', 'Multiple sites in one city'),
    ('multi_province',  'Multiple cities / provinces'),
    ('nationwide',      'Nationwide (Indonesia)'),
    ('international',   'International')
) AS v (code, name)
JOIN operating_locations ol ON ol.code = v.code;

INSERT INTO contact_channels (channel_type, value, sort_order) VALUES
    ('email', 'xxxxxxxxxxxxxxx@xx.id', 10),
    ('phone', '+624930534059',         20);

INSERT INTO pages (path, template, platform_id, deployment_model_id, is_published, published_at)
SELECT v.path, v.template, p.id, dm.id, true, now()
FROM (VALUES
    ('/',                                         'home',     NULL,                 NULL),
    ('/solutions/why-am2',                        'solution', NULL,                 NULL),
    ('/platforms/am2-ptt',                        'platform', 'am2_ptt',            NULL),
    ('/platforms/am2-command-center',             'platform', 'am2_command_center', NULL),
    ('/products/am2-ptt',                         'product',  'am2_ptt',            NULL),
    ('/products/am2-command-center',              'product',  'am2_command_center', NULL),
    ('/services/saas',                            'service',  NULL,                 'managed_saas'),
    ('/services/on-premise',                      'service',  NULL,                 'on_premise'),
    ('/features/am2-ptt-application',             'feature',  'am2_ptt',            NULL),
    ('/features/am2-ptt-webadmin',                'feature',  'am2_ptt',            NULL),
    ('/features/am2-command-center-application',  'feature',  'am2_command_center', NULL),
    ('/features/am2-command-center-webadmin',     'feature',  'am2_command_center', NULL),
    ('/contact-sales',                            'contact',  NULL,                 NULL),
    ('/about-us',                                 'about',    NULL,                 NULL)
) AS v (path, template, platform_code, deployment_model_code)
LEFT JOIN platforms         p  ON p.code  = v.platform_code
LEFT JOIN deployment_models dm ON dm.code = v.deployment_model_code;

INSERT INTO page_translations (page_id, locale_code, title, meta_description)
SELECT pg.id, 'en', v.title, v.meta_description
FROM (VALUES
    ('/', 'AM² — Connect Every Team, Coordinate Every Operation',
     'AM² moves beyond traditional push-to-talk, connecting voice, location, video, and centralized administration across Android devices.'),
    ('/solutions/why-am2', 'Why AM² — Communication Built Around Your Operation',
     'AM² brings communication, unit visibility, administration, and flexible deployment together for teams working across field operations.'),
    ('/platforms/am2-ptt', 'AM² PTT — Mobile Field Communications',
     'AM² PTT connects field teams through unified communication channels, real-time presence, and unit location visibility across distributed operations.'),
    ('/platforms/am2-command-center', 'AM² Command Center — Visual Operations & Coordination',
     'AM² Command Center centralizes body-camera video and visual workflows, helping supervisors monitor field activity and coordinate operations.'),
    ('/products/am2-ptt', 'AM² PTT Devices',
     'AM² is supplied on selected Android devices from OEM partners, with specifications tailored to the chosen model, operational requirements, and deployment size.'),
    ('/products/am2-command-center', 'AM² Command Center Devices',
     'AM² Command Center supports selected body-camera devices, configured according to the device model, operational requirements, and deployment scope.'),
    ('/services/saas', 'Managed SaaS — AM²',
     'AM² operates the platform infrastructure while your team manages users, devices, channels, and field connectivity.'),
    ('/services/on-premise', 'On-Premise — AM²',
     'AM² runs within your infrastructure, while your team manages the environment and daily operations.'),
    ('/features/am2-ptt-application', 'AM² PTT Application Features',
     'AM² PTT helps field teams communicate through channels, reach individual units, view current locations, and stay aware of operational activity.'),
    ('/features/am2-ptt-webadmin', 'AM² PTT WebAdmin Features',
     'AM² PTT WebAdmin provides centralized control of users, channels, permissions, memberships, and device sessions.'),
    ('/features/am2-command-center-application', 'AM² Command Center Application Features',
     'AM² Command Center provides a centralized visual workspace for supervisors and administrators managing approved AM² Body Camera deployments.'),
    ('/features/am2-command-center-webadmin', 'AM² Command Center WebAdmin Features',
     'AM² Command Center WebAdmin centralizes organization, user, and access management for approved Command Center deployments.'),
    ('/contact-sales', 'Contact Sales — Plan your AM² Deployment',
     'Share your operating environment, unit count, and preferred deployment model with the AM² team.'),
    ('/about-us', 'About AM²',
     'AM² develops operational communication solutions for field teams, bringing together purpose-configured devices, communication platforms, and flexible deployment models.')
) AS v (path, title, meta_description)
JOIN pages pg ON pg.path = v.path;

DO $$
BEGIN

PERFORM pg_temp.add_section(
    p_key       => 'site_footer',
    p_type      => 'footer',
    p_body      => 'Operational communication platform for field teams, with Managed SaaS or on-premise deployment options.'
);

PERFORM pg_temp.add_section(
    p_key       => 'cta_configure_operation',
    p_type      => 'cta',
    p_heading   => 'Ready to configure your operation?',
    p_body      => 'Discuss your communication needs, device requirements, and deployment model with the AM² team.',
    p_cta_label => 'Get in Touch',
    p_cta_path  => '/contact-sales'
);

PERFORM pg_temp.add_section(
    p_key       => 'cta_discuss_deployment',
    p_type      => 'cta',
    p_heading   => 'Ready to Discuss Your Deployment?',
    p_body      => 'Share your device count, operating locations, network environment, and preferred deployment model.',
    p_cta_label => 'Get in Touch',
    p_cta_path  => '/contact-sales'
);

PERFORM pg_temp.add_section(
    p_key       => 'cta_fit_operation',
    p_type      => 'cta',
    p_heading   => 'See How AM² Fits Your Operation',
    p_body      => 'Tell us about your field teams, devices, operating locations, and deployment preference. We will help define an initial AM² platform and device approach.',
    p_cta_label => 'Get in Touch',
    p_cta_path  => '/contact-sales'
);

PERFORM pg_temp.add_section(
    p_key       => 'service_responsibility_matrix',
    p_type      => 'responsibility_matrix',
    p_heading   => 'Clear Responsibilities. One Operating Model.',
    p_highlight => 'One Operating Model.'
);

PERFORM pg_temp.add_section(
    p_key       => 'product_list',
    p_type      => 'product_list'
);

PERFORM pg_temp.add_section(
    p_key       => 'home_hero',
    p_type      => 'hero',
    p_heading   => 'Connect Every Team Coordinate Every Operation',
    p_highlight => 'Coordinate Every Operation',
    p_body      => 'AM² moves beyond traditional push-to-talk, connecting voice, location, video, and centralized administration across Android devices.'
);

PERFORM pg_temp.add_section(p_key => 'home_outcomes', p_type => 'icon_grid');
PERFORM pg_temp.add_item('home_outcomes', 10::smallint, 'Unified PTT Communication',
    'Connect teams through PTT channels for voice and video communication—one press, no dialing.',
    p_icon_key => 'radio-handheld');
PERFORM pg_temp.add_item('home_outcomes', 20::smallint, 'Unit status at a glance',
    'See which units are online and where they were last reported.',
    p_icon_key => 'target');
PERFORM pg_temp.add_item('home_outcomes', 30::smallint, 'Centralized Control',
    'Manage users, channels, access, and devices from one place.',
    p_icon_key => 'network');
PERFORM pg_temp.add_item('home_outcomes', 40::smallint, 'Visual Operations',
    'Manage live video, recordings, and body camera unit locations from one centralized platform.',
    p_icon_key => 'camera');

PERFORM pg_temp.add_section(
    p_key       => 'home_platforms',
    p_type      => 'card_grid',
    p_heading   => 'One Administration Two Platforms for Field Operations',
    p_highlight => 'Two Platforms for Field Operations'
);
PERFORM pg_temp.add_item('home_platforms', 10::smallint, 'AM² PTT',
    'Connect push-to-talk channels, private communication, latest unit locations, optional video, presence, and access management for field teams.',
    'Explore AM² PTT', '/platforms/am2-ptt');
PERFORM pg_temp.add_item('home_platforms', 20::smallint, 'AM² Command Center',
    'Bring body cameras and visual workflows into one command environment for supervisors and administrators.',
    'Explore AM² Command Center', '/platforms/am2-command-center');

PERFORM pg_temp.add_section(
    p_key       => 'home_operational_models',
    p_type      => 'icon_grid',
    p_heading   => 'Choose the Operational Model',
    p_body      => 'Managed SaaS for a platform operated by AM². On-premise for infrastructure managed by your organization.'
);
PERFORM pg_temp.add_item('home_operational_models', 10::smallint, 'Managed SaaS',
    'AM² operates the platform infrastructure and provides software updates under the service agreement. You manage users, devices, and field connectivity.',
    'Request a SaaS proposal', '/services/saas', 'cloud');
PERFORM pg_temp.add_item('home_operational_models', 20::smallint, 'On-Premise',
    'Run the platform within your own infrastructure. Your team manages servers, network, backup, and monitoring while AM² provides the software and updates.',
    'Discuss your architecture', '/services/on-premise', 'server');

PERFORM pg_temp.add_section(
    p_key       => 'home_security_controls',
    p_type      => 'carousel',
    p_heading   => 'Security Through Practical Controls',
    p_body      => 'AM² applies controls across connections, device sessions, administration, and software releases—built around how the platform is operated.'
);
PERFORM pg_temp.add_item('home_security_controls', 10::smallint, 'TLS-Protected Connections',
    'HTTPS/WSS and TLS protect external connections in transit');
PERFORM pg_temp.add_item('home_security_controls', 20::smallint, 'Revocable Device Sessions',
    'Revoke sessions and force logout when access needs to be withdrawn');
PERFORM pg_temp.add_item('home_security_controls', 30::smallint, 'Centralized Administration',
    'Manage users, channels, memberships, and permissions through WebAdmin');

PERFORM pg_temp.add_section(
    p_key       => 'home_industries',
    p_type      => 'card_grid',
    p_heading   => 'For organizations that operate beyond the desk',
    p_highlight => 'beyond the desk',
    p_body      => 'AM² can be configured for a range of field teams and operational environments—not tied to a single industry.'
);
PERFORM pg_temp.add_item('home_industries', 10::smallint, 'Logistics & Transportation',
    'Coordinate drivers, dispatchers, hubs, and supervisors through channels and the latest available unit locations.');
PERFORM pg_temp.add_item('home_industries', 20::smallint, 'Mining & Energy',
    'Connect teams across sites and work areas using the appropriate IP connectivity');
PERFORM pg_temp.add_item('home_industries', 30::smallint, 'Construction',
    'Coordinate supervisors, operators, security, and project teams across multiple work zones');
PERFORM pg_temp.add_item('home_industries', 40::smallint, 'Manufacturing & Warehousing',
    'Create dedicated channels for production, warehouse, maintenance, and operational response');
PERFORM pg_temp.add_item('home_industries', 50::smallint, 'Security & Facilities',
    'Connect field personnel, control rooms, and supervisors through voice, location, and video where supported');
PERFORM pg_temp.add_item('home_industries', 60::smallint, 'Government & Public Operations',
    'Support field coordination with deployment and access policies configured to operational needs');

PERFORM pg_temp.add_section(
    p_key       => 'home_faq',
    p_type      => 'accordion',
    p_eyebrow   => 'FAQ',
    p_heading   => 'Questions about AM²',
    p_highlight => 'AM²'
);
PERFORM pg_temp.add_item('home_faq', 10::smallint, 'What is Push-to-Talk over Cellular (PoC)?');
PERFORM pg_temp.add_item('home_faq', 20::smallint, 'How does AM² differ from AM² Command Center?');
PERFORM pg_temp.add_item('home_faq', 30::smallint, 'What is the difference between Managed SaaS and On-Premise?');
PERFORM pg_temp.add_item('home_faq', 40::smallint, 'Does AM² require a specific network?');
PERFORM pg_temp.add_item('home_faq', 50::smallint, 'Are AM² devices manufactured by AM²?');
PERFORM pg_temp.add_item('home_faq', 60::smallint, 'Is AM² communication encrypted?');
PERFORM pg_temp.add_item('home_faq', 70::smallint, 'How is AM² priced?');
PERFORM pg_temp.add_item('home_faq', 80::smallint, 'How can I evaluate AM²?');

PERFORM pg_temp.add_section(
    p_key       => 'home_why_am2',
    p_type      => 'split_media',
    p_heading   => 'Why AM²?',
    p_highlight => 'AM²?',
    p_body      => E'Field communication is not about adding more technology, it is about having the right tools for the way people work. AM² brings devices, communication platforms, centralized administration, and flexible deployment together around each operation—from device selection and configuration to provisioning and deployment.\n\nWe start by understanding the operation first, so technology supports the way teams work rather than adding another layer of complexity.',
    p_cta_label => 'See How AM² Fits Your Operation',
    p_cta_path  => '/solutions/why-am2'
);

PERFORM pg_temp.place('/', 'home_hero',               10::smallint);
PERFORM pg_temp.place('/', 'home_outcomes',           20::smallint);
PERFORM pg_temp.place('/', 'home_platforms',          30::smallint);
PERFORM pg_temp.place('/', 'home_operational_models', 40::smallint);
PERFORM pg_temp.place('/', 'home_security_controls',  50::smallint);
PERFORM pg_temp.place('/', 'home_industries',         60::smallint);
PERFORM pg_temp.place('/', 'home_faq',                70::smallint);
PERFORM pg_temp.place('/', 'home_why_am2',            80::smallint);
PERFORM pg_temp.place('/', 'cta_configure_operation', 90::smallint);

PERFORM pg_temp.add_section(
    p_key       => 'solutions_hero',
    p_type      => 'hero',
    p_heading   => 'Communication Built Around Your Operation',
    p_highlight => 'Operation',
    p_body      => 'AM² brings communication, unit visibility, administration, and flexible deployment together for teams working across field operations.'
);

PERFORM pg_temp.add_section(
    p_key       => 'solutions_challenge',
    p_type      => 'split_media',
    p_heading   => 'When Teams Work Across Locations, Communication Gets Complex',
    p_highlight => 'Communication Gets Complex',
    p_body      => 'Field teams need to stay connected while working across vehicles, sites, facilities, and multiple operating areas. Managing communication, unit status, access, and devices across these environments can require more than a single communication tool.'
);

PERFORM pg_temp.add_section(
    p_key       => 'solutions_pillars',
    p_type      => 'icon_grid',
    p_heading   => 'Two Platforms. One Unified Ecosystem for Field Operations.',
    p_highlight => 'One Unified Ecosystem for Field Operations.',
    p_body      => 'AM² connects two integrated platforms to unify PTT communication, private communication, unit visibility, and centralized administration, enabling a scalable ecosystem tailored to the demands of complex field operations'
);
PERFORM pg_temp.add_item('solutions_pillars', 10::smallint, 'Communication',
    'Keep field teams connected through PTT channels and private communication when direct coordination is needed',
    p_icon_key => 'radio-secure');
PERFORM pg_temp.add_item('solutions_pillars', 20::smallint, 'Visibility',
    'Access unit presence, active speaker status, and the latest available location to maintain operational context',
    p_icon_key => 'eye-location');
PERFORM pg_temp.add_item('solutions_pillars', 30::smallint, 'Control',
    'Manage users, channels, memberships, feature permissions, and device sessions through WebAdmin',
    p_icon_key => 'admin-console');

PERFORM pg_temp.add_section(
    p_key       => 'solutions_capabilities',
    p_type      => 'carousel',
    p_heading   => 'What AM² Brings?',
    p_highlight => 'AM² Brings?'
);
PERFORM pg_temp.add_item('solutions_capabilities', 10::smallint, 'Flexible Deployment',
    'Choose Managed SaaS or customer-operated On-Premise deployment according to your environment');

PERFORM pg_temp.place('/solutions/why-am2', 'solutions_hero',          10::smallint);
PERFORM pg_temp.place('/solutions/why-am2', 'solutions_challenge',     20::smallint);
PERFORM pg_temp.place('/solutions/why-am2', 'solutions_pillars',       30::smallint);
PERFORM pg_temp.place('/solutions/why-am2', 'solutions_capabilities',  40::smallint);
PERFORM pg_temp.place('/solutions/why-am2', 'cta_configure_operation', 50::smallint);

PERFORM pg_temp.add_section(
    p_key       => 'platform_ptt_hero',
    p_type      => 'hero',
    p_heading   => 'Mobile Field Communications',
    p_highlight => 'Mobile Field',
    p_body      => 'AM² PTT connects field teams through unified communication channels, real-time presence, and unit location visibility across distributed operations'
);

PERFORM pg_temp.add_section(
    p_key       => 'platform_ptt_capabilities',
    p_type      => 'split_list',
    p_heading   => 'Communication for Field Operations',
    p_highlight => 'Field Operations'
);
PERFORM pg_temp.add_item('platform_ptt_capabilities', 10::smallint, 'PTT Channels & Private Communication',
    'Reach teams through channel-based voice communication and communicate directly with individuals when needed');
PERFORM pg_temp.add_item('platform_ptt_capabilities', 20::smallint, 'Presence & Latest Location',
    'View online status, active speaker presence, and the latest available unit location');
PERFORM pg_temp.add_item('platform_ptt_capabilities', 30::smallint, 'Optional Video',
    'Add visual context where supported by the selected device and platform');

PERFORM pg_temp.add_section(
    p_key       => 'platform_ptt_benefits',
    p_type      => 'card_grid',
    p_heading   => 'More Than Push-to-Talk',
    p_body      => 'AM² goes beyond voice communication by connecting teams, providing real-time visibility, and supporting smarter operations through one integrated platform.'
);
PERFORM pg_temp.add_item('platform_ptt_benefits', 10::smallint, 'Reach Teams Without Dialing',
    'Use PTT channels to address a team, or private communication to reach an individual unit');
PERFORM pg_temp.add_item('platform_ptt_benefits', 20::smallint, 'See Which Units Are Active',
    'View online status, active speakers, and the latest available unit location');
PERFORM pg_temp.add_item('platform_ptt_benefits', 30::smallint, 'Add Visual Context When Needed',
    'Use video-enabled devices for workflows that require visual context');

PERFORM pg_temp.add_section(
    p_key       => 'platform_ptt_cta',
    p_type      => 'cta',
    p_heading   => 'Explore AM² PTT Products?',
    p_body      => 'Discover the products for connected field communication and team coordination.',
    p_cta_label => 'Get in Touch',
    p_cta_path  => '/products/am2-ptt'
);

PERFORM pg_temp.place('/platforms/am2-ptt', 'platform_ptt_hero',         10::smallint);
PERFORM pg_temp.place('/platforms/am2-ptt', 'platform_ptt_capabilities', 20::smallint);
PERFORM pg_temp.place('/platforms/am2-ptt', 'platform_ptt_benefits',     30::smallint);
PERFORM pg_temp.place('/platforms/am2-ptt', 'platform_ptt_cta',          40::smallint);

PERFORM pg_temp.add_section(
    p_key       => 'platform_cc_hero',
    p_type      => 'hero',
    p_heading   => 'Visual Operations & Coordination',
    p_highlight => 'Visual',
    p_body      => 'AM² Command Center centralizes body-camera video and visual workflows, helping supervisors monitor field activity and coordinate operations across distributed teams'
);

PERFORM pg_temp.add_section(
    p_key       => 'platform_cc_capabilities',
    p_type      => 'split_list',
    p_heading   => 'Visibility for Visual Operations',
    p_highlight => 'Visual Operations'
);
PERFORM pg_temp.add_item('platform_cc_capabilities', 10::smallint, 'Body Camera',
    'Connect selected body-camera devices to visual operational workflows');
PERFORM pg_temp.add_item('platform_cc_capabilities', 20::smallint, 'Visual Operational Workflow',
    'Bring field video and related operational context into one command environment');
PERFORM pg_temp.add_item('platform_cc_capabilities', 30::smallint, 'Supervisor & Administrator Environment',
    'Provide a centralized environment for supervisors and administrators');

PERFORM pg_temp.add_section(
    p_key       => 'platform_cc_benefits',
    p_type      => 'card_grid',
    p_heading   => 'Visual Context from the Field',
    p_body      => 'AM² Command Center connects body cameras, field information, and centralized administration to support coordinated visual operations.'
);
PERFORM pg_temp.add_item('platform_cc_benefits', 10::smallint, 'Connect Field Devices',
    'Bring connected body-camera workflows into a centralized operational environment');
PERFORM pg_temp.add_item('platform_cc_benefits', 20::smallint, 'See Operational Context',
    'Access available unit status, location, and visual information from the field');
PERFORM pg_temp.add_item('platform_cc_benefits', 30::smallint, 'Coordinate from One Place',
    'Manage visual operational workflows through a centralized environment for supervisors and administrators');

PERFORM pg_temp.add_section(
    p_key       => 'platform_cc_cta',
    p_type      => 'cta',
    p_heading   => 'Explore AM² Command Center Products?',
    p_body      => 'Discover the products for centralized visual operations and field coordination.',
    p_cta_label => 'Get in Touch',
    p_cta_path  => '/products/am2-command-center'
);

PERFORM pg_temp.place('/platforms/am2-command-center', 'platform_cc_hero',         10::smallint);
PERFORM pg_temp.place('/platforms/am2-command-center', 'platform_cc_capabilities', 20::smallint);
PERFORM pg_temp.place('/platforms/am2-command-center', 'platform_cc_benefits',     30::smallint);
PERFORM pg_temp.place('/platforms/am2-command-center', 'platform_cc_cta',          40::smallint);

PERFORM pg_temp.add_section(
    p_key       => 'product_ptt_hero',
    p_type      => 'hero',
    p_heading   => 'Choose The Device That Fits Your Operation',
    p_highlight => 'Operation',
    p_body      => 'AM² is supplied on selected Android devices from OEM partners, with specifications tailored to the chosen model, operational requirements, and deployment size'
);

PERFORM pg_temp.add_section(
    p_key       => 'product_cc_hero',
    p_type      => 'hero',
    p_heading   => 'Built Around Your Visual Operations',
    p_highlight => 'Visual Operations',
    p_body      => 'AM² Command Center supports selected body-camera devices, configured according to the device model, operational requirements, and deployment scope'
);

PERFORM pg_temp.place('/products/am2-ptt',            'product_ptt_hero', 10::smallint);
PERFORM pg_temp.place('/products/am2-ptt',            'product_list',     20::smallint);
PERFORM pg_temp.place('/products/am2-command-center', 'product_cc_hero',  10::smallint);
PERFORM pg_temp.place('/products/am2-command-center', 'product_list',     20::smallint);

PERFORM pg_temp.add_section(
    p_key       => 'service_saas_hero',
    p_type      => 'hero',
    p_heading   => 'Run the Platform Without Running the Infrastructure',
    p_highlight => 'Infrastructure',
    p_body      => 'AM² operates the platform infrastructure while your team manages users, devices, channels, and field connectivity'
);

PERFORM pg_temp.add_section(
    p_key       => 'service_saas_how_it_works',
    p_type      => 'split_list',
    p_heading   => 'How It Works?',
    p_highlight => 'How It Works?'
);
PERFORM pg_temp.add_item('service_saas_how_it_works', 10::smallint, 'Platform Infrastructure',
    'AM² Command Center connects selected body-camera devices to the platform for visual operational workflows');
PERFORM pg_temp.add_item('service_saas_how_it_works', 20::smallint, 'Software + Updates',
    'AM² provides software and product updates according to the selected deployment model');
PERFORM pg_temp.add_item('service_saas_how_it_works', 30::smallint, 'Users + Devices + Operations',
    'Supervisors and administrators manage users, connected devices, and operational workflows through a centralized environment');

PERFORM pg_temp.add_section(
    p_key       => 'service_on_premise_hero',
    p_type      => 'hero',
    p_heading   => 'Your Infrastructure Your Operating Environment',
    p_highlight => 'Your Operating Environment',
    p_body      => 'AM² runs within your infrastructure, while your team manages the environment and daily operations'
);

PERFORM pg_temp.add_section(
    p_key       => 'service_on_premise_how_it_works',
    p_type      => 'split_list',
    p_heading   => 'How It Works?',
    p_highlight => 'How It Works?'
);
PERFORM pg_temp.add_item('service_on_premise_how_it_works', 10::smallint, 'Platform Infrastructure',
    'Runs on customer-managed server, network, backup, and monitoring infrastructure.');
PERFORM pg_temp.add_item('service_on_premise_how_it_works', 20::smallint, 'Software + Updates',
    'AM² provides software and updates within the agreed deployment scope.');
PERFORM pg_temp.add_item('service_on_premise_how_it_works', 30::smallint, 'Users + Devices + Operations',
    'Your team manages users, devices, and daily operations.');

PERFORM pg_temp.place('/services/saas',       'service_saas_hero',               10::smallint);
PERFORM pg_temp.place('/services/saas',       'service_saas_how_it_works',       20::smallint);
PERFORM pg_temp.place('/services/saas',       'service_responsibility_matrix',   30::smallint);
PERFORM pg_temp.place('/services/saas',       'cta_discuss_deployment',          40::smallint);
PERFORM pg_temp.place('/services/on-premise', 'service_on_premise_hero',         10::smallint);
PERFORM pg_temp.place('/services/on-premise', 'service_on_premise_how_it_works', 20::smallint);
PERFORM pg_temp.place('/services/on-premise', 'service_responsibility_matrix',   30::smallint);
PERFORM pg_temp.place('/services/on-premise', 'cta_discuss_deployment',          40::smallint);

PERFORM pg_temp.add_section(
    p_key       => 'feature_ptt_app_hero',
    p_type      => 'hero',
    p_heading   => 'Field Communication, Built for Android',
    p_highlight => 'Built for Android',
    p_body      => 'AM² PTT helps field teams communicate through channels, reach individual units, view current locations, and stay aware of operational activity'
);
PERFORM pg_temp.add_section(
    p_key       => 'feature_ptt_app_list',
    p_type      => 'split_list',
    p_heading   => 'AM² PTT Application',
    p_highlight => 'AM² PTT Application'
);
PERFORM pg_temp.add_item('feature_ptt_app_list', 10::smallint, 'Channel Push-to-Talk',
    'Communicate through organization-defined channels with transmit and active-speaker indicators');
PERFORM pg_temp.add_item('feature_ptt_app_list', 20::smallint, 'Private Communication',
    'Reach a specific unit through private voice or video sessions routed through the AM² platform');
PERFORM pg_temp.add_item('feature_ptt_app_list', 30::smallint, 'Latest Unit Location',
    'View the latest available location of online units when device permissions and connectivity allow');
PERFORM pg_temp.add_item('feature_ptt_app_list', 40::smallint, 'Presence',
    'See which units are online and who is actively speaking or streaming on a channel');

PERFORM pg_temp.add_section(
    p_key       => 'feature_ptt_webadmin_hero',
    p_type      => 'hero',
    p_heading   => 'Control Users, Channels, and Communication Access',
    p_highlight => 'Communication Access',
    p_body      => 'AM² PTT WebAdmin provides centralized control of users, channels, permissions, memberships, and device sessions for streamlined communication management'
);
PERFORM pg_temp.add_section(
    p_key       => 'feature_ptt_webadmin_list',
    p_type      => 'split_list',
    p_heading   => 'AM² PTT WebAdmin',
    p_highlight => 'AM² PTT WebAdmin'
);
PERFORM pg_temp.add_item('feature_ptt_webadmin_list', 10::smallint, 'Organization and User Administration',
    'Manage organizations or tenant structures, administrators, and field users');
PERFORM pg_temp.add_item('feature_ptt_webadmin_list', 20::smallint, 'Channel Management',
    'Manage communication channels, memberships, and default channel assignments');
PERFORM pg_temp.add_item('feature_ptt_webadmin_list', 30::smallint, 'Access Policies',
    'Apply user, channel, and feature permissions according to operational roles');
PERFORM pg_temp.add_item('feature_ptt_webadmin_list', 40::smallint, 'Feature Configuration',
    'Configure availability of supported platform features, such as maps, video, and private communication');

PERFORM pg_temp.add_section(
    p_key       => 'feature_cc_app_hero',
    p_type      => 'hero',
    p_heading   => 'Visual Coordination for Body-Camera Operations',
    p_highlight => 'Body-Camera Operations',
    p_body      => 'AM² Command Center provides a centralized visual workspace for supervisors and administrators managing approved AM² Body Camera deployments'
);
PERFORM pg_temp.add_section(
    p_key       => 'feature_cc_app_list',
    p_type      => 'split_list',
    p_heading   => 'AM² Command Center Application',
    p_highlight => 'AM² Command Center Application'
);
PERFORM pg_temp.add_item('feature_cc_app_list', 10::smallint, 'Visual Operational Environment',
    'Centralize approved body-camera deployments to help supervisors view live video, coordinate field activity, and maintain operational awareness');
PERFORM pg_temp.add_item('feature_cc_app_list', 20::smallint, 'Supervisor Access',
    'Control supervisor and administrator access by assigning role-based permissions aligned with organizational responsibilities');
PERFORM pg_temp.add_item('feature_cc_app_list', 30::smallint, 'Operational Context',
    'Support visual workflows for video review, live monitoring, and coordination alongside AM² field operations');
PERFORM pg_temp.add_item('feature_cc_app_list', 40::smallint, 'Deployment Choice',
    'Available as Managed SaaS or Customer-Managed On-Premise deployment');

PERFORM pg_temp.add_section(
    p_key       => 'feature_cc_webadmin_hero',
    p_type      => 'hero',
    p_heading   => 'Coordinate Visual Operations with Controlled Access',
    p_highlight => 'Controlled Access',
    p_body      => 'AM² Command Center WebAdmin centralizes organization, user, and access management for approved Command Center deployments'
);
PERFORM pg_temp.add_section(
    p_key       => 'feature_cc_webadmin_list',
    p_type      => 'split_list',
    p_heading   => 'AM² Command Center WebAdmin',
    p_highlight => 'AM² Command Center WebAdmin'
);
PERFORM pg_temp.add_item('feature_cc_webadmin_list', 10::smallint, 'Organization Management',
    'Manage organizational structures, tenant scopes, and administrative boundaries');
PERFORM pg_temp.add_item('feature_cc_webadmin_list', 20::smallint, 'User & Access Control',
    'Assign user roles and permissions based on operational responsibilities');
PERFORM pg_temp.add_item('feature_cc_webadmin_list', 30::smallint, 'Device & Feature Management',
    'Manage body-camera assignments and Command Center feature access within approved configurations');
PERFORM pg_temp.add_item('feature_cc_webadmin_list', 40::smallint, 'Deployment Administration',
    'Support Managed SaaS and customer-operated On-Premise deployments');

PERFORM pg_temp.place('/features/am2-ptt-application',            'feature_ptt_app_hero',      10::smallint);
PERFORM pg_temp.place('/features/am2-ptt-application',            'feature_ptt_app_list',      20::smallint);
PERFORM pg_temp.place('/features/am2-ptt-application',            'cta_fit_operation',         30::smallint);
PERFORM pg_temp.place('/features/am2-ptt-webadmin',               'feature_ptt_webadmin_hero', 10::smallint);
PERFORM pg_temp.place('/features/am2-ptt-webadmin',               'feature_ptt_webadmin_list', 20::smallint);
PERFORM pg_temp.place('/features/am2-ptt-webadmin',               'cta_fit_operation',         30::smallint);
PERFORM pg_temp.place('/features/am2-command-center-application', 'feature_cc_app_hero',       10::smallint);
PERFORM pg_temp.place('/features/am2-command-center-application', 'feature_cc_app_list',       20::smallint);
PERFORM pg_temp.place('/features/am2-command-center-application', 'cta_fit_operation',         30::smallint);
PERFORM pg_temp.place('/features/am2-command-center-webadmin',    'feature_cc_webadmin_hero',  10::smallint);
PERFORM pg_temp.place('/features/am2-command-center-webadmin',    'feature_cc_webadmin_list',  20::smallint);
PERFORM pg_temp.place('/features/am2-command-center-webadmin',    'cta_fit_operation',         30::smallint);

PERFORM pg_temp.add_section(
    p_key       => 'contact_sales_form',
    p_type      => 'contact_form',
    p_eyebrow   => 'Discuss Your Requirements',
    p_heading   => 'Plan your AM² Deployment',
    p_body      => 'Share your operating environment, unit count, and preferred deployment model with our team.'
);

PERFORM pg_temp.place('/contact-sales', 'contact_sales_form', 10::smallint);

PERFORM pg_temp.add_section(
    p_key       => 'about_hero',
    p_type      => 'hero',
    p_heading   => 'About AM²',
    p_body      => 'AM² develops operational communication solutions for field teams, bringing together purpose-configured devices, communication platforms, and flexible deployment models. Our solutions combine push-to-talk communication, unit location, presence, optional video, and centralized administration in one operational environment.'
);

PERFORM pg_temp.add_item('about_hero', 10::smallint);
PERFORM pg_temp.add_item('about_hero', 20::smallint);

PERFORM pg_temp.add_section(
    p_key       => 'about_what_we_do',
    p_type      => 'card_grid',
    p_heading   => 'What We Do?',
    p_body      => 'Devices, platforms, and deployment support in one solution.'
);
PERFORM pg_temp.add_item('about_what_we_do', 10::smallint, 'Field Communications',
    'Push-to-talk, private communication, latest unit location, optional video, and operational presence through Mobile devices.');
PERFORM pg_temp.add_item('about_what_we_do', 20::smallint, 'Operational Administration',
    'Central administration of users, channels, access policies, feature permissions, and device sessions through WebAdmin.');
PERFORM pg_temp.add_item('about_what_we_do', 30::smallint, 'Deployment',
    'Choose AM²-operated Managed SaaS or customer-operated On-Premise deployment.');
PERFORM pg_temp.add_item('about_what_we_do', 40::smallint, 'Services',
    'Deployment planning, configuration, device provisioning, training, software updates, and support under the agreed scope.');

PERFORM pg_temp.add_section(
    p_key       => 'about_how_we_work',
    p_type      => 'process_steps',
    p_heading   => 'How We Work?'
);
PERFORM pg_temp.add_item('about_how_we_work', 10::smallint, p_description =>
    'Assess your operations and define the right solution across teams, locations, networks, workflows, devices, platforms, access, and deployment.');
PERFORM pg_temp.add_item('about_how_we_work', 20::smallint, p_description =>
    'Configure and deploy the platform, users, channels, permissions, and devices, then onboard administrators, supervisors, and field teams.');
PERFORM pg_temp.add_item('about_how_we_work', 30::smallint, p_description =>
    'Ensure lifecycle continuity through managed software updates and ongoing service support.');

PERFORM pg_temp.place('/about-us', 'about_hero',              10::smallint);
PERFORM pg_temp.place('/about-us', 'about_what_we_do',        20::smallint);
PERFORM pg_temp.place('/about-us', 'about_how_we_work',       30::smallint);
PERFORM pg_temp.place('/about-us', 'cta_configure_operation', 40::smallint);

END;
$$;

DO $$
DECLARE
    v_solutions  bigint;
    v_ecosystems bigint;
    v_products   bigint;
    v_services   bigint;
    v_platforms  bigint;
    v_features   bigint;
    v_f_solution bigint;
    v_f_eco      bigint;
    v_f_features bigint;
BEGIN
    PERFORM pg_temp.add_nav('header', NULL, 10::smallint, 'Home', '/');

    v_solutions := pg_temp.add_nav('header', NULL, 20::smallint, 'Solutions');
    PERFORM pg_temp.add_nav('header', v_solutions, 10::smallint, 'WhyAM²', '/solutions/why-am2');

    v_ecosystems := pg_temp.add_nav('header', NULL, 30::smallint, 'Ecosystems');

    v_products := pg_temp.add_nav('header', v_ecosystems, 10::smallint, 'Products');
    PERFORM pg_temp.add_nav('header', v_products, 10::smallint, 'Product - AM² PTT',            '/products/am2-ptt');
    PERFORM pg_temp.add_nav('header', v_products, 20::smallint, 'Product - AM² Command Center', '/products/am2-command-center');

    v_services := pg_temp.add_nav('header', v_ecosystems, 20::smallint, 'Services');
    PERFORM pg_temp.add_nav('header', v_services, 10::smallint, 'Service - SaaS',       '/services/saas');
    PERFORM pg_temp.add_nav('header', v_services, 20::smallint, 'Service - On-Premise', '/services/on-premise');

    v_platforms := pg_temp.add_nav('header', v_ecosystems, 30::smallint, 'Platforms');
    PERFORM pg_temp.add_nav('header', v_platforms, 10::smallint, 'Platform - AM² PTT',            '/platforms/am2-ptt');
    PERFORM pg_temp.add_nav('header', v_platforms, 20::smallint, 'Platform - AM² Command Center', '/platforms/am2-command-center');

    v_features := pg_temp.add_nav('header', NULL, 40::smallint, 'Features');
    PERFORM pg_temp.add_nav('header', v_features, 10::smallint, 'AM² PTT Application',            '/features/am2-ptt-application');
    PERFORM pg_temp.add_nav('header', v_features, 20::smallint, 'AM² PTT WebAdmin',               '/features/am2-ptt-webadmin');
    PERFORM pg_temp.add_nav('header', v_features, 30::smallint, 'AM² Command Center Application', '/features/am2-command-center-application');
    PERFORM pg_temp.add_nav('header', v_features, 40::smallint, 'AM² Command Center WebAdmin',    '/features/am2-command-center-webadmin');

    PERFORM pg_temp.add_nav('header', NULL, 70::smallint, 'Contact Sales', '/contact-sales');
    PERFORM pg_temp.add_nav('header', NULL, 80::smallint, 'About Us',      '/about-us');

    v_f_solution := pg_temp.add_nav('footer', NULL, 10::smallint, 'Solution');
    PERFORM pg_temp.add_nav('footer', v_f_solution, 10::smallint, 'WhyAM²', '/solutions/why-am2');

    v_f_eco := pg_temp.add_nav('footer', NULL, 20::smallint, 'Ecosystems');
    PERFORM pg_temp.add_nav('footer', v_f_eco, 10::smallint, 'Platforms', '/platforms/am2-ptt');
    PERFORM pg_temp.add_nav('footer', v_f_eco, 20::smallint, 'Products',  '/products/am2-ptt');
    PERFORM pg_temp.add_nav('footer', v_f_eco, 30::smallint, 'Services',  '/services/saas');

    v_f_features := pg_temp.add_nav('footer', NULL, 30::smallint, 'Features');
    PERFORM pg_temp.add_nav('footer', v_f_features, 10::smallint, 'Android PTT', '/features/am2-ptt-application');
    PERFORM pg_temp.add_nav('footer', v_f_features, 20::smallint, 'WebAdmin',    '/features/am2-ptt-webadmin');
END;
$$;

COMMIT;
