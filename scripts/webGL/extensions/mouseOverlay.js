class MouseOverlay {
    constructor(webGLRenderer) {
        this.gl = webGLRenderer.gl;

        this.width = webGLRenderer.canvas.width;
        this.height = webGLRenderer.canvas.height;

        this.positionAttributeLocation = webGLRenderer.positionAttributeLocation;
        this.texCoordAttributeLocation = webGLRenderer.texCoordAttributeLocation;
        this.colorAttributeLocation = webGLRenderer.colorAttributeLocation;
        this.shaderProgramMouse = webGLRenderer.shaderProgramMouse;
        this.shaderProgram = webGLRenderer.shaderProgram;

        this.mousePosLocation = this.gl.getUniformLocation(this.shaderProgramMouse, 'uMousePos');

        this.gl.canvas.addEventListener('mousemove', (e) => {
            const rect = $("#glCanvas")[0].getBoundingClientRect();

            let mouseX = e.clientX - rect.left;
            let mouseY = e.clientY - rect.top;

            mouseX = Math.round(mouseX / 50) * 50;
            mouseY = -(Math.round(mouseY / 50) * 50)+this.height;

            const mouseXNormalized = mouseX / this.gl.canvas.width;
            const mouseYNormalized = mouseY / this.gl.canvas.height;

            this.mouseX = mouseXNormalized;
            this.mouseY = mouseYNormalized;

        });
    }

    createOverlay() {

        const positions = [
            -1.0, -1.0, 0.0, 0.0, ...[1, 1, 1, 1],
            1.0, -1.0, 1.0, 0.0, ...[1, 1, 1, 1],
            -1.0, 1.0, 0.0, 1.0, ...[1, 1, 1, 1],
            1.0, -1.0, 1.0, 0.0, ...[1, 1, 1, 1],
            -1.0, 1.0, 0.0, 1.0, ...[1, 1, 1, 1],
            1.0, 1.0, 1.0, 1.0, ...[1, 1, 1, 1]
        ];


        if (!this.buffer) {
            this.buffer = this.gl.createBuffer();
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

        return this;
    }

    drawOverlay() {
        this.gl.useProgram(this.shaderProgramMouse);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.uniform2f(this.mousePosLocation, this.mouseX, this.mouseY);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 32, 0);
        this.gl.vertexAttribPointer(this.texCoordAttributeLocation, 2, this.gl.FLOAT, false, 32, 8);
        this.gl.vertexAttribPointer(this.colorAttributeLocation, 4, this.gl.FLOAT, false, 32, 16);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.enableVertexAttribArray(this.texCoordAttributeLocation);
        this.gl.enableVertexAttribArray(this.colorAttributeLocation);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        this.gl.useProgram(this.shaderProgram);

        return this;
    }
}

export default MouseOverlay;