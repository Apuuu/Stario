class Storage {
    constructor() {
        this.name = "Storage"
        this.Capacity = 100;
        this.iron = 0;
        this.copper = 0;
        this.coal = 0;
        this.steel = 0;
        this.copperwire = 0;
        this.ironbar = 0;
        this.copperbar = 0;
        this.electricmotor = 0;
        this.water = 0;
        this.posX = null;
        this.posY = null;
        this.storageID = null;
        this.inputConnection = null;
        this.outputConnection = null;
    }

    setID(id) {
        this.storageID = id;
    }

    setPos(x, y) {
        this.posX = x;
        this.posY = y;
    }

    activateStorage() {
        const resources = ['iron', 'copper', 'coal', 'steel', 'copperwire', 'ironbar', 'copperbar', 'electricmotor', 'water'];
        this.interval = setInterval(() => {
            if (this.outputConnection) {
                if (this.outputConnection.name === "Storage") {
                    resources.forEach(resource => {
                        if (this[resource] > 0) {
                            this.outputConnection[resource] += 1;
                            this[resource] -= 1;
                        }
                    });
                } else {
                    resources.forEach(resource => {
                        if (this[resource] > 0) {
                            this.outputConnection.internalInventory[resource] += 1;
                            this[resource] -= 1;
                        }
                    });
                }
            }
        }, 1000);
    }
}

export default Storage;