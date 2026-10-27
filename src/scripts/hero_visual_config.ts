type Vec2 = [number, number];
type Color = [number, number, number];
type Four<T> = [T, T, T, T];

interface HeroVisualPalette {
    gradientColors: Four<Color>;
    contourColor: Color;
    contourOpacity: number;
}

// 用常见的 0–255 RGB 编辑颜色，上传前归一化为 GLSL 使用的 0–1。
function rgb(r: number, g: number, b: number): Color {
    return [r / 255, g / 255, b / 255];
}

// 四个色点贴近页面底色（亮色 #fafafa / 暗色 #171717），仅保留细微冷灰变化。
// 等高线灰色参考 Radix Colors，通过较低透明度融入背景。
// https://www.radix-ui.com/colors
// 调色改这里的 light / dark；contourOpacity 为 0–1，越大线条越明显。
export const heroVisualPalettes: Record<"light" | "dark", HeroVisualPalette> = {
    light: {
        gradientColors: [
            rgb(250, 250, 250), // 页面底色：#fafafa
            rgb(244, 246, 248), // 极浅蓝灰：#f4f6f8
            rgb(247, 248, 249), // 冷白：#f7f8f9
            rgb(247, 246, 249), // 极浅紫灰：#f7f6f9
        ],
        contourColor: rgb(96, 100, 108), // Slate 11：#60646c
        contourOpacity: 0.2,
    },
    dark: {
        gradientColors: [
            rgb(23, 23, 23), // 页面底色：#171717
            rgb(25, 27, 29), // 微蓝炭灰：#191b1d
            rgb(24, 26, 27), // 冷炭灰：#181a1b
            rgb(26, 25, 27), // 微紫炭灰：#1a191b
        ],
        contourColor: rgb(176, 180, 186), // Slate 11：#b0b4ba
        contourOpacity: 0.15,
    },
};

export interface HeroVisualConfig {
    gradient: {
        colors: Four<Color>;
        centers: Four<Vec2>;
        frequencies: Four<Vec2>;
        speed: number;
        radius: number;
        falloff: number;
    };
    noise: {
        scale: number;
        speed: number;
        layers: number;
        amplitude: number;
        frequencyMultiplier: number;
        persistence: number;
    };
    contours: {
        levels: number;
        thickness: number;
        majorEvery: number;
        majorWidthScale: number;
        minorIntensity: number;
        color: Color;
        opacity: number;
    };
    parallax: {
        strength: number;
        followSpeed: number;
    };
    rendering: {
        clearColor: [number, number, number, number];
        maxDeltaSeconds: number;
        maxDpr: number;
        maxPixels: number;
    };
}

// 调参后刷新页面确认效果；目前没有运行时配置更新接口。
// 颜色和线条透明度由主题覆盖，改上面的 palette，不改下面的初始引用。
// 背景外扩 / 边缘淡出在 hero_visual.astro；Hero 留白在 index.astro。
export const heroVisualConfig: HeroVisualConfig = {
    gradient: {
        colors: heroVisualPalettes.light.gradientColors,
        centers: [ // 与四色顺序对应；UV 通常取 0–1，左下角为 [0, 0]。
            [0.25, 0.30],
            [0.75, 0.35],
            [0.30, 0.75],
            [0.80, 0.70],
        ],
        frequencies: [ // 各色点 x/y 运动的频率倍率，差异让它们不同步。
            [1.13, 0.97],
            [0.87, 1.23],
            [1.07, 0.83],
            [0.93, 1.17],
        ],
        speed: 0.08, // 色点移动速度；0 为静止，与噪声速度独立。
        radius: 0.15, // 色点移动幅度（UV），不是色块大小；0 为固定位置。
        falloff: 6.0, // 越大颜色越集中、分区越明显；越小混合越均匀，保持适中的非负值。
    },
    noise: {
        scale: 4.0, // 越大地形越碎、画面内起伏越多；越小地形越舒展。取正数。
        speed: 0.02, // 地形演变速度；0 为静止，鼠标视差仍有效。
        layers: 4, // 正整数：每增加一层，每个片元多计算一次噪声。
        amplitude: 0.5, // 第一层高度幅度；增大也会增加跨过的等高线数量。
        frequencyMultiplier: 2.0, // 每层频率倍率（通常 > 1），越大后续细节越细。
        persistence: 0.5, // 每层幅度保留比例（通常 0–1），越大细碎起伏越明显。
    },
    contours: {
        levels: 20.0, // 高度分级密度，越大线越密；不是画面中固定的线条数。取正数。
        thickness: 1.5, // 基础视觉线宽（CSS 像素尺度），已补偿 DPR / 像素预算。
        majorEvery: 5.0, // 每隔多少个高度级别画一条主线；取正整数。
        majorWidthScale: 1.8, // 主线相对基础线宽的倍率。
        minorIntensity: 0.55, // 次线强度（0–1）；主线强度为 1，再统一乘主题透明度。
        color: heroVisualPalettes.light.contourColor,
        opacity: heroVisualPalettes.light.contourOpacity,
    },
    parallax: {
        strength: 0.08, // 视差幅度（UV）；0 关闭视差，单轴最大偏移为该值的一半。
        followSpeed: 2.0, // 越大跟手 / 回正越快，越小越缓慢；取正数。
    },
    rendering: {
        clearColor: [0.0, 0.0, 0.0, 1.0], // 全屏三角形会覆盖整个绘制缓冲区。
        maxDeltaSeconds: 0.05, // 单帧最大推进秒数，避免卡顿后大跳；通常不用改。
        maxDpr: 2.0, // 渲染倍率上限；最终倍率还受设备 DPR 和像素预算限制。
        maxPixels: 1_000_000, // 缓冲区总像素预算；降低可减轻 GPU 负担，但画面会变软。
    },
};
