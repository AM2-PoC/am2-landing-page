import type {
	ProductData,
	ResponsibilityRowData,
	SectionData,
	SectionItemData
} from '#lib/types/content.ts';

const empty = {
	eyebrow: null,
	heading: null,
	highlight: null,
	body: null,
	image: null,
	cta: null,
	items: []
};

function item(
	id: number,
	title: string | null,
	description: string | null,
	extra: Partial<SectionItemData> = {}
): SectionItemData {
	return { id, title, description, iconKey: null, image: null, link: null, ...extra };
}

export const heroCentered: SectionData = {
	...empty,
	key: 'sg_hero_centered',
	type: 'hero',
	heading: 'Connect Every Team\nCoordinate Every Operation',
	highlight: 'Coordinate Every Operation',
	body: 'AM² moves beyond traditional push-to-talk, connecting voice, location, video, and centralized administration across Android devices.'
};

export const heroBackground: SectionData = {
	...empty,
	key: 'sg_hero_bg',
	type: 'hero',
	heading: 'Mobile Field Communications',
	highlight: 'Mobile Field',
	body: 'AM² PTT connects field teams through unified communication channels, real-time presence, and unit location visibility.'
};

export const outcomes: SectionData = {
	...empty,
	key: 'sg_outcomes',
	type: 'icon_grid',
	items: [
		item(
			1,
			'Unified PTT Communication',
			'Connect teams through PTT channels for voice and video communication—one press, no dialing.',
			{ iconKey: 'radio-handheld' }
		),
		item(
			2,
			'Unit status at a glance',
			'See which units are online and where they were last reported.',
			{ iconKey: 'target' }
		),
		item(3, 'Centralized Control', 'Manage users, channels, access, and devices from one place.', {
			iconKey: 'network'
		}),
		item(
			4,
			'Visual Operations',
			'Manage live video, recordings, and body camera unit locations from one centralized platform.',
			{ iconKey: 'camera' }
		)
	]
};

export const models: SectionData = {
	...empty,
	key: 'sg_models',
	type: 'icon_grid',
	heading: 'Choose the Operational Model',
	body: 'Managed SaaS for a platform operated by AM². On-premise for infrastructure managed by your organization.',
	items: [
		item(
			1,
			'Managed SaaS',
			'AM² operates the platform infrastructure and provides software updates under the service agreement.',
			{
				iconKey: 'cloud',
				link: { href: '/services/saas', label: 'Request a SaaS proposal' }
			}
		),
		item(
			2,
			'On-Premise',
			'Run the platform within your own infrastructure. Your team manages servers, network, backup, and monitoring.',
			{
				iconKey: 'server',
				link: { href: '/services/on-premise', label: 'Discuss your architecture' }
			}
		)
	]
};

export const platforms: SectionData = {
	...empty,
	key: 'sg_platforms',
	type: 'card_grid',
	heading: 'One Administration\nTwo Platforms for Field Operations',
	highlight: 'Two Platforms for Field Operations',
	items: [
		item(
			1,
			'AM² PTT',
			'Connect push-to-talk channels, private communication, latest unit locations, optional video, presence, and access management.',
			{
				link: { href: '/platforms/am2-ptt', label: 'Explore AM² PTT' }
			}
		),
		item(
			2,
			'AM² Command Center',
			'Bring body cameras and visual workflows into one command environment for supervisors and administrators.',
			{
				link: { href: '/platforms/am2-command-center', label: 'Explore AM² Command Center' }
			}
		)
	]
};

export const industries: SectionData = {
	...empty,
	key: 'sg_industries',
	type: 'card_grid',
	heading: 'For organizations that operate beyond the desk',
	highlight: 'beyond the desk',
	body: 'AM² can be configured for a range of field teams and operational environments—not tied to a single industry.',
	items: [
		item(
			1,
			'Logistics & Transportation',
			'Coordinate drivers, dispatchers, hubs, and supervisors through channels and the latest available unit locations.'
		),
		item(
			2,
			'Mining & Energy',
			'Connect teams across sites and work areas using the appropriate IP connectivity'
		),
		item(
			3,
			'Construction',
			'Coordinate supervisors, operators, security, and project teams across multiple work zones'
		),
		item(
			4,
			'Manufacturing & Warehousing',
			'Create dedicated channels for production, warehouse, maintenance, and operational response'
		)
	]
};

export const security: SectionData = {
	...empty,
	key: 'sg_security',
	type: 'carousel',
	heading: 'Security Through Practical Controls',
	body: 'AM² applies controls across connections, device sessions, administration, and software releases.',
	items: [
		item(
			1,
			'TLS-Protected Connections',
			'HTTPS/WSS and TLS protect external connections in transit'
		),
		item(
			2,
			'Revocable Device Sessions',
			'Revoke sessions and force logout when access needs to be withdrawn'
		),
		item(
			3,
			'Centralized Administration',
			'Manage users, channels, memberships, and permissions through WebAdmin'
		),
		item(4, 'Signed Releases', 'Example fourth card to show the carousel arrows')
	]
};

export const splitList: SectionData = {
	...empty,
	key: 'sg_split_list',
	type: 'split_list',
	heading: 'Communication for Field Operations',
	highlight: 'Field Operations',
	items: [
		item(
			1,
			'PTT Channels & Private Communication',
			'Reach teams through channel-based voice communication and communicate directly with individuals when needed'
		),
		item(
			2,
			'Presence & Latest Location',
			'View online status, active speaker presence, and the latest available unit location'
		),
		item(
			3,
			'Optional Video',
			'Add visual context where supported by the selected device and platform'
		)
	]
};

export const whyAm2: SectionData = {
	...empty,
	key: 'sg_why',
	type: 'split_media',
	heading: 'Why AM²?',
	highlight: 'AM²?',
	body: 'Field communication is not about adding more technology, it is about having the right tools for the way people work.\n\nWe start by understanding the operation first, so technology supports the way teams work.',
	cta: { href: '/solutions/why-am2', label: 'See How AM² Fits Your Operation' }
};

export const steps: SectionData = {
	...empty,
	key: 'sg_steps',
	type: 'process_steps',
	heading: 'How We Work?',
	items: [
		item(
			1,
			null,
			'Assess your operations and define the right solution across teams, locations, networks, workflows, devices, platforms, access, and deployment.'
		),
		item(
			2,
			null,
			'Configure and deploy the platform, users, channels, permissions, and devices, then onboard administrators, supervisors, and field teams.'
		),
		item(
			3,
			null,
			'Ensure lifecycle continuity through managed software updates and ongoing service support.'
		)
	]
};

export const faq: SectionData = {
	...empty,
	key: 'sg_faq',
	type: 'accordion',
	eyebrow: 'FAQ',
	heading: 'Questions about AM²',
	highlight: 'AM²',
	items: [
		item(
			1,
			'What is Push-to-Talk over Cellular (PoC)?',
			'Sample answer: PoC delivers walkie-talkie style communication over 4G/5G and Wi-Fi networks.'
		),
		item(
			2,
			'What is the difference between Managed SaaS and On-Premise?',
			'Sample answer shown here until the real answer is filled in Directus.'
		),
		item(3, 'How can I evaluate AM²?', null)
	]
};

export const cta: SectionData = {
	...empty,
	key: 'sg_cta',
	type: 'cta',
	heading: 'Ready to configure your operation?',
	body: 'Discuss your communication needs, device requirements, and deployment model with the AM² team.',
	cta: { href: '/contact-sales', label: 'Get in Touch' }
};

export const productSection: SectionData = { ...empty, key: 'sg_products', type: 'product_list' };

export const products: ProductData[] = [
	{
		id: 1,
		name: 'HT PoC Voice + Maps',
		description:
			'Push-to-Talk over Cellular (PoC) devices for channel-based and private voice communication.',
		image: null,
		platformHref: '/platforms/am2-ptt'
	},
	{
		id: 2,
		name: 'HT PoC Voice & Video + Maps',
		description: 'PoC devices that add live video to voice and location capabilities.',
		image: null,
		platformHref: '/platforms/am2-ptt'
	}
];

export const matrix: SectionData = {
	...empty,
	key: 'sg_matrix',
	type: 'responsibility_matrix',
	heading: 'Clear Responsibilities. One Operating Model.',
	highlight: 'One Operating Model.'
};

export const matrixRows: ResponsibilityRowData[] = [
	{ id: 1, label: 'Platform Infrastructure', owner: 'am2' },
	{ id: 2, label: 'Software Updates', owner: 'am2' },
	{ id: 3, label: 'Users', owner: 'customer' },
	{ id: 4, label: 'Devices', owner: 'customer' }
];
