class TerrainOverlayGenerator {
    constructor(webGLRenderer) {
        this.gl = webGLRenderer.gl;
        this.textureID = "terrainPebbles";
        this.textures = webGLRenderer.textures;
        this.width = webGLRenderer.canvas.width;
        this.height = webGLRenderer.canvas.height;
        this.colorMul = [1, 1, 1, 1];
        this.terrainOverlayScale = 50;
        this.terrainSeed = 100;
        this.noiseScale = 0.5;
        this.alpha = 1;
        this.counter = 0;
        this.minSize = 10;
        this.randSize = 50;
        this.probability = 0.98;

        this.shaderProgram = webGLRenderer.shaderProgram;
        this.positionAttributeLocation = webGLRenderer.positionAttributeLocation;
        this.texCoordAttributeLocation = webGLRenderer.texCoordAttributeLocation;
        this.colorAttributeLocation = webGLRenderer.colorAttributeLocation;

        this.gl.useProgram(this.shaderProgram);
    }

    setTextureID(textureID) {
        this.textureID = textureID;
        return this;
    }

    setProbability(probability) {
        this.probability = probability;
        return this;
    }

    setMinMaxRandom(min, max) {
        this.minSize = min;
        this.randSize = max;
        return this;
    }

    setAlpha(alpha) {
        this.alpha = alpha;
        return this;
    }

    setColorMul(color) {
        this.colorMul = color;
        return this;
    }

    getNoiseValueAtPosition(x, y) {
        noise.seed(this.terrainSeed);
        return (Math.abs(noise.simplex2(x / this.noiseScale, y / this.noiseScale)) * 0.5) + 0.8;
    }

    createTerrainOverlayNormal() {

        this.vertPos = [];
        const values = [0.2, 0.4, 0.6, 0.8, 1.0];

        for (let i = 0; i < this.width / (this.terrainOverlayScale / 2); i++) {
            for (let j = 0; j < this.height / (this.terrainOverlayScale / 2); j++) {

                const x = i * (this.terrainOverlayScale / 2);
                const y = j * (this.terrainOverlayScale / 2);
                const size = Math.random() * this.randSize + this.minSize;
                const x1 = ((x - this.width / 2) / (this.width / 2));
                const y1 = ((this.height / 2 - y) / (this.height / 2));
                const x2 = (x1 + (size / this.width));
                const y2 = (y1 - (size / this.height));

                const getColor = (val) => [val * this.colorMul[0], val * this.colorMul[1], val * this.colorMul[2], this.alpha * this.colorMul[3]];

                const topRightVal = this.getNoiseValueAtPosition(x2, y1);
                const topLeftVal = this.getNoiseValueAtPosition(x1, y2);
                const bottomRightVal = this.getNoiseValueAtPosition(x2, y2);
                const bottomLeftVal = this.getNoiseValueAtPosition(x1, y1);

                const topRightColor = getColor(topRightVal);
                const topLeftColor = getColor(topLeftVal);
                const bottomRightColor = getColor(bottomRightVal);
                const bottomLeftColor = getColor(bottomLeftVal);

                const end = values[Math.floor(Math.random() * values.length)];

                this.vertPos.push(
                    x1, y1, end - 0.2, 0.0, ...bottomLeftColor, //bottom left
                    x1, y2, end - 0.2, 1.0, ...topLeftColor, //top left
                    x2, y1, end, 0.0, ...bottomRightColor //bottom right
                );

                this.vertPos.push(
                    x1, y2, end - 0.2, 1.0, ...topLeftColor, //top left
                    x2, y1, end, 0.0, ...bottomRightColor, //bottom right
                    x2, y2, end, 1.0, ...topRightColor //top right
                );

                this.counter++;
            }
        }

        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertPos), this.gl.STATIC_DRAW);

        return this;
    }

    createTerrainOverlayRandom() {

        this.vertPos = [];
        const values = [0.2, 0.4, 0.6, 0.8, 1.0];

        for (let i = 0; i < this.width / (this.terrainOverlayScale / 2); i++) {
            for (let j = 0; j < this.height / (this.terrainOverlayScale / 2); j++) {
                if (Math.random() > this.probability) {
                    const x = i * (this.terrainOverlayScale / 2);
                    const y = j * (this.terrainOverlayScale / 2);
                    const size = Math.random() * this.randSize + this.minSize;
                    const x1 = ((x - this.width / 2) / (this.width / 2));
                    const y1 = ((this.height / 2 - y) / (this.height / 2));
                    const x2 = (x1 + (size / this.width));
                    const y2 = (y1 - (size / this.height));

                    const getColor = (val) => [val * this.colorMul[0], val * this.colorMul[1], val * this.colorMul[2], this.alpha * this.colorMul[3]];

                    const topRightVal = this.getNoiseValueAtPosition(x2, y1);
                    const topLeftVal = this.getNoiseValueAtPosition(x1, y2);
                    const bottomRightVal = this.getNoiseValueAtPosition(x2, y2);
                    const bottomLeftVal = this.getNoiseValueAtPosition(x1, y1);

                    const topRightColor = getColor(topRightVal);
                    const topLeftColor = getColor(topLeftVal);
                    const bottomRightColor = getColor(bottomRightVal);
                    const bottomLeftColor = getColor(bottomLeftVal);

                    const end = values[Math.floor(Math.random() * values.length)];

                    this.vertPos.push(
                        x1, y1, end - 0.2, 0.0, ...bottomLeftColor, //bottom left
                        x1, y2, end - 0.2, 1.0, ...topLeftColor, //top left
                        x2, y1, end, 0.0, ...bottomRightColor //bottom right
                    );

                    this.vertPos.push(
                        x1, y2, end - 0.2, 1.0, ...topLeftColor, //top left
                        x2, y1, end, 0.0, ...bottomRightColor, //bottom right
                        x2, y2, end, 1.0, ...topRightColor //top right
                    );

                    this.counter++;
                }
            }
        }

        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertPos), this.gl.STATIC_DRAW);

        return this;
    }

    drawTerrainOverlay() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[this.textureID]);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 32, 0);
        this.gl.vertexAttribPointer(this.texCoordAttributeLocation, 2, this.gl.FLOAT, false, 32, 8);
        this.gl.vertexAttribPointer(this.colorAttributeLocation, 4, this.gl.FLOAT, false, 32, 16);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.enableVertexAttribArray(this.texCoordAttributeLocation);
        this.gl.enableVertexAttribArray(this.colorAttributeLocation);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.counter * 6);
    }
}

export default TerrainOverlayGenerator;