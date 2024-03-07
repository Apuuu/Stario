export const vertexShaderMouse = `
    attribute vec4 aPosition;
    attribute vec2 aTexCoord;
    attribute vec4 aColor;
    uniform vec2 uMousePos;
    varying vec2 vTexCoord;
    varying vec4 vColor;
    varying vec2 vMousePos;
    void main() {
        gl_Position = aPosition;
        vTexCoord = aTexCoord;
        vColor = aColor;
        vMousePos = uMousePos;
    }
`;

export const fragmentShaderMouse = `
    precision mediump float;
    uniform sampler2D uTexture;
    uniform bool smoothOut;
    varying vec2 vTexCoord;
    varying vec4 vColor;
    varying vec2 vMousePos;
    void main() {
        vec4 textureColor = texture2D(uTexture, vTexCoord);
        vec4 color = textureColor * vColor;

        vec2 size = vec2(0.0042, 0.0042);
        vec2 dist = abs(vTexCoord - vMousePos) - size;
        float sdf = max(dist.x, dist.y);

        if (sdf < 0.001 && sdf > 0.0008) {
            color = vec4(1.0, 1.0, 1.0, 1.0);
        }else{
            color = vec4(1.0, 1.0, 1.0, 0.0);
        }

        gl_FragColor = color;
    }
`;