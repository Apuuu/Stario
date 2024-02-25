class WebGLRenderer {

    constructor() {

        this.canvas = document.getElementById('glCanvas');
        this.gl = this.canvas.getContext("webgl");
        this.counter = 0;
        this.lineCounter = 0;
        this.rectInfos = [];
        this.lineInfos = [];
        this.vsSource = "";
        this.fsSource = "";
        this.shaderProgram = null;
        this.buildingIDMap = new Map();
        this.buildingNameMap = new Map();

    }

    addRectangleAtMousePosition(event, colorByBuildingID) {
        const rect = this.canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        mouseX = Math.round(mouseX / 25) * 25;
        mouseY = Math.round(mouseY / 25) * 25;

        this.addRectangle(this.counter, mouseX - 12.5, mouseY - 12.5, 50, colorByBuildingID);
    }

    initwebGLRenderer() {
        this.createBuildings();
        this.createBuildingsNames();
        this.resizeCanvas();

        this.vsSource = `
        attribute vec4 aPosition;
        void main() {
            gl_Position = aPosition;
        }
    `;

        this.fsSource = `
        precision mediump float;

        uniform vec4 uColor;

        void main() {
            gl_FragColor = uColor;
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

        const positionAttributeLocation = this.gl.getAttribLocation(this.shaderProgram, 'aPosition');
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        //this.gl.clearColor(0.3, 0.3, 0.3, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.shaderProgram);

    }

    setLine(id, x1, y1, x2, y2, color) {
        const canvas = this.canvas;
        const startX = ((x1 - canvas.width / 2) / (canvas.width / 2));
        const startY = ((canvas.height / 2 - y1) / (canvas.height / 2));
        const endX = ((x2 - canvas.width / 2) / (canvas.width / 2));
        const endY = ((canvas.height / 2 - y2) / (canvas.height / 2));
    
        const vertices = [
            startX, startY,
            endX, endY
        ];

        this.lineInfos[id] = [x1, y1, x2, y2, color];
    
        this.updateColor(color);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        //this.gl.drawArrays(this.gl.LINES, 0, 2);
    }

    addLine(id, x1, y1, x2, y2, color) {
        this.setLine(id, x1, y1, x2, y2, color);
        this.gl.drawArrays(this.gl.LINES, 0, 2);
        this.lineCounter++;
    }

    redrawLines() {
        this.lineCounter = 0;
        for (let i = 0; i < this.lineInfos.length; i++) {
            this.lineCounter = i;
            this.addLine(i, this.lineInfos[i][0], this.lineInfos[i][1], this.lineInfos[i][2], this.lineInfos[i][3], this.lineInfos[i][4]);
        }
    }

    addRectangle(id, x, y, size, color) {
        this.setRectangle(id, x, y, size, color);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.counter++;
    }

    setRectangle(id, x, y, size, color) {
        const canvas = this.canvas;
        const x1 = ((x - canvas.width / 2) / (canvas.width / 2));
        const y1 = ((canvas.height / 2 - y) / (canvas.height / 2));
        const x2 = (x1 + (size / canvas.width));
        const y2 = (y1 - (size / canvas.height));

        const position = [
            x1, y1,
            x1, y2,
            x2, y1,
            x2, y2
        ];

        this.rectInfos[id] = [x, y, size, color];

        this.updateColor(color);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(position), this.gl.STATIC_DRAW);
    }

    redrawRectangles() {
        this.counter = 0;
        for (let i = 0; i < this.rectInfos.length; i++) {
            this.counter = i;
            this.addRectangle(i, this.rectInfos[i][0], this.rectInfos[i][1], this.rectInfos[i][2], this.rectInfos[i][3]);
        }
    }

    updateColor(color) {
        const colorUniLoc = this.gl.getUniformLocation(this.shaderProgram, 'uColor');
        this.gl.uniform4fv(colorUniLoc, color);
    }

    updateColorByID(id, color) {
        this.rectInfos[id][3] = color;
    }

    updateFrame() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.redrawRectangles();
        this.redrawLines();
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Error compiling shader:', this.gl.getShaderInfoLog(shader));
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
            console.error('Error linking program:', this.gl.getProgramInfoLog(program));
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
        this.buildingIDMap.set(1, [0, 0, 0, 1]);
        this.buildingIDMap.set(2, [0, 0, 0, 1]);
        this.buildingIDMap.set(3, [0.5, 0.5, 0, 1]);
        this.buildingIDMap.set(4, [0, 0, 0, 1]);
        this.buildingIDMap.set(5, [0, 0, 0, 1]);
        this.buildingIDMap.set(6, [0, 0, 0, 1]);
    }

    createBuildingsNames() {
        this.buildingNameMap.set(1, "Furnace");
        this.buildingNameMap.set(2, "Miner");
        this.buildingNameMap.set(6, "Constructor");
    }

    addSign(x, y, building, comment) {

        const divC = $(`<div></div>`);
        const div1 = $(`<div>${building}</div>`);
        const div2 = $(`<div>${comment}</div>`);

        divC.css({
            position: 'absolute',
            left: x + 'px',
            top: y + 'px',
            width: 50 + 'px',
            height: 50 + 'px',
        });

        divC.append(div1);
        divC.append(div2);

        $('body').append(divC);
    }

}

export default WebGLRenderer;





