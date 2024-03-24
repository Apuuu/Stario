class buildingRenderer {
    constructor(webGLRenderer) {
        this.gl = webGLRenderer.gl;
        this.textures = webGLRenderer.textures;
        this.shaderProgram = webGLRenderer.shaderProgram;
        this.positionAttributeLocation = webGLRenderer.positionAttributeLocation;
        this.texCoordAttributeLocation = webGLRenderer.texCoordAttributeLocation;
        this.colorAttributeLocation = webGLRenderer.colorAttributeLocation;
        this.width = webGLRenderer.canvas.width;
        this.height = webGLRenderer.canvas.height;

        this.buildings = [];
        this.counter = 0;
        this.layersMap = new Map();
        this.size = 100;

        this.gl.useProgram(this.shaderProgram);

        this.setLayerMap();
    }

    setLayer(id, layer) {
        this.buildings[id].layer = layer;
    }

    setProgress(id, progress) {
        this.buildings[id].progress = progress;
    }

    addBuilding(x, y, type) {
        this.buildings.push({
            id: this.counter++,
            x: x,
            y: y,
            type: type,
            progress: 0.0,
            color: [1, 1, 1, 1]
        });
    }

    drawBuilding() {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        const buildingsArray = [];

        for (let i = 0; i < this.buildings.length; i++) {

            const x1 = ((this.buildings[i].x - halfWidth) / halfWidth);
            const y1 = ((halfHeight - this.buildings[i].y) / halfHeight);
            const x2 = (x1 + (this.size / this.width));
            const y2 = (y1 - (this.size / this.height));

            buildingsArray.push(
                x1, y1, 0.0 + this.buildings[i].progress, this.layersMap.get(this.buildings[i].type)[0], ...this.buildings[i].color,
                x1, y2, 0.0 + this.buildings[i].progress, this.layersMap.get(this.buildings[i].type)[1], ...this.buildings[i].color,
                x2, y1, 0.2 + this.buildings[i].progress, this.layersMap.get(this.buildings[i].type)[0], ...this.buildings[i].color,

                x1, y2, 0.0 + this.buildings[i].progress, this.layersMap.get(this.buildings[i].type)[1], ...this.buildings[i].color,
                x2, y1, 0.2 + this.buildings[i].progress, this.layersMap.get(this.buildings[i].type)[0], ...this.buildings[i].color,
                x2, y2, 0.2 + this.buildings[i].progress, this.layersMap.get(this.buildings[i].type)[1], ...this.buildings[i].color
            );
        }

        if (!this.buffer) {
            this.buffer = this.gl.createBuffer();
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(buildingsArray), this.gl.STATIC_DRAW);

        buildingsArray.length = 0;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures["buildingsAtlas"]);

        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 32, 0);
        this.gl.vertexAttribPointer(this.texCoordAttributeLocation, 2, this.gl.FLOAT, false, 32, 8);
        this.gl.vertexAttribPointer(this.colorAttributeLocation, 4, this.gl.FLOAT, false, 32, 16);

        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.enableVertexAttribArray(this.texCoordAttributeLocation);
        this.gl.enableVertexAttribArray(this.colorAttributeLocation);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.buildings.length * 6);

        return this;
    }

    setLayerMap() {
        this.layersMap.set("Miner", [0.0, 0.2]);
        this.layersMap.set("Furnace", [0.2, 0.4]);
        this.layersMap.set("Constructor", [0.4, 0.6]);
        this.layersMap.set("StorageCrate", [0.6, 0.8]);
        this.layersMap.set("ResourceTransporter", [0.6, 0.8]);
        this.layersMap.set("ItemSplitter", [0.8, 1.0]);
    }

}

export default buildingRenderer;