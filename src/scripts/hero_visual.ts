import vertexSource from "../shaders/hero_visual.vert.glsl?raw";
import fragmentSource from "../shaders/hero_visual.frag.glsl?raw";
import {heroVisualConfig, heroVisualPalettes, type HeroVisualConfig} from "./hero_visual_config";

type RegisterCleanup = (cleanup: () => void) => void;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);

    if (shader === null) {
        throw new Error("Could not create shader.");
    }

    try {
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader) ?? "Shader compilation failed.");
        }
        return shader;
    } catch (error) {
        gl.deleteShader(shader);
        throw error;
    }
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
    const program = gl.createProgram();

    if (program === null) {
        throw new Error("Could not create shader program.");
    }

    const shaders: WebGLShader[] = [];
    let linked = false;
    try {
        const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
        shaders.push(vertexShader);
        gl.attachShader(program, vertexShader);

        const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
        shaders.push(fragmentShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(program) ?? "Shader program linking failed.");
        }
        linked = true;
        return program;
    } finally {
        // 链接后 program 已保留可执行代码；独立 shader 对象可以释放。
        for (const shader of shaders) {
            gl.detachShader(program, shader);
            gl.deleteShader(shader);
        }
        if (!linked) {
            gl.deleteProgram(program);
        }
    }
}

function getUniformLocations(gl: WebGL2RenderingContext, program: WebGLProgram) {
    const required = (name: string): WebGLUniformLocation => {
        const location = gl.getUniformLocation(program, name);
        if (location === null) {
            throw new Error(`Could not find uniform: ${name}`);
        }
        return location;
    };

    return {
        frame: {
            time: required("uTime"),
            aspect: required("uAspect"),
            renderScale: required("uRenderScale"),
            parallax: required("uParallax"),
        },
        config: {
            gradient: {
                colors: required("uGradientColors[0]"),
                centers: required("uGradientCenters[0]"),
                frequencies: required("uGradientFrequencies[0]"),
                speed: required("uGradientSpeed"),
                radius: required("uGradientRadius"),
                falloff: required("uGradientFalloff"),
            },
            noise: {
                scale: required("uNoiseScale"),
                speed: required("uNoiseSpeed"),
                layers: required("uNoiseLayers"),
                amplitude: required("uNoiseAmplitude"),
                frequencyMultiplier: required("uNoiseFrequencyMultiplier"),
                persistence: required("uNoisePersistence"),
            },
            contours: {
                levels: required("uContourLevels"),
                thickness: required("uContourThickness"),
                majorEvery: required("uContourMajorEvery"),
                majorWidthScale: required("uContourMajorWidthScale"),
                minorIntensity: required("uContourMinorIntensity"),
                color: required("uContourColor"),
                opacity: required("uContourOpacity"),
            },
        },
    };
}

// 初始化和主题变化时上传配置；逐帧变化的数据由 drawFrame 上传。
function applyConfig(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    uniforms: ReturnType<typeof getUniformLocations>,
    config: HeroVisualConfig,
) {
    gl.useProgram(program);
    const {gradient, noise, contours} = config;
    const locations = uniforms.config;

    gl.uniform3fv(locations.gradient.colors, gradient.colors.flat());
    gl.uniform2fv(locations.gradient.centers, gradient.centers.flat());
    gl.uniform2fv(locations.gradient.frequencies, gradient.frequencies.flat());
    gl.uniform1f(locations.gradient.speed, gradient.speed);
    gl.uniform1f(locations.gradient.radius, gradient.radius);
    gl.uniform1f(locations.gradient.falloff, gradient.falloff);

    gl.uniform1f(locations.noise.scale, noise.scale);
    gl.uniform1f(locations.noise.speed, noise.speed);
    gl.uniform1i(locations.noise.layers, noise.layers);
    gl.uniform1f(locations.noise.amplitude, noise.amplitude);
    gl.uniform1f(locations.noise.frequencyMultiplier, noise.frequencyMultiplier);
    gl.uniform1f(locations.noise.persistence, noise.persistence);

    gl.uniform1f(locations.contours.levels, contours.levels);
    gl.uniform1f(locations.contours.thickness, contours.thickness);
    gl.uniform1f(locations.contours.majorEvery, contours.majorEvery);
    gl.uniform1f(locations.contours.majorWidthScale, contours.majorWidthScale);
    gl.uniform1f(locations.contours.minorIntensity, contours.minorIntensity);
    gl.uniform3fv(locations.contours.color, contours.color);
    gl.uniform1f(locations.contours.opacity, contours.opacity);
}

function setupTheme(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    uniforms: ReturnType<typeof getUniformLocations>,
    registerCleanup: RegisterCleanup,
) {
    const root = document.documentElement;

    const updateTheme = () => {
        const theme = root.dataset.theme === "dark" ? "dark" : "light";
        const palette = heroVisualPalettes[theme];

        heroVisualConfig.gradient.colors = palette.gradientColors;
        heroVisualConfig.contours.color = palette.contourColor;
        heroVisualConfig.contours.opacity = palette.contourOpacity;
        applyConfig(gl, program, uniforms, heroVisualConfig);
    };
    
    updateTheme();

    const themeObserver = new MutationObserver(updateTheme);
    registerCleanup(() => themeObserver.disconnect());
    themeObserver.observe(root, {attributes: true, attributeFilter: ["data-theme"]});
}

function setupCanvasResize(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, registerCleanup: RegisterCleanup) {
    let needsResize = true;
    let previousDpr = 0;
    const size = {aspect: 1.0, renderScale: 1.0};

    const resizeObserver = new ResizeObserver(() => {
        needsResize = true;
    });

    registerCleanup(() => resizeObserver.disconnect());
    resizeObserver.observe(canvas);

    const resizeCanvas = (dpr: number) => {
        const rect = canvas.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
            return;
        }

        const {maxDpr, maxPixels} = heroVisualConfig.rendering;
        const scale = Math.min(dpr, maxDpr, Math.sqrt(maxPixels / (rect.width * rect.height)));
        // 向下取整以守住像素预算；宽高至少为 1。
        const width = Math.max(1, Math.min(maxPixels, Math.floor(rect.width * scale)));
        const height = Math.max(1, Math.min(Math.floor(maxPixels / width), Math.floor(rect.height * scale)));

        if (canvas.width !== width) {
            canvas.width = width;
        }

        if (canvas.height !== height) {
            canvas.height = height;
        }

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight,);

        size.aspect = rect.width / rect.height;
        // 使用实际缓冲区与 CSS 高度的比值，包含预算限制和整数取整的影响。
        size.renderScale = gl.drawingBufferHeight / rect.height;
    };

    return () => {
        const dpr = window.devicePixelRatio || 1;
        if (needsResize || dpr !== previousDpr) {
            resizeCanvas(dpr);
            needsResize = false;
            previousDpr = dpr;
        }
        return size;
    };
}

function setupParallax(interactionTarget: HTMLElement, registerCleanup: RegisterCleanup) {
    const parallaxStrength = heroVisualConfig.parallax.strength;
    const followSpeed = heroVisualConfig.parallax.followSpeed;

    const targetOffset = {x: 0, y: 0};
    const currentOffset = {x: 0, y: 0};

    const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") {
            return;
        }

        const rect = interactionTarget.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
            return;
        }

        const x = (event.clientX - rect.left) / rect.width;
        const y = 1.0 - (event.clientY - rect.top) / rect.height;

        targetOffset.x = (x - 0.5) * parallaxStrength;
        targetOffset.y = (y - 0.5) * parallaxStrength;
    };

    const resetParallax = () => {
        targetOffset.x = 0;
        targetOffset.y = 0;
    };

    registerCleanup(() => {
        interactionTarget.removeEventListener("pointermove", onPointerMove);
        interactionTarget.removeEventListener("pointerleave", resetParallax);
        interactionTarget.removeEventListener("pointercancel", resetParallax);
        window.removeEventListener("blur", resetParallax);
    });
    interactionTarget.addEventListener("pointermove", onPointerMove);
    interactionTarget.addEventListener("pointerleave", resetParallax);
    interactionTarget.addEventListener("pointercancel", resetParallax);
    window.addEventListener("blur", resetParallax);

    return (deltaSeconds: number) => {
        const blend = 1.0 - Math.exp(-followSpeed * deltaSeconds);
        currentOffset.x += (targetOffset.x - currentOffset.x) * blend;
        currentOffset.y += (targetOffset.y - currentOffset.y) * blend;
        return currentOffset;
    };
}

function drawFrame(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    uniforms: ReturnType<typeof getUniformLocations>,
    elapsedSeconds: number,
    size: { aspect: number; renderScale: number },
    offset: { x: number; y: number },
) {
    gl.useProgram(program);
    gl.uniform1f(uniforms.frame.time, elapsedSeconds);
    gl.uniform1f(uniforms.frame.aspect, size.aspect);
    gl.uniform1f(uniforms.frame.renderScale, size.renderScale);
    gl.uniform2f(uniforms.frame.parallax, offset.x, offset.y);

    gl.clearColor(...heroVisualConfig.rendering.clearColor);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function createRenderLoop(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    uniforms: ReturnType<typeof getUniformLocations>,
    updateSize: ReturnType<typeof setupCanvasResize>,
    updateParallax: ReturnType<typeof setupParallax>,
) {
    let frameId: number | undefined;
    let disposed = false;
    let elapsedSeconds = 0;
    let previousTime: number | undefined;

    const render = (timestamp: number) => {
        if (disposed) {
            return;
        }
        const deltaSeconds =
            previousTime === undefined ? 0 : Math.min((timestamp - previousTime) / 1000, heroVisualConfig.rendering.maxDeltaSeconds);

        previousTime = timestamp;
        elapsedSeconds += deltaSeconds;

        const size = updateSize();
        const offset = updateParallax(deltaSeconds);
        drawFrame(gl, program, uniforms, elapsedSeconds, size, offset);

        frameId = requestAnimationFrame(render);
    };

    const stop = () => {
        if (frameId !== undefined) {
            cancelAnimationFrame(frameId);
            frameId = undefined;
        }
        // 保留累计时间和视差；恢复首帧的 delta 为 0，不计入暂停时长。
        previousTime = undefined;
    };

    return {
        start() {
            // 已有下一帧时不重复预约，始终只保留一条循环。
            if (disposed || frameId !== undefined) {
                return;
            }
            frameId = requestAnimationFrame(render);
        },
        stop,
        dispose() {
            disposed = true;
            stop();
        },
    };
}

function setupVisibility(
    canvas: HTMLCanvasElement,
    loop: ReturnType<typeof createRenderLoop>,
    registerCleanup: RegisterCleanup,
) {
    // 等待首次相交结果，避免初始化时在视口外启动。
    let isInViewport = false;

    const updateVisibility = () => {
        if (isInViewport && !document.hidden) {
            loop.start();
        } else {
            loop.stop();
        }
    };

    const intersectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            isInViewport = entry.isIntersecting;
        }
        updateVisibility();
    });

    registerCleanup(() => {
        intersectionObserver.disconnect();
        document.removeEventListener("visibilitychange", updateVisibility);
    });
    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", updateVisibility);
}

export function initVisual(canvas: HTMLCanvasElement, interactionTarget: HTMLElement = canvas) {
    const cleanups: Array<() => void> = [];
    const registerCleanup: RegisterCleanup = (cleanup) => cleanups.push(cleanup);
    let disposed = false;

    const dispose = () => {
        if (disposed) {
            return;
        }
        disposed = true;
        // 按创建的逆序清理；某项失败也继续释放其他资源。
        for (const cleanup of cleanups.reverse()) {
            try {
                cleanup();
            } catch (error) {
                console.warn("Hero visual cleanup failed:", error);
            }
        }
        cleanups.length = 0;
        // 隐藏浏览器可能显示的 context 丢失占位图，露出容器的 CSS 底色。
        canvas.dataset.unavailable = "true";
        canvas.width = 1;
        canvas.height = 1;
    };

    const onContextLost = () => {
        // 不请求自动恢复；此实例永久停止，转为 CSS 背景。
        dispose();
    };
    registerCleanup(() => canvas.removeEventListener("webglcontextlost", onContextLost));
    canvas.addEventListener("webglcontextlost", onContextLost);

    try {
        const gl = canvas.getContext("webgl2");
        if (gl === null) {
            throw new Error("WebGL2 is not supported.");
        }

        const program = createProgram(gl);
        registerCleanup(() => {
            // context 丢失时 GPU 资源已失效，无需再发送释放命令。
            if (!gl.isContextLost()) {
                gl.useProgram(null);
                gl.deleteProgram(program);
            }
        });
        const uniforms = getUniformLocations(gl, program);
        setupTheme(gl, program, uniforms, registerCleanup);
        const updateSize = setupCanvasResize(canvas, gl, registerCleanup);
        const updateParallax = setupParallax(interactionTarget, registerCleanup);

        const loop = createRenderLoop(gl, program, uniforms, updateSize, updateParallax);
        registerCleanup(loop.dispose);
        setupVisibility(canvas, loop, registerCleanup);
    } catch (error) {
        dispose();
        console.warn("Hero visual unavailable; using CSS background:", error);
    }

    return dispose;
}
