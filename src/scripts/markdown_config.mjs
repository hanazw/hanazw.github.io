import katex from 'katex';

function render_math(node, ctx, displayMode) {
  ctx.replaceNode(node, {
    type: 'html',
    value: katex.renderToString(node.value, {
      displayMode,
      throwOnError: true,
      strict: 'ignore',
      trust: false,
      output: 'htmlAndMathml',
    }),
  });
}

// Shared Markdown parsing and math rendering for the website.
export const markdown_options = {
  features: { math: true },
  mdastPlugins: [{
    name: 'hana-math',
    inlineMath(node, ctx) { render_math(node, ctx, false); },
    math(node, ctx) { render_math(node, ctx, true); },
  }],
};
