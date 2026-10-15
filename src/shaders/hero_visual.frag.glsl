#version 300 es

precision highp float;

uniform float uTime;
uniform float uAspect;
uniform float uRenderScale;
uniform vec2 uParallax;

// 外部配置：数值集中在 hero_visual_config.ts。
uniform vec3 uGradientColors[4];
uniform vec2 uGradientCenters[4];
uniform vec2 uGradientFrequencies[4];
uniform float uGradientSpeed;
uniform float uGradientRadius;
uniform float uGradientFalloff;

uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform int uNoiseLayers;
uniform float uNoiseAmplitude;
uniform float uNoiseFrequencyMultiplier;
uniform float uNoisePersistence;

uniform float uContourLevels;
uniform float uContourThickness;
uniform float uContourMajorEvery;
uniform float uContourMajorWidthScale;
uniform float uContourMinorIntensity;
uniform vec3 uContourColor;
uniform float uContourOpacity;

in vec2 vUv;
out vec4 outColor;

// gradient
float centerWeight(vec2 uv, vec2 center, float falloff) {
    vec2 delta = uv - center;
    float distanceSquared = dot(delta, delta);

    return exp(-distanceSquared * falloff);
}

vec3 sampleGradient(vec2 uv, float time) {
    float speed = uGradientSpeed;
    float radius = uGradientRadius;

    float phase = time * speed;

    vec2 center0 = uGradientCenters[0] + vec2(sin(phase * uGradientFrequencies[0].x), cos(phase * uGradientFrequencies[0].y)) * radius;
    vec2 center1 = uGradientCenters[1] + vec2(cos(phase * uGradientFrequencies[1].x), sin(phase * uGradientFrequencies[1].y)) * radius;
    vec2 center2 = uGradientCenters[2] + vec2(sin(phase * uGradientFrequencies[2].x), sin(phase * uGradientFrequencies[2].y)) * radius;
    vec2 center3 = uGradientCenters[3] + vec2(cos(phase * uGradientFrequencies[3].x), cos(phase * uGradientFrequencies[3].y)) * radius;

    vec3 color0 = uGradientColors[0];
    vec3 color1 = uGradientColors[1];
    vec3 color2 = uGradientColors[2];
    vec3 color3 = uGradientColors[3];

    float falloff = uGradientFalloff;

    float w0 = centerWeight(uv, center0, falloff);
    float w1 = centerWeight(uv, center1, falloff);
    float w2 = centerWeight(uv, center2, falloff);
    float w3 = centerWeight(uv, center3, falloff);

    vec3 weightedColor =
    color0 * w0 +
    color1 * w1 +
    color2 * w2 +
    color3 * w3;

    float weightSum = w0 + w1 + w2 + w3;

    return weightedColor / weightSum;
}

// height map
float hash3(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
}

float valueNoise3(vec3 p) {
    vec3 cell = floor(p);
    vec3 local = fract(p);

    vec3 blend = local * local * local * (local * (local * 6.0 - 15.0) + 10.0);

    float c000 = hash3(cell + vec3(0.0, 0.0, 0.0));
    float c100 = hash3(cell + vec3(1.0, 0.0, 0.0));
    float c010 = hash3(cell + vec3(0.0, 1.0, 0.0));
    float c110 = hash3(cell + vec3(1.0, 1.0, 0.0));

    float c001 = hash3(cell + vec3(0.0, 0.0, 1.0));
    float c101 = hash3(cell + vec3(1.0, 0.0, 1.0));
    float c011 = hash3(cell + vec3(0.0, 1.0, 1.0));
    float c111 = hash3(cell + vec3(1.0, 1.0, 1.0));

    float x00 = mix(c000, c100, blend.x);
    float x10 = mix(c010, c110, blend.x);
    float x01 = mix(c001, c101, blend.x);
    float x11 = mix(c011, c111, blend.x);

    float y0 = mix(x00, x10, blend.y);
    float y1 = mix(x01, x11, blend.y);

    return mix(y0, y1, blend.z);
}

float fbm3(vec3 p) {
    float height = 0.0;
    float amplitude = uNoiseAmplitude;

    for (int layer = 0; layer < uNoiseLayers; layer++) {
        height += valueNoise3(p) * amplitude;

        p *= uNoiseFrequencyMultiplier;
        amplitude *= uNoisePersistence;
    }

    return height;
}

float contourMask(float height) {
    float levels = uContourLevels;
    // fwidth 以缓冲区像素为单位；乘实际渲染倍率，保持 CSS 尺寸下的视觉线宽。
    float thickness = uContourThickness * uRenderScale;
    float majorEvery = uContourMajorEvery;
    float majorWidthScale = uContourMajorWidthScale;
    float minorIntensity = uContourMinorIntensity;

    float scaledHeight = height * levels;

    float lineIndex = floor(scaledHeight + 0.5);
    float distanceToLine = abs(scaledHeight - lineIndex);

    float remainder = mod(lineIndex, majorEvery);
    float isMajor = 1.0 - step(0.5, remainder);

    float widthScale = mix(1.0, majorWidthScale, isMajor);
    float intensity = mix(minorIntensity, 1.0, isMajor);

    float pixelChange = fwidth(scaledHeight);

    float halfWidth = max(pixelChange * thickness * widthScale * 0.5, 0.00001);

    float line = 1.0 - smoothstep(
            0.0,
            halfWidth,
            distanceToLine
    );

    return line * intensity;
}

void main() {
    vec2 shiftedUv = vUv + uParallax;

    vec3 backgroundColor = sampleGradient(shiftedUv, uTime);

    float noiseScale = uNoiseScale;
    float evolveSpeed = uNoiseSpeed;
    vec2 noiseUv = vec2(shiftedUv.x * uAspect, shiftedUv.y);

    vec3 samplePosition = vec3(
            noiseUv * noiseScale,
            uTime * evolveSpeed
    );

    float height = fbm3(samplePosition);
    float line = contourMask(height);

    vec3 contourColor = uContourColor;
    float contourOpacity = uContourOpacity;

    float blendAmount = line * contourOpacity;

    vec3 color = mix(
            backgroundColor,
            contourColor,
            blendAmount
    );

    outColor = vec4(color, 1.0);
}
