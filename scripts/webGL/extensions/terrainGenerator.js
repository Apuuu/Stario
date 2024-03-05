class TerrainGenerator {
    constructor(webGLRenderer) {
        this.gl = webGLRenderer.gl;
        this.textureID = "terrainastroid";
        this.textures = webGLRenderer.textures;
        this.width = webGLRenderer.canvas.width;
        this.height = webGLRenderer.canvas.height;
        this.textures = webGLRenderer.textures;
        this.terrainCounter = 0;
        this.colorMul = [1, 1, 1, 1];
        this.terrainScale = 50;
        this.terrainSeed = 100;
        this.noiseScale = 0.5;

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

    setTerrainScale(scale) {
        this.terrainScale = scale;
        return this;
    }

    setColorMul(color) {
        this.colorMul = color;
        return this;
    }

    setTerrainSeed(seed) {
        this.terrainSeed = seed;
        return this;
    }

    getNoiseValueAtPosition(x, y) {
        noise.seed(this.terrainSeed);
        return (Math.abs(noise.simplex2(x / this.noiseScale, y / this.noiseScale)) * 0.5) + 0.8;
    }

    generateTerrain() {
        let positions = [];

        for (let i = 0; i < this.width / (this.terrainScale / 2); i++) {
            for (let j = 0; j < this.height / (this.terrainScale / 2); j++) {
                const x = i * (this.terrainScale / 2);
                const y = j * (this.terrainScale / 2);
                const size = this.terrainScale;
                const x1 = ((x - this.width / 2) / (this.width / 2));
                const y1 = ((this.height / 2 - y) / (this.height / 2));
                const x2 = (x1 + (size / this.width));
                const y2 = (y1 - (size / this.height));
                const start = 0.05;
                const end = 0.6;

                const getColor = (val) => [val * this.colorMul[0], val * this.colorMul[1], val * this.colorMul[2], 1 * this.colorMul[3]];

                const topRightVal = this.getNoiseValueAtPosition(x2, y1);
                const topLeftVal = this.getNoiseValueAtPosition(x1, y2);
                const bottomRightVal = this.getNoiseValueAtPosition(x2, y2);
                const bottomLeftVal = this.getNoiseValueAtPosition(x1, y1);

                const topRightColor = getColor(topRightVal);
                const topLeftColor = getColor(topLeftVal);
                const bottomRightColor = getColor(bottomRightVal);
                const bottomLeftColor = getColor(bottomLeftVal);

                positions.push(
                    x1, y1, 0.0, 0.0, ...bottomLeftColor, //bottom left
                    x1, y2, 0.0, 1.0, ...topLeftColor, //top left
                    x2, y1, start + Math.random() * end, 0.0, ...bottomRightColor //bottom right
                );

                positions.push(
                    x1, y2, 0.0, 1.0, ...topLeftColor, //top left
                    x2, y1, start + Math.random() * end, 0.0, ...bottomRightColor, //bottom right
                    x2, y2, start + Math.random() * end, 1.0, ...topRightColor //top right
                );

                this.terrainCounter++;
            }

        }

        this.terrainBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.terrainBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

        return this;
    }

    drawTerrain() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.terrainBuffer);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[this.textureID]);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 32, 0);
        this.gl.vertexAttribPointer(this.texCoordAttributeLocation, 2, this.gl.FLOAT, false, 32, 8);
        this.gl.vertexAttribPointer(this.colorAttributeLocation, 4, this.gl.FLOAT, false, 32, 16);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.enableVertexAttribArray(this.texCoordAttributeLocation);
        this.gl.enableVertexAttribArray(this.colorAttributeLocation);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.terrainCounter * 6);
    }

}

export default TerrainGenerator;