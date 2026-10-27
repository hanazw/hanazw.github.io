import { z } from 'astro/zod';
import { tag_ids } from '../i18n/tags.ts';
import { languages } from '../i18n/config.ts';

const text = z.string().trim().min(1);
const calendar_date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, 'Use a valid calendar date, YYYY-MM-DD');

const common_fields = {
  title: text,
  description: text.refine(value => !/<\/?[a-z][^>]*>/i.test(value), 'Use plain text'),
  lang: z.enum(languages),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  translation_key: z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/).optional(),
  tags: z.array(z.enum(tag_ids)).refine(value => new Set(value).size === value.length, 'Duplicate tag').default([]),
  draft: z.boolean().default(false),
  cover: text.refine(value => /^https:\/\//.test(value) || /^\/images\//.test(value), 'Use an HTTPS image URL or /images/ path').optional(),
};

export const blog_schema = z.object({
  ...common_fields,
  published_date: calendar_date,
  updated_date: calendar_date.optional(),
}).strict().refine(value => !value.updated_date || value.updated_date >= value.published_date, 'updated_date precedes published_date');

export const projects_schema = z.object(common_fields).strict();
