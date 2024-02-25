class BackgroundDrawer {
    constructor() {
        this.seed = 1000;
        this.steps = 0.02;
        this.p5 = new window.p5();
        this.randomSeed = this.p5.randomSeed(this.seed);
    }

    createPerlinNoiseBackground(ctx, width, height) {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let noiseValue = this.p5.noise(x * this.steps, y * this.steps);

                const color = this.p5.map(noiseValue, 0, 1, 0, 255);

                if(color > 100){
                    ctx.fillStyle = `rgb(${255}, ${255}, ${255})`;
                }else{
                    ctx.fillStyle = `rgb(${0}, ${0}, ${0})`;
                }
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    getValueAtPos(event, canvas) {
        const rect = canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        return this.p5.noise(mouseX * this.steps, mouseY * this.steps)*5;
    }
}

export default BackgroundDrawer;