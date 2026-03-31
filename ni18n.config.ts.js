// ni18n configuration
const supportedLngs = ['da', 'de', 'el', 'en', 'es', 'fr', 'hu', 'it', 'ja', 'pl', 'pt', 'ru', 'sv', 'tr', 'zh', 'ae'];

export const ni18nConfig = {
    fallbackLng: ['es'],
    supportedLngs,
    ns: ['translation'],
    react: { useSuspense: false },
    backend: {
        loadPath: '/locales/{{lng}}.json',
    },
};
