export const useDocsNav = () => {
	const { locale } = useI18n();
	const data = useAsyncData(
		`docs_navigation_${locale.value}`,
		() => queryCollectionNavigation(docsCollectionKey(locale.value)),
		{
			watch: [locale],
		},
	);
	watch(data.error, (value) => value && showError(value));
	return data;
};
