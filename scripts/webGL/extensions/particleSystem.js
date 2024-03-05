class ParticleSystem {
    constructor(webGLRenderer) {

        this.particles = [];
        this.gl = webGLRenderer.gl;
        this.amount = 10;
        this.textureID = null;
        this.size = 100;
        this.color = [1, 1, 1, 1];
        this.width = webGLRenderer.canvas.width;
        this.height = webGLRenderer.canvas.height;
        this.textures = webGLRenderer.textures;
        this.particleLifetime = 0;

        this.shaderProgram = webGLRenderer.shaderProgram;
        this.positionAttributeLocation = webGLRenderer.positionAttributeLocation;
        this.texCoordAttributeLocation = webGLRenderer.texCoordAttributeLocation;
        this.colorAttributeLocation = webGLRenderer.colorAttributeLocation;

        this.gl.useProgram(this.shaderProgram);
    }

    setAmount(amount) {
        this.amount = amount;
        return this;
    }

    setTextureID(textureID) {
        this.textureID = textureID;
        return this;
    }

    setParticleSize(size) {
        this.size = size;
        return this;
    }

    setParticleColor(color) {
        this.color = color;
        return this;
    }

    shuffleParticles(startX, startY, maxX, maxY) {
        this.particles = [];
        for (let i = 0; i < this.amount; i++) {
            this.particles.push({
                x: startX + (-maxX + Math.random() * maxX*2),
                y: startY + (-maxY + Math.random() * maxY*2),
                size: this.size,
                color: this.color,
                particleLifetime: this.particleLifetime
            });
        }
        return this;
    }

    addWind(x, y) {
        this.particles.forEach(particle => {
            particle.x += x*Math.random();
            particle.y += y*Math.random();

            if (particle.x > this.width) {
                particle.x = 0;
            }
        });
        return this;
    }

    addRandomWind(x, y) {
        this.particles.forEach(particle => {
            particle.x += x - x*Math.random()*2;
            particle.y += y - y*Math.random()*2;
        });
        return this;
    }

    drawParticles() {

        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        const particlesData = [];

        for (let i = 0; i < this.amount; i++) {

            this.particles[i].particleLifetime += 1;

            const x1 = ((this.particles[i].x - halfWidth) / halfWidth);
            const y1 = ((halfHeight - this.particles[i].y) / halfHeight);
            const x2 = (x1 + (this.size / this.width));
            const y2 = (y1 - (this.size / this.height));

            particlesData.push(
                x1, y1, 0.0, 0.0, ...this.color,
                x1, y2, 0.0, 1, ...this.color,
                x2, y1, 1, 0.0, ...this.color,

                x1, y2, 0.0, 1, ...this.color,
                x2, y1, 1, 0.0, ...this.color,
                x2, y2, 1, 1, ...this.color
            );
        }

        if (!this.buffer) {
            this.buffer = this.gl.createBuffer();
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(particlesData), this.gl.STATIC_DRAW);

        particlesData.length = 0;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[this.textureID]);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 32, 0);
        this.gl.vertexAttribPointer(this.texCoordAttributeLocation, 2, this.gl.FLOAT, false, 32, 8);
        this.gl.vertexAttribPointer(this.colorAttributeLocation, 4, this.gl.FLOAT, false, 32, 16);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.enableVertexAttribArray(this.texCoordAttributeLocation);
        this.gl.enableVertexAttribArray(this.colorAttributeLocation);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.amount * 6);

        return this;
    }

}

export default ParticleSystem;