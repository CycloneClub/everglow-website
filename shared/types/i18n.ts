export type Langs = 'zh-cn' | 'zh-hk' | 'en-us';
export type NewsContentKey = 'news' | 'news_en' | 'news_hk';
export type DocsContentKey = 'docs' | 'docs_en' | 'docs_hk';

export type I18nLocale = {
	nuxtSiteConfig: {
		name: string;
		description: string;
	};
	meta: {
		team: string;
	};
	head: {
		fulltitle: string;
		fulltitle2: string;
		title: string;
		subtitles: {
			news: string;
			wiki: string;
			docs: string;
			playground: string;
			about: string;
		};
	};
	body: {
		header: {
			name: string;
			home: string;
			news: string;
			wiki: string;
			docs: string;
			playground: string;
			about: string;
			settings: {
				languages: {
					'zh-cn': string;
					'en-us': string;
					'zh-hk': string;
				};
			};
		};
	};
	common: {
		toc: {
			title: string;
		};
	};
	news: {
		'chevron-text': string;
	};
	docs: {
		label: {
			'Getting Started': string;
			'Guide': string;
			'Netcode': string;
			'Mechanics': string;
			'Drawcode': string;
			'Templates': string;
			'Weapons': string;
		};
		empty: {
			title: string;
			description: string;
		};
	};
};
