import Storage from "./storage.js";

class ItemSplitter {
    constructor(data = {}) {
        this.name = data.name || "ItemSplitter";
        this.buildingID = data.buildingID || null;
        this.posX = data.posX || null;
        this.posY = data.posY || null;
        this.outputConnectionID = data.outputConnectionID || null;
        this.outputConnectionID2 = data.outputConnectionID2 || "unused";
        this.outputConnection = data.outputConnection || null;
        this.outputConnection2 = data.outputConnection2 || null;
        this.internalInventory = data.internalInventory || new Storage();
        this.side = 1;
    }

    activateSplitter() {
        this.interval = setInterval(() => {
            if (this.outputConnection && this.outputConnection2) {
                this.internalInventory.resources.forEach(resource => {
                    if (this.internalInventory[resource] > 0) {
                        const targetConnection = this.side === 1 ? this.outputConnection : this.outputConnection2;
                        targetConnection.internalInventory[resource] += 1;
                        this.internalInventory[resource] -= 1;
                        this.side = this.side === 1 ? 0 : 1;
                    }
                });
            }
        }, 100);
    }

    setPos(x, y) {
        this.posX = x;
        this.posY = y;
    }

    setID(id) {
        this.buildingID = id;
    }
}

export default ItemSplitter;