export interface NavigationLink {
	icon: string;
	label: string;
	to: string;
	disabled: boolean;
}

export interface NavigationTree extends NavigationLink {
	children: NavigationTree[];
}

export interface NavigationGroup {
	type?: 'link' | 'accordion';
	defaultOpen?: boolean;
	children: NavigationTree[];
}
