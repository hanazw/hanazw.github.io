import { getCollection, type CollectionEntry } from 'astro:content';
import { default_language, languages, type ContentLanguage } from '../i18n/config';

export type ContentCollection = 'blog' | 'projects';
export type ContentEntry = CollectionEntry<ContentCollection>;
export const featured_projects = ['hmxs-renderer/en', 'assassin/en', 'world-piece/en', 'procedural-terrain/en'];
export const featured_writings = ['csharp-reflection/en', 'games101-notes/zh'];
export const project_order = [
  'hmxs-renderer', 
  'assassin', 
  'world-piece', 
  'procedural-terrain',
  'lan-chinese-chess', 
  'just-suck', 
  'balance-or-die', 
  'the-nuo-lion',
  'blitz-boy', 
  'tiny-renderer', 
  'blind-trust', 
  'blow-up-the-balloon',
  'scp', 
  'revive', 
  'escape-from-virus', 
  'cyberpsychosis',
];

export function validate_entries(entries: ContentEntry[]): void {
  const urls = new Map<string, string>();
  const translations = new Map<string, string>();
  for (const entry of entries) {
    const file = entry.filePath ?? `${entry.collection}/${entry.id}`;
    if (entry.id.split('/').at(-1) !== entry.data.lang) {
      throw new Error(`Content language does not match filename: ${file}`);
    }
    const url = get_content_url(entry);
    if (urls.has(url)) throw new Error(`Duplicate content URL ${url}: ${urls.get(url)} and ${file}`);
    urls.set(url, file);
    if (entry.data.translation_key) {
      const key = `${entry.collection}/${entry.data.translation_key}/${entry.data.lang}`;
      if (translations.has(key)) throw new Error(`Duplicate translation ${key}: ${translations.get(key)} and ${file}`);
      translations.set(key, file);
    }
  }
}

export async function get_published_entries<C extends ContentCollection>(collection: C): Promise<CollectionEntry<C>[]> {
  const entries = await getCollection(collection);
  validate_entries(entries);
  return entries.filter(entry => !entry.data.draft);
}

export function get_content_url(entry: ContentEntry): string {
  return `/${entry.data.lang}/${entry.collection}/${entry.data.slug}/`;
}

export function get_translation<T extends ContentEntry>(entry: T, entries: T[], lang: ContentLanguage): T | undefined {
  if (entry.data.draft || !entry.data.translation_key) return undefined;
  return entries.find(candidate => !candidate.data.draft && candidate.collection === entry.collection
    && candidate.data.translation_key === entry.data.translation_key && candidate.data.lang === lang);
}

export function get_translations<T extends ContentEntry>(entry: T, entries: T[]): T[] {
  if (entry.data.draft || !entry.data.translation_key) return [];
  return entries.filter(candidate => !candidate.data.draft && candidate.collection === entry.collection
    && candidate.data.translation_key === entry.data.translation_key && candidate.data.lang !== entry.data.lang);
}

export function get_localized_entries<T extends ContentEntry>(entries: T[], lang: ContentLanguage): T[] {
  const groups = new Map<string, T>();
  const preference = [...new Set([lang, default_language, ...languages])];
  const priority = (entry: T) => preference.indexOf(entry.data.lang);
  for (const entry of entries) {
    if (entry.data.draft) continue;
    const key = `${entry.collection}/${entry.data.translation_key ? `translation:${entry.data.translation_key}` : `entry:${entry.id}`}`;
    const existing = groups.get(key);
    if (!existing || priority(entry) < priority(existing)) groups.set(key, entry);
  }
  return [...groups.values()];
}

export function get_featured_entries<T extends ContentEntry>(entries: T[], ids: string[], lang: ContentLanguage): T[] {
  return ids.flatMap(id => {
    const entry = entries.find(candidate => candidate.id === id && !candidate.data.draft);
    return entry ? [get_translation(entry, entries, lang) ?? entry] : [];
  });
}
