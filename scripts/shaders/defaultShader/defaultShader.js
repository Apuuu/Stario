export const vertexShaderS = `
    attribute vec4 aPosition;
    attribute vec2 aTexCoord;
    attribute vec4 aColor;
    varying vec2 vTexCoord;
    varying vec4 vColor;
    void main() {
        gl_Position = aPosition;
        vTexCoord = aTexCoord;
        vColor = aColor;
    }
`;

export const fragmentShaderS = `
    precision mediump float;
    uniform sampler2D uTexture;
    uniform bool smoothOut;
    varying vec2 vTexCoord;
    varying vec4 vColor;
    void main() {
        vec4 textureColor = texture2D(uTexture, vTexCoord);
        vec4 color = textureColor * vColor;
        float distanceFromCenter;
        distanceFromCenter = smoothOut ? 2.0 - length(vTexCoord - vec2(0.5, 0.5)) * 3.0 : 1.0;
        gl_FragColor = color*distanceFromCenter;
    }
`;