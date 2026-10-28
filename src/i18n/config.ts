const locale_config = {
  en: { html: 'en', name: 'English' },
  zh: { html: 'zh-CN', name: '中文' },
} as const;
export type ContentLanguage = keyof typeof locale_config;
export const languages = Object.keys(locale_config) as [ContentLanguage, ...ContentLanguage[]];
export const default_language: ContentLanguage = 'en';
export const html_languages = Object.fromEntries(languages.map(lang => [lang, locale_config[lang].html])) as Record<ContentLanguage, string>;
export const language_names = Object.fromEntries(languages.map(lang => [lang, locale_config[lang].name])) as Record<ContentLanguage, string>;

export function local_path(lang: ContentLanguage, section = ''): string {
  return `/${lang}/${section ? `${section}/` : ''}`;
}

export function format_date(value: string, lang: ContentLanguage): string {
  return new Intl.DateTimeFormat(html_languages[lang], {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}
