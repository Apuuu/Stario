class MineralDeposites {
    constructor() {
        this.deposits = [];
        this.noiseTerrain = [];
        this.oreType = "iron";
        this.oreColor = [1, 1, 1, 1];
        this.posX = null;
        this.posY = null;
        this.counter = 0;
        this.oreScale = 1500;    
        this.offset1 = 0.0;
        this.offset2 = 0.5;
    }

    setDepositID(id) {
        this.depositID = id;
    }

    generateDepositRandom(seed, renderer) {
        noise.seed(seed)

        const width = renderer.canvas.width;
        const height = renderer.canvas.height;
        const quarterScale = renderer.scale / 4;
        const usedPositions = new Set();

        const addDeposit = (i, j, oreType, oreColor, offset1, offset2) => {
            const posX = i + quarterScale;
            const posY = j + quarterScale;
            const posKey = `${posX},${posY}`;

            if (!usedPositions.has(posKey)) {
                usedPositions.add(posKey);
                this.deposits.push({ x: posX, y: posY, oreType, oreColor, offset1, offset2});
            }
        };

        for (let i = 0; i < width; i += (renderer.scale / 2)) {
            for (let j = 0; j < height; j += (renderer.scale / 2)) {
                let value = noise.simplex2(i / this.oreScale, j / this.oreScale);
                if (value > 0.45) {
                    addDeposit(i, j, "iron", [0.529, 0.361, 0.141, 1], 0, 0.5); //[0.529, 0.361, 0.141, 1]
                }
            }
        }

        noise.seed(seed + 1)
        for (let i = 0; i < width; i += (renderer.scale / 2)) {
            for (let j = 0; j < height; j += (renderer.scale / 2)) {
                let value = noise.simplex2(i / this.oreScale, j / this.oreScale);
                if (value > 0.7) {
                    addDeposit(i, j, "copper", [0.721, 0.451, 0.2, 1], 0, 0.5); //[0.721, 0.451, 0.2, 1])
                }
            }
        }

        noise.seed(seed + 2)
        for (let i = 0; i < width; i += (renderer.scale / 2)) {
            for (let j = 0; j < height; j += (renderer.scale / 2)) {
                let value = noise.simplex2(i / this.oreScale, j / this.oreScale);
                if (value > 0.6) {
                    addDeposit(i, j, "coal", [0.2, 0.2, 0.2, 1], 0, 0.5); //[0.2, 0.2, 0.2, 1]
                }
            }
        }

        noise.seed(seed + 3)
        for (let i = 0; i < width; i += (renderer.scale / 2)) {
            for (let j = 0; j < height; j += (renderer.scale / 2)) {
                let value = noise.simplex2(i / this.oreScale, j / this.oreScale);
                if (value > 0.8) {
                    addDeposit(i, j, "uranium", [0.2, 1.0, 0.3, 1.0], 0.5, 1.0); //[0.2, 0.2, 0.2, 1]
                }
            }
        }

        renderer.getMineralInfos(this.deposits);
    }

    isDepositAtPosition(event) {
        const rect = $("#glCanvas")[0].getBoundingClientRect();
        this.mouseX = event.clientX-25 - rect.left;
        this.mouseY = event.clientY-25 - rect.top;

        return this.deposits.find(deposit => {
            return Math.abs(deposit.x - this.mouseX) <= 25 && Math.abs(deposit.y - this.mouseY) <= 25;
        }) || null;
    }

}

export default MineralDeposites;