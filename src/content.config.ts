import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blog_schema, projects_schema } from './content/schema';

// A translated pair shares a public slug, but must have distinct internal IDs.
const generate_id = ({ entry }: { entry: string }) => entry.replaceAll('\\', '/').replace(/\.md$/, '');

export const collections = {
  blog: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/blog', generateId: generate_id }),
    schema: blog_schema,
  }),
  projects: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projects', generateId: generate_id }),
    schema: projects_schema,
  }),
};
