import * as THREE from 'three';

THREE.ShaderChunk["fxaa_pars"] = `
    #define FXAA_REDUCE_MIN   (1.0/ 128.0)
    #define FXAA_REDUCE_MUL   (1.0 / 8.0)
    #define FXAA_SPAN_MAX     8.0

    void fxaa_apply(vec4 color, vec2 uv)
    {
        vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);
        vec3 rgbNW = texture2D(colorTexture, uv + vec2(-1.0, -1.0) * inverseVP).xyz;
        vec3 rgbNE = texture2D(colorTexture, uv + vec2(1.0, -1.0) * inverseVP).xyz;
        vec3 rgbSW = texture2D(colorTexture, uv + vec2(-1.0, 1.0) * inverseVP).xyz;
        vec3 rgbSE = texture2D(colorTexture, uv + vec2(1.0, 1.0) * inverseVP).xyz;
        vec3 rgbM  = color.xyz;
        vec3 luma = vec3(0.299, 0.587, 0.114);
        float lumaNW = dot(rgbNW, luma);
        float lumaNE = dot(rgbNE, luma);
        float lumaSW = dot(rgbSW, luma);
        float lumaSE = dot(rgbSE, luma);
        float lumaM  = dot(rgbM,  luma);
        float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
        float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
        
        vec2 dir;
        dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
        dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
        
        float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
                            (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);
        
        float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
        dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
                max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
                dir * rcpDirMin)) * inverseVP;
        
        vec3 rgbA = 0.5 * (
            texture2D(tex, uv * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
            texture2D(tex, uv * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
        vec3 rgbB = rgbA * 0.5 + 0.25 * (
            texture2D(tex, uv * inverseVP + dir * -0.5).xyz +
            texture2D(tex, uv * inverseVP + dir * 0.5).xyz);

        float lumaB = dot(rgbB, luma);
        if ((lumaB < lumaMin) || (lumaB > lumaMax))
            color = vec4(rgbA, 1.0);
        else
            color = vec4(rgbB, 1.0);
    }

`
// FXAA doesn't do any texture generation or need uniforms but we stay consistent with the other effects
export default function(){
    return function () {}
};

