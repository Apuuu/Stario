export const brightnessFilterShader = `
    precision mediump float;
    uniform vec2 uResolution;
    uniform sampler2D uImage;
    varying vec2 vTexCoord;

    void main() {
        vec4 color = texture2D(uImage, vTexCoord);
        float brightness = dot(color.rgb, vec3(0.1,0.1,0.1));
        if (brightness > 0.18) {
            gl_FragColor = color;

        } else {
            gl_FragColor = vec4(0.0);
        }
    }
`;

export const blurShader = `
    precision mediump float;

    uniform sampler2D uImage;
    uniform vec2 uResolution;
    varying vec2 vTexCoord;

    void main() {
        vec2 onePixel = vec2(1.0, 1.0) / 1.0;
        vec4 color = vec4(0.0);
        for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
                vec2 offset = vec2(float(i), float(j)) *onePixel;
                color += texture2D(uImage, vTexCoord + offset);
            }
        }

        gl_FragColor = color;
    }
`;

export const blendShader = `
    precision mediump float;

    uniform sampler2D uImage;
    uniform sampler2D uBloom;
    varying vec2 vTexCoord;

    void main() {
        vec4 color = texture2D(uImage, vTexCoord);
        vec4 bloom = texture2D(uBloom, vTexCoord);
        gl_FragColor = color + bloom;
    }
`;