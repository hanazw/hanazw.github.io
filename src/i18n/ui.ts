import type { ContentLanguage } from './config';

type Dictionary = {
  nav_label: string; about: string; projects: string; blog: string; theme: string;
  read_project: string; all_projects: string; all_writing: string;
  back_blog: string; back_projects: string; published: string; updated: string;
  language: string; current_language: string; page_available: string; translation_available: string; translation_missing: string;
  browse_language: string; versions_available: string; theme_light: string; theme_dark: string;
  toc: string; section_link: string; copy: string; copied: string; copy_failed: string;
  open_image: string; close_image: string;
  projects_intro: string; blog_intro: string; empty: string;
  contact: { personal_email: string; school_email: string };
  home: { title: string; eyebrow: string; intro: string; description: string; view_projects: string;
    about_me: string; selected: string; writing: string };
  about_page: { title: string; intro: string; development_title: string; development: string[];
    interests_title: string; interests: string[]; site_title: string; site: string[] };
};

export const ui = {
  en: {
    nav_label: 'Main navigation', about: 'About', projects: 'Projects', blog: 'Blog', theme: 'Switch theme',
    read_project: 'Read project', all_projects: 'All projects', all_writing: 'All writing',
    back_blog: 'All writing', back_projects: 'All projects', published: 'Published', updated: 'Updated',
    language: 'Choose language', current_language: 'Current language', page_available: 'Open in this language', translation_available: 'Translation available',
    translation_missing: 'No translation', browse_language: '{section} →', versions_available: '{available}/{total} languages available',
    theme_light: 'Switch to light theme', theme_dark: 'Switch to dark theme',
    toc: 'On this page', section_link: 'Link to this section', copy: 'Copy', copied: 'Copied', copy_failed: 'Could not copy',
    open_image: 'Enlarge image', close_image: 'Close image',
    projects_intro: 'Rendering experiments, collaborative games, and procedural worlds.',
    blog_intro: 'Notes on graphics, programming, and game development.', empty: 'Nothing published yet.',
    contact: { personal_email: 'Personal email', school_email: 'School email' },
    home: {
      title: 'Zehua Wu — hana', eyebrow: 'Game development · Rendering',
      intro: 'Game developer   |   MSCS @ New York University',
      description: 'Focusing on game development and rendering.\nHere, I share my projects, study notes, and the technical ideas behind them. I hope you find something useful.',
      view_projects: 'View projects', about_me: 'About me', selected: 'Selected projects',
      writing: 'Writing & notes',
    },
    about_page: {
      title: 'About', intro: 'Hi, I\'m Zehua Wu. I also go by hana. I\'m currently studying for a master\'s in Computer Science at NYU Courant, with a focus on game development and rendering.',
      development_title: 'Development & learning',
      development: [
        'I\'ve worked on course projects and game jam entries, mainly as a programmer. I\'ve used Unity, Unreal, and Godot, and I try different languages and tools depending on the project.',
        'I also study how images are rendered, through projects such as software renderers and procedural terrain generation. Sometimes I follow a course; other times, I build something small to work through a question. My projects and notes document that process.',
      ],
      interests_title: 'Beyond development',
      interests: [
        'I enjoy anime and games. Some favorites are 13 Sentinels: Aegis Rim, The Legend of Zelda series, Outer Wilder and CLANNAD. I play a mix of genres and like trying different things. ~~Lately, I\'ve been hooked on Overwatch.~~',
        'I also enjoy rock, J-pop, and anime music, and collect handheld consoles, physical games, and art books. Away from the computer, I like football and badminton.',
        'I like organizing things and tinkering with productivity tools and desktop customization. Blogging is part of that habit: collecting scattered ideas and problems into something I can return to later.',
      ],
      site_title: 'This site',
      site: [
        'This is where I keep my projects and notes on graphics, programming, and game development. Some posts are detailed write-ups; others document a single problem. I\'ll keep adding to them as I learn.',
        'Feel free to call me Zehua or hana, and say hello—whether it\'s about tech, games, or an anime recommendation.',
      ],
    },
  },
  zh: {
    nav_label: '主导航', about: '关于', projects: '项目', blog: '博客', theme: '切换主题',
    read_project: '阅读项目介绍', all_projects: '全部项目', all_writing: '全部文章',
    back_blog: '全部文章', back_projects: '全部项目', published: '发布于', updated: '更新于',
    language: '选择语言', current_language: '当前语言', page_available: '切换到此语言', translation_available: '已有译文',
    translation_missing: '暂无译文', browse_language: '{section} →', versions_available: '提供 {available}/{total} 种语言版本',
    theme_light: '切换到亮色', theme_dark: '切换到暗色',
    toc: '目录', section_link: '本节链接', copy: '复制', copied: '已复制', copy_failed: '复制失败',
    open_image: '放大图片', close_image: '关闭图片',
    projects_intro: '渲染、游戏与程序化世界。',
    blog_intro: '记录图形学、编程与游戏开发中的学习和思考。', empty: '暂无已发布内容。',
    contact: { personal_email: '个人邮箱', school_email: '学校邮箱' },
    home: {
      title: 'Zehua Wu — hana', eyebrow: '游戏开发 · 图形渲染',
      intro: '游戏开发者   |   MSCS @ New York University',
      description: '聚焦于游戏开发与渲染技术。\n在这里，我会分享一些我的项目、学习笔记和开发过程中的技术思考，希望对你有所帮助。',
      view_projects: '查看项目', about_me: '关于我', selected: '精选项目',
      writing: '文章与笔记',
    },
    about_page: {
      title: '关于我', intro: '你好，我是 Zehua Wu，平时也叫 hana。目前在纽约大学 Courant 读计算机科学硕士，主要关注游戏开发和图形渲染。',
      development_title: '开发与学习',
      development: [
        '我参与过一些课程项目和 Game Jam，在团队里主要负责程序开发。用过 Unity、Unreal 和 Godot，也会根据项目尝试不同的语言和工具。',
        '除了制作游戏，我也在学习画面背后的原理，做过软件渲染器、程序化地形等项目。有时候是跟着课程整理知识，有时候是遇到了一个问题，想自己写点东西弄明白。这里的项目和笔记，也记录了这个过程。',
      ],
      interests_title: '屏幕之外',
      interests: [
        '我喜欢看动漫、玩游戏。最喜欢的游戏作品是《十三机兵防卫圈》、《塞尔达传说：旷野之息》和《星际拓荒》，最喜欢的动漫是《CLANNAD》。游戏类型玩得比较杂，什么都愿意试一点。~~最近沉迷《守望先锋》。~~',
        '也喜欢听摇滚、J-pop 和 Ani Song，收藏一些周边、游戏盘和设定集。电脑之外，我还喜欢足球和羽毛球。',
        '另外，我喜欢整理东西，也喜欢折腾效率工具。写博客算是这种习惯的延伸：把零散的知识和遇到的问题整理下来，之后也方便自己查。',
      ],
      site_title: '这个网站',
      site: [
        '这里放着我做过的项目，以及图形学、编程和游戏开发方面的学习笔记。有些文章比较完整，有些只是某个问题的记录，我会随着学习继续补充。',
        '你可以叫我 Zehua，也可以叫我 hana。欢迎聊技术、聊游戏，或者推荐好看的番。',
      ],
    },
  },
} satisfies Record<ContentLanguage, Dictionary>;
