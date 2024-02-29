class MineralDeposites {
    constructor() {
        this.deposits = [];
        this.oreType = "iron";
        this.oreColor = [1,1,1,1];
        this.posX = null;
        this.posY = null;
    }

    setDepositID(id) {
        this.depositID = id;
    }

    generateDepositRandom(seed, renderer) {
        noise.seed(seed)

        for(let i = 0; i < renderer.canvas.width; i += (renderer.scale/2)) {
            for(let j = 0; j < renderer.canvas.height; j += (renderer.scale/2)) {
                let value = noise.simplex2(i/1000, j/1000);
                if(value > 0.45) {
                    this.posX = i+25;
                    this.posY = j+25;
                    this.deposits.push({x: this.posX, y: this.posY, oreType: "iron", oreColor: [0.529, 0.361, 0.141, 1]});
                }
            }
        }

        noise.seed(seed+1)
        for(let i = 0; i < renderer.canvas.width; i += (renderer.scale/2)) {
            for(let j = 0; j < renderer.canvas.height; j += (renderer.scale/2)) {
                let value = noise.simplex2(i/1000, j/1000);
                if(value > 0.8) {
                    this.posX = i+25;
                    this.posY = j+25;
                    this.deposits.push({x: this.posX, y: this.posY, oreType: "copper", oreColor: [0.721, 0.451, 0.2, 1]});
                }
            }
        }

        noise.seed(seed+2)
        for(let i = 0; i < renderer.canvas.width; i += (renderer.scale/2)) {
            for(let j = 0; j < renderer.canvas.height; j += (renderer.scale/2)) {
                let value = noise.simplex2(i/1000, j/1000);
                if(value > 0.8) {
                    this.posX = i+25;
                    this.posY = j+25;
                    this.deposits.push({x: this.posX, y: this.posY, oreType: "coal", oreColor: [0.2, 0.2, 0.2, 1]});
                }
            }
        }

        

        renderer.getMineralInfos(this.deposits);
    }

}

export default MineralDeposites;