import type { ContentLanguage } from './config';
export type { ContentLanguage } from './config';

export const tag_labels = {
  algorithms: { en: 'Algorithms', zh: '算法' },
  cpp: { en: 'C++', zh: 'C++' },
  csharp: { en: 'C#', zh: 'C#' },
  'design-patterns': { en: 'Design patterns', zh: '设计模式' },
  'game-design': { en: 'Game design', zh: '游戏设计' },
  'game-jam': { en: 'Game Jam', zh: 'Game Jam' },
  graphics: { en: 'Computer graphics', zh: '图形学' },
  'linear-algebra': { en: 'Linear algebra', zh: '线性代数' },
  networking: { en: 'Networking', zh: '网络' },
  'procedural-generation': { en: 'Procedural generation', zh: '程序化生成' },
  unity: { en: 'Unity', zh: 'Unity' },
} as const satisfies Record<string, Record<ContentLanguage, string>>;

export type TagId = keyof typeof tag_labels;
export const tag_ids = Object.keys(tag_labels) as [TagId, ...TagId[]];

export function get_tag_label(tag: TagId, lang: ContentLanguage): string {
  return tag_labels[tag][lang];
}
