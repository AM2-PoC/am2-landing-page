export interface NavItem {
	id: number;
	label: string;
	path: string | null;
	children: NavItem[];
}

export interface Navigation {
	header: NavItem[];
	footer: NavItem[];
}
