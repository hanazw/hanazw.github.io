import type { ContentLanguage } from './config';

type Dictionary = {
  nav_label: string; about: string; projects: string; blog: string; theme: string;
  read_project: string; all_projects: string; all_writing: string;
  back_blog: string; back_projects: string; published: string; updated: string;
  language: string; current_language: string; page_available: string; translation_available: string; translation_missing: string;
  browse_language: string; versions_available: string; theme_light: string; theme_dark: string;
  toc: string; section_link: string; copy: string; copied: string; copy_failed: string;
  open_image: string; close_image: string; image_hint: string; original_size: string;
  projects_intro: string; blog_intro: string; empty: string;
  home: { title: string; eyebrow: string; intro: string; description: string; view_projects: string;
    about_me: string; selected: string; projects_description: string; writing: string; writing_description: string };
  about_page: { title: string; intro: string; description: string; build_title: string; build: string;
    explore: string; writing_title: string; writing: string };
};

export const ui = {
  en: {
    nav_label: 'Main navigation', about: 'About', projects: 'Projects', blog: 'Blog', theme: 'Switch theme',
    read_project: 'Read project', all_projects: 'Browse all projects', all_writing: 'Browse all writing',
    back_blog: 'All writing', back_projects: 'All projects', published: 'Published', updated: 'Updated',
    language: 'Choose language', current_language: 'Current language', page_available: 'Open in this language', translation_available: 'Translation available',
    translation_missing: 'No translation', browse_language: '{section} →', versions_available: '{available}/{total} languages available',
    theme_light: 'Switch to light theme', theme_dark: 'Switch to dark theme',
    toc: 'On this page', section_link: 'Link to this section', copy: 'Copy', copied: 'Copied', copy_failed: 'Could not copy',
    open_image: 'Enlarge image', close_image: 'Close image', image_hint: 'Click the image to toggle original size. Press Esc to close.', original_size: 'Original size',
    projects_intro: 'Rendering experiments, collaborative games, and procedural worlds.',
    blog_intro: 'Notes on graphics, programming, and game development, in English and Chinese.', empty: 'Nothing published yet.',
    home: {
      title: 'hana — Game Developer', eyebrow: 'Game development · Computer graphics',
      intro: 'A game developer working with Unity, C++, and computer graphics.',
      description: 'I’m pursuing a master’s in Computer Science at NYU Courant. Here, I share my projects and write about the technical ideas behind them.',
      view_projects: 'View Projects', about_me: 'About Me', selected: 'Selected Projects',
      projects_description: 'Rendering experiments, collaborative games, and procedural worlds.',
      writing: 'Writing & Notes', writing_description: 'Technical notes in English and Chinese, collected as I learn and build.',
    },
    about_page: {
      title: 'Hi, I’m hana.', intro: 'I’m Zehua Wu, a game developer and an M.S. in Computer Science student at NYU Courant.',
      description: 'My work spans C++ and C#, software rendering, and games built with Unity. I’m interested in computer graphics, interactive media, and how technical systems shape the experience of playing a game.',
      build_title: 'What I build',
      build: 'My projects range from a C++ software renderer to collaborative party games and game jam experiments. On AssAssIn, I worked on UI, enemy AI, tutorials, and gameplay feedback. For World Piece, I was the sole programmer on the Unity project.',
      explore: 'Explore selected projects', writing_title: 'Writing as I learn',
      writing: 'I keep technical notes in English and Chinese on graphics, programming, and game development. You’ll find my earlier projects and writing under the names hmxs and hmxsqaq.',
    },
  },
  zh: {
    nav_label: '主导航', about: '关于', projects: '项目', blog: '博客', theme: '切换主题',
    read_project: '阅读项目介绍', all_projects: '浏览全部项目', all_writing: '浏览全部文章',
    back_blog: '全部文章', back_projects: '全部项目', published: '发布于', updated: '更新于',
    language: '选择语言', current_language: '当前语言', page_available: '切换到此语言', translation_available: '已有译文',
    translation_missing: '暂无译文', browse_language: '{section} →', versions_available: '提供 {available}/{total} 种语言版本',
    theme_light: '切换到亮色主题', theme_dark: '切换到暗色主题',
    toc: '目录', section_link: '本节链接', copy: '复制', copied: '已复制', copy_failed: '复制失败',
    open_image: '放大图片', close_image: '关闭图片', image_hint: '点击图片切换原始尺寸，按 Esc 关闭。', original_size: '原始尺寸',
    projects_intro: '渲染实验、合作游戏与程序化世界。',
    blog_intro: '用中文和英文记录图形学、编程与游戏开发中的学习和思考。', empty: '暂无已发布内容。',
    home: {
      title: 'hana — 游戏开发者', eyebrow: '游戏开发 · 图形学',
      intro: '一名使用 Unity、C++，探索图形学的游戏开发者。',
      description: '目前在纽约大学 Courant 研究所攻读计算机科学硕士。在这里分享我的项目，以及它们背后的技术思考。',
      view_projects: '查看项目', about_me: '关于我', selected: '精选项目',
      projects_description: '渲染实验、合作游戏与程序化世界。',
      writing: '文章与笔记', writing_description: '在学习和开发过程中积累的中英文技术笔记。',
    },
    about_page: {
      title: '你好，我是 hana。', intro: '我是 Zehua Wu，一名游戏开发者，目前在纽约大学 Courant 研究所攻读计算机科学硕士。',
      description: '我的开发工作涉及 C++、C#、软件渲染，以及使用 Unity 制作游戏。我对图形学、交互媒体，以及技术系统如何塑造游戏体验感兴趣。',
      build_title: '我在做什么',
      build: '我的项目包括 C++ 软件渲染器、多人派对游戏，以及 Game Jam 作品。在 AssAssIn 中，我负责 UI、敌人 AI、教程和游戏反馈；在 World Piece 团队中，我是唯一的程序员，使用 Unity 实现游戏。',
      explore: '查看精选项目', writing_title: '边学习，边记录',
      writing: '我用中文和英文记录图形学、编程与游戏开发方面的技术笔记。此前的项目和文章也曾使用 hmxs、hmxsqaq 这两个名字发布。',
    },
  },
} satisfies Record<ContentLanguage, Dictionary>;
