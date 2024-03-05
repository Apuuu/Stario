import { vertexShaderS, fragmentShaderS } from '../shaders/defaultShader/defaultShader.js';
import ParticleSystem from './extensions/particleSystem.js';
import TerrainGenerator from './extensions/terrainGenerator.js';
import TerrainOverlayGenerator from './extensions/terrainOverlayGenerator.js';

class WebGLRenderer {

    constructor() {

        this.canvas = document.getElementById("glCanvas");
        this.gl = this.canvas.getContext("webgl2");
        this.counter = 0;
        this.lineCounter = 0;
        this.terrainCounter = 0;
        this.terrainPebblesCounter = 0;
        this.rectInfos = [];
        this.lineInfos = [];
        this.terrainInfos = [];
        this.textures = [];
        this.vsSource = null;
        this.fsSource = null;
        this.shaderProgram = null;
        this.buildingIDMap = new Map();
        this.scale = 100;
        this.terrainScale = 50;
        this.mineralInfos = [];
        this.terrainSeed = 100;
        this.noiseScale = 0.5;
        this.defaultTerrain = "terrainastroid";
        this.terrainTheme = [1, 1, 1, 1.0];
        this.shinyResourcesCounter = 0;
        this.particleSystems = [];
        this.terrain = [];
        this.terrainOverlay = [];
    }

    async loadTexture(id, url) {
        const image = new Image();
        image.src = url;
        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
        });

        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

        this.textures[id] = texture;
    }

    initwebGLRenderer() {
        this.createBuildings();
        this.resizeCanvas();

        this.loadTexture("furnace", "scripts/buildings/img/furnace/furnace.png");
        this.loadTexture("miner", "scripts/buildings/img/miner/miner.png");
        this.loadTexture("constructor", "scripts/buildings/img/constructor/constructor.png");
        this.loadTexture("storage", "scripts/buildings/img/storage/storage.png");
        this.loadTexture("connection", "scripts/buildings/img/functions/connection.png");
        this.loadTexture("minerprogressbar", "scripts/buildings/img/miner/miner3doc.png");
        this.loadTexture("furnaceprogressbar", "scripts/buildings/img/furnace/furnace3doc.png");
        this.loadTexture("constructorprogressbar", "scripts/buildings/img/constructor/constructor3d.png");
        this.loadTexture("storageprogressbar", "scripts/buildings/img/storage/storage3doc.png");
        this.loadTexture("terrainastroid", "scripts/buildings/img/terrain/astroid.png");
        this.loadTexture("terrainPebbles", "scripts/buildings/img/terrain/terrainpebbles.png");
        this.loadTexture("terrainCraters", "scripts/buildings/img/terrain/tempcraters.png");
        this.loadTexture("terrainDust", "scripts/buildings/img/terrain/dust.png");
        this.loadTexture("resource", "scripts/buildings/img/terrain/resourcenode.png");
        this.loadTexture("splitterprogressbar", "scripts/buildings/img/splitter/splitter.png");
        this.loadTexture("particle", "scripts/buildings/img/terrain/particle.png");

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderS);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderS);

        this.shaderProgram = this.createProgram(vertexShader, fragmentShader);

        const vertices = [
            -0.5, 0.5,
            -0.5, -0.5,
            0.5, 0.5,
            0.5, -0.5
        ];

        this.positionAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aPosition");
        this.texCoordAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aTexCoord");
        this.colorAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aColor");
        this.smoothOutLocation = this.gl.getUniformLocation(this.shaderProgram, "smoothOut");

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.useProgram(this.shaderProgram);

        this.astroidTerrain();
    }

    astroidTerrain() {

        this.terrain["astroid"] = new TerrainGenerator(this)
            .generateTerrain();

        this.terrainOverlay["pebbles"] = new TerrainOverlayGenerator(this)
            .setMinMaxRandom(30, 70)
            .createTerrainOverlayNormal();

        this.terrainOverlay["pebbles2"] = new TerrainOverlayGenerator(this)
            .setMinMaxRandom(10, 50)
            .setAlpha(0.3)
            .setColorMul([5, 5, 5, 1])
            .createTerrainOverlayNormal();

        this.terrainOverlay["craters"] = new TerrainOverlayGenerator(this)
            .setProbability(0.99)
            .setMinMaxRandom(100, 200)
            .setTextureID("terrainCraters")
            .createTerrainOverlayRandom();

        this.particleSystems["clouds"] = new ParticleSystem(this)
            .setAmount(400)
            .setTextureID("terrainDust")
            .setParticleColor([1, 1, 1, 0.3])
            .setParticleSize(1500)
            .shuffleParticles(2500, 2000, 2500, 2500);

    }

    renderAstroidTerrain() {

        this.terrainOverlay["pebbles2"]
            .drawTerrainOverlay();

        this.terrainOverlay["pebbles"]
            .drawTerrainOverlay();

        this.terrainOverlay["craters"]
            .drawTerrainOverlay();

    }

    getMineralInfos(mineralDeposites) {
        this.mineralInfos = mineralDeposites;
    }

    createMineralDepositsBuffer(mineralVerts, mineralBuffer, counter) {
        this[mineralVerts] = [];

        for (let i = 0; i < this.mineralInfos.length; i++) {
            const x = this.mineralInfos[i].x;
            const y = this.mineralInfos[i].y;
            const canvas = this.canvas;
            const x1 = ((x - canvas.width / 2) / (canvas.width / 2));
            const y1 = ((canvas.height / 2 - y) / (canvas.height / 2));
            const x2 = (x1 + (this.scale / canvas.width));
            const y2 = (y1 - (this.scale / canvas.height));

            if (this.mineralInfos[i].oreType == "uranium") {
                this.particleSystems[`glowores${this.shinyResourcesCounter}`] = new ParticleSystem(this)
                    .setAmount(5)
                    .setTextureID("particle")
                    .setParticleColor(this.mineralInfos[i].oreColor)
                    .setParticleSize(15)
                    .shuffleParticles(x + 12.5, y + 12.5, 25, 25);

                this.shinyResourcesCounter++;
            }

            this[mineralVerts].push(
                x1, y1, this.mineralInfos[i].offset1, 0.0, ...this.mineralInfos[i].oreColor,
                x1, y2, this.mineralInfos[i].offset1, 1.0, ...this.mineralInfos[i].oreColor,
                x2, y1, this.mineralInfos[i].offset2, 0.0, ...this.mineralInfos[i].oreColor
            );

            this[mineralVerts].push(
                x1, y2, this.mineralInfos[i].offset1, 1.0, ...this.mineralInfos[i].oreColor,
                x2, y1, this.mineralInfos[i].offset2, 0.0, ...this.mineralInfos[i].oreColor,
                x2, y2, this.mineralInfos[i].offset2, 1, ...this.mineralInfos[i].oreColor
            );

            if (this[counter] === undefined) {
                this[counter] = 0;
            }

            this[counter]++;

        }

        this[mineralBuffer] = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this[mineralBuffer]);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this[mineralVerts]), this.gl.STATIC_DRAW);
    }

    drawMineralDeposits(buffer, counter) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this[buffer]);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures["resource"]);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 32, 0);
        this.gl.enableVertexAttribArray(this.texCoordAttributeLocation);
        this.gl.vertexAttribPointer(this.texCoordAttributeLocation, 2, this.gl.FLOAT, false, 32, 8);
        this.gl.enableVertexAttribArray(this.colorAttributeLocation);
        this.gl.vertexAttribPointer(this.colorAttributeLocation, 4, this.gl.FLOAT, false, 32, 16);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this[counter] * 6);
    }

    setLine(id, x1, y1, x2, y2) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures["connection"]);
        const canvas = this.canvas;
        const startX = ((x1 - canvas.width / 2) / (canvas.width / 2));
        const startY = ((canvas.height / 2 - y1) / (canvas.height / 2));
        const endX = ((x2 - canvas.width / 2) / (canvas.width / 2));
        const endY = ((canvas.height / 2 - y2) / (canvas.height / 2));
        const defaultColor = [1.0, 1.0, 1.0, 1.0]; // Default color is white

        const vertices = [
            startX, startY, ...defaultColor,
            endX, endY, ...defaultColor
        ];

        this.lineInfos[id] = [x1, y1, x2, y2];

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 24, 0);
        this.gl.vertexAttribPointer(this.colorAttributeLocation, 4, this.gl.FLOAT, false, 24, 8);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.enableVertexAttribArray(this.colorAttributeLocation);
    }

    addLine(id, x1, y1, x2, y2) {
        this.setLine(id, x1, y1, x2, y2);
        this.gl.drawArrays(this.gl.LINES, 0, 2);
        this.lineCounter++;
    }

    redrawLines() {
        this.lineCounter = 0;
        for (let i = 0; i < this.lineInfos.length; i++) {
            this.lineCounter = i;
            this.addLine(i, this.lineInfos[i][0], this.lineInfos[i][1], this.lineInfos[i][2], this.lineInfos[i][3]);
        }
    }

    addRectangleAtMousePosition(event, textureID) {
        const rect = this.canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        mouseX = Math.round(mouseX / (this.scale / 2)) * (this.scale / 2);
        mouseY = Math.round(mouseY / (this.scale / 2)) * (this.scale / 2);

        const prog = 0.0;

        this.addRectangle(this.counter, mouseX - (this.scale / 4), mouseY - (this.scale / 4), this.scale, textureID, prog);
    }

    addRectangle(id, x, y, size, textureID, prog) {
        this.setRectangle(id, x, y, size, textureID, prog);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.counter++;
    }

    setRectangle(id, x, y, size, textureID, prog) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[textureID]);
        const canvas = this.canvas;
        const x1 = ((x - canvas.width / 2) / (canvas.width / 2));
        const y1 = ((canvas.height / 2 - y) / (canvas.height / 2));
        const x2 = (x1 + (size / canvas.width));
        const y2 = (y1 - (size / canvas.height));

        const defaultColor = [1.0, 1.0, 1.0, 1.0]; // Default color is white

        this.rectInfos[id] = [x, y, size, textureID, prog];

        const position = [
            x1, y1, 0.0 + this.rectInfos[id][4], 0.0, ...defaultColor,
            x1, y2, 0.0 + this.rectInfos[id][4], 1.0, ...defaultColor,
            x2, y1, 0.2 + this.rectInfos[id][4], 0.0, ...defaultColor,
            x2, y2, 0.2 + this.rectInfos[id][4], 1.0, ...defaultColor
        ];

        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 32, 0);
        this.gl.vertexAttribPointer(this.texCoordAttributeLocation, 2, this.gl.FLOAT, false, 32, 8);
        this.gl.vertexAttribPointer(this.colorAttributeLocation, 4, this.gl.FLOAT, false, 32, 16);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.enableVertexAttribArray(this.texCoordAttributeLocation);
        this.gl.enableVertexAttribArray(this.colorAttributeLocation);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(position), this.gl.STATIC_DRAW);
    }

    redrawRectangles() {
        this.counter = 0;
        for (let i = 0; i < this.rectInfos.length; i++) {
            this.counter = i;
            this.addRectangle(i, this.rectInfos[i][0], this.rectInfos[i][1], this.rectInfos[i][2], this.rectInfos[i][3], this.rectInfos[i][4]);
        }
    }

    updateProgress(id, progress) {
        this.rectInfos[id][4] = progress;
    }

    updateFrame() {

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.terrain["astroid"].drawTerrain();

        this.drawMineralDeposits("mineralBuffer", "mineralCounter");

        this.renderAstroidTerrain();

        this.redrawLines();
        this.redrawRectangles();

        for (let i = 0; i < this.shinyResourcesCounter; i++) {
            this.particleSystems[`glowores${i}`]
                .addRandomWind(1, 1)
                .drawParticles();
        }

        this.particleSystems["clouds"]
            .addWind(10, 0)
            .drawParticles();
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error("Error compiling shader:", this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error("Error linking program:", this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    resizeCanvas() {
        const canvas = this.canvas;
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            this.gl.viewport(0, 0, canvas.width, canvas.height);
        }
    }

    createBuildings() {
        this.buildingIDMap.set(1, "furnaceprogressbar"); //furnace
        this.buildingIDMap.set(2, "minerprogressbar"); //miner
        this.buildingIDMap.set(3, "storageprogressbar"); //storage
        this.buildingIDMap.set(4, "storageprogressbar");
        this.buildingIDMap.set(5, "storageprogressbar");
        this.buildingIDMap.set(6, "constructorprogressbar"); //constructor
        this.buildingIDMap.set(7, "storageprogressbar"); //transporter
        this.buildingIDMap.set(8, "minerprogressbar"); //splitter
    }
}

export default WebGLRenderer;