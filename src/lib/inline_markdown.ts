import { createSatteriMarkdownProcessor } from '@astrojs/markdown-satteri';

// About keeps one paragraph per string; reuse the site's parser for inline formatting.
const processor = createSatteriMarkdownProcessor({
  syntaxHighlight: false,
  smartypants: false,
  features: { frontmatter: false },
  hastPlugins: [{
    name: 'inline-paragraph',
    before(root, ctx) {
      const paragraph = root.children[0];
      if (root.children.length !== 1 || paragraph?.type !== 'element' || paragraph.tagName !== 'p') {
        throw new Error('About text must be a single Markdown paragraph. Add a separate array entry for another paragraph.');
      }
      ctx.replaceNode(root, { type: 'root', children: paragraph.children });
    },
    raw(node) { return { type: 'text', value: node.value }; },
  }],
});

export async function render_inline_markdown(text: string): Promise<string> {
  return (await (await processor).render(text)).code;
}
