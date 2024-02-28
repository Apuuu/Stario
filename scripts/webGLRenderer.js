class WebGLRenderer {

    constructor() {

        this.canvas = document.getElementById("glCanvas");
        this.gl = this.canvas.getContext("webgl");
        this.counter = 0;
        this.lineCounter = 0;
        this.terrainCounter = 0;
        this.terrainPebblesCounter = 0;
        this.rectInfos = [];
        this.lineInfos = [];
        this.terrainInfos = [];
        this.textures = [];
        this.vsSource = "";
        this.fsSource = "";
        this.shaderProgram = null;
        this.buildingIDMap = new Map();
        this.scale = 100;
        this.terrainScale = 50;
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
        this.loadTexture("terraingrass", "scripts/buildings/img/terrain/grass.png");
        this.loadTexture("terrainastroid", "scripts/buildings/img/terrain/astroid.png");
        this.loadTexture("terrainPebbles", "scripts/buildings/img/terrain/terrainpebbles.png");
        this.loadTexture("terrainCraters", "scripts/buildings/img/terrain/tempcraters.png");
        this.loadTexture("terrainDust", "scripts/buildings/img/terrain/dust.png");

        this.vsSource = `
            attribute vec4 aPosition;
            attribute vec2 aTexCoord;
            varying vec2 vTexCoord;
            void main() {
                gl_Position = aPosition;
                vTexCoord = aTexCoord;
            }
        `;

        this.fsSource = `
            precision mediump float;
            uniform sampler2D uTexture;
            uniform vec4 uColor;
            varying vec2 vTexCoord;
            void main() {
                vec4 textureColor = texture2D(uTexture, vTexCoord);
                vec4 color = textureColor * uColor;
                gl_FragColor = color;
            }
        `;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, this.vsSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, this.fsSource);
        this.shaderProgram = this.createProgram(vertexShader, fragmentShader);
        const vertices = [
            -0.5, 0.5,
            -0.5, -0.5,
            0.5, 0.5,
            0.5, -0.5
        ];

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        const positionAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aPosition");
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.useProgram(this.shaderProgram);

    }

    createParticleSystem(amount, particelsArray, startPosX, startPosY, scale, distribX, distribY, color) {
        this[particelsArray] = [];
        for (let i = 0; i < amount; i++) {
            const x = startPosX + (-1 + (Math.random() * 2)) * distribX;
            const y = startPosY + (-1 + (Math.random() * 2)) * distribY;
            this[particelsArray][i] = [x, y, color, scale];
        }
    }

    randomizeParticleSystem(particlesArray, mulX, mulY, speed) {
        for (let i = 0; i < this[particlesArray].length; i++) {

            if (i == this[particlesArray].length - 1) {
                this[particlesArray][i][0] = -1000;
                this[particlesArray][i][1] = -1000;
            } else {
                this[particlesArray][i][0] += (-50 + (Math.random() * mulX * 1)) * speed;
                this[particlesArray][i][1] += (-mulY + (Math.random() * mulY * 2)) * speed;

                if (this[particlesArray][i][0] > this.canvas.width) {
                    this[particlesArray][i][0] = 0;
                }
            }
        }
    }

    drawParticleSystem(particlesArray, particlesPos) {
        this.randomizeParticleSystem(particlesArray, 400, 100, 0.01);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures["terrainDust"]);
        const positionAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aPosition");
        const texCoordAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aTexCoord");
        this.gl.enableVertexAttribArray(texCoordAttributeLocation);
        let uColorLocation = this.gl.getUniformLocation(this.shaderProgram, "uColor");
        this[particlesPos] = [];
        for (let i = 0; i < this[particlesArray].length; i++) {

            const canvas = this.canvas;
            const x1 = ((this[particlesArray][i][0] - canvas.width / 2) / (canvas.width / 2));
            const y1 = ((canvas.height / 2 - this[particlesArray][i][1]) / (canvas.height / 2));
            const x2 = (x1 + (this[particlesArray][i][3] / canvas.width));
            const y2 = (y1 - (this[particlesArray][i][3] / canvas.height));

            this[particlesPos] = [
                x1, y1, 0.0, 0.0,
                x1, y2, 0.0, 1,
                x2, y1, 1, 0.0,
                x2, y2, 1, 1
            ];

            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
            this.gl.uniform4f(uColorLocation, ...this[particlesArray][i][2]);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this[particlesPos]), this.gl.STATIC_DRAW);


        }
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 16, 0);
        this.gl.vertexAttribPointer(texCoordAttributeLocation, 2, this.gl.FLOAT, false, 16, 8);
        this.gl.uniform4f(uColorLocation, ...[1, 1, 1, 1]);
    }

    createTerrainOverlay(vertPos, buffer, scale, counter, randSize, minSize, randSpawn, threshold) {
        this[vertPos] = [];
        const values = [0.2, 0.4, 0.6, 0.8, 1.0];

        for (let i = 0; i < this.canvas.width / (scale / 2); i++) {
            for (let j = 0; j < this.canvas.height / (scale / 2); j++) {
                const x = i * (scale / 2);
                const y = j * (scale / 2);
                const size = Math.random() * randSize + minSize;
                const canvas = this.canvas;
                const x1 = ((x - canvas.width / 2) / (canvas.width / 2));
                const y1 = ((canvas.height / 2 - y) / (canvas.height / 2));
                const x2 = (x1 + (size / canvas.width));
                const y2 = (y1 - (size / canvas.height));

                const end = values[Math.floor(Math.random() * values.length)];
                const end2 = Math.random();
                if (randSpawn) {
                    if (end2 > threshold) {
                        this[vertPos].push(
                            x1, y1, end - 0.2, 0.0,
                            x1, y2, end - 0.2, 1.0,
                            x2, y1, end, 0.0
                        );

                        this[vertPos].push(
                            x1, y2, end - 0.2, 1.0,
                            x2, y1, end, 0.0,
                            x2, y2, end, 1.0
                        );

                    }
                } else {
                    this[vertPos].push(
                        x1, y1, end - 0.2, 0.0,
                        x1, y2, end - 0.2, 1.0,
                        x2, y1, end, 0.0
                    );

                    this[vertPos].push(
                        x1, y2, end - 0.2, 1.0,
                        x2, y1, end, 0.0,
                        x2, y2, end, 1.0
                    );
                }


                if (this[counter] === undefined) {
                    this[counter] = 0;
                }

                this[counter]++;

            }
        }

        this[buffer] = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this[buffer]);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this[vertPos]), this.gl.STATIC_DRAW);

    }

    drawTerrainOverlay(buffer, textureID, counter, color) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this[buffer]);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[textureID]);
        let uColorLocation = this.gl.getUniformLocation(this.shaderProgram, "uColor");
        this.gl.uniform4f(uColorLocation, ...color);
        const positionAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aPosition");
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 16, 0);
        const texCoordAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aTexCoord");
        this.gl.enableVertexAttribArray(texCoordAttributeLocation);
        this.gl.vertexAttribPointer(texCoordAttributeLocation, 2, this.gl.FLOAT, false, 16, 8);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this[counter] * 6);
    }

    generateTerrain() {
        let positions = [];
        for (let i = 0; i < this.canvas.width / (this.terrainScale / 2); i++) {
            for (let j = 0; j < this.canvas.height / (this.terrainScale / 2); j++) {
                const x = i * (this.terrainScale / 2);
                const y = j * (this.terrainScale / 2);
                const size = this.terrainScale;
                const canvas = this.canvas;
                const x1 = ((x - canvas.width / 2) / (canvas.width / 2));
                const y1 = ((canvas.height / 2 - y) / (canvas.height / 2));
                const x2 = (x1 + (size / canvas.width));
                const y2 = (y1 - (size / canvas.height));
                const start = 0.05;
                const end = 0.6;

                positions.push(
                    x1, y1, 0.0, 0.0,
                    x1, y2, 0.0, 1.0,
                    x2, y1, start + Math.random() * end, 0.0
                );

                positions.push(
                    x1, y2, 0.0, 1.0,
                    x2, y1, start + Math.random() * end, 0.0,
                    x2, y2, start + Math.random() * end, 1.0
                );

                this.terrainCounter++;
            }
        }

        this.terrainBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.terrainBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    }

    drawTerrain() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.terrainBuffer);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures["terrainastroid"]);
        let color = [1, 1, 1, 1.0];  // Red color
        let uColorLocation = this.gl.getUniformLocation(this.shaderProgram, "uColor");
        this.gl.uniform4f(uColorLocation, ...color);
        let darken = false;  // Change this to false to disable the darkening effect
        let uDarkenLocation = this.gl.getUniformLocation(this.shaderProgram, "uDarken");
        this.gl.uniform1i(uDarkenLocation, darken ? 1 : 0);
        const positionAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aPosition");
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 16, 0);
        const texCoordAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aTexCoord");
        this.gl.enableVertexAttribArray(texCoordAttributeLocation);
        this.gl.vertexAttribPointer(texCoordAttributeLocation, 2, this.gl.FLOAT, false, 16, 8);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.terrainCounter * 6);
    }

    setLine(id, x1, y1, x2, y2) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures["connection"]);
        const canvas = this.canvas;
        const startX = ((x1 - canvas.width / 2) / (canvas.width / 2));
        const startY = ((canvas.height / 2 - y1) / (canvas.height / 2));
        const endX = ((x2 - canvas.width / 2) / (canvas.width / 2));
        const endY = ((canvas.height / 2 - y2) / (canvas.height / 2));

        const vertices = [
            startX, startY,
            endX, endY
        ];

        this.lineInfos[id] = [x1, y1, x2, y2];

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        const positionAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aPosition");
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
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

        this.rectInfos[id] = [x, y, size, textureID, prog];

        const position = [
            x1, y1, 0.0 + this.rectInfos[id][4], 0.0,
            x1, y2, 0.0 + this.rectInfos[id][4], 1,
            x2, y1, 0.2 + this.rectInfos[id][4], 0.0,
            x2, y2, 0.2 + this.rectInfos[id][4], 1
        ];

        const positionAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aPosition");
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 16, 0);
        const texCoordAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, "aTexCoord");
        this.gl.enableVertexAttribArray(texCoordAttributeLocation);
        this.gl.vertexAttribPointer(texCoordAttributeLocation, 2, this.gl.FLOAT, false, 16, 8);

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
        this.drawTerrain();
        this.drawTerrainOverlay("pebblesBuffer", "terrainPebbles", "pebblesCounter", [1, 1, 1, 0.15]);
        this.drawTerrainOverlay("pebblesBuffer2", "terrainPebbles", "pebblesCounter2", [1, 1, 1, 1]);
        this.drawTerrainOverlay("cratersBuffer", "terrainCraters", "cratersCounter", [1, 1, 1, 1]);
        this.redrawLines();
        this.redrawRectangles();
        this.drawParticleSystem("part1")
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
        this.buildingIDMap.set(4, "miner");
        this.buildingIDMap.set(5, "furnace");
        this.buildingIDMap.set(6, "constructorprogressbar"); //constructor
    }
}

export default WebGLRenderer;