import Storage from "./systems/storage.js";

class ResourceTransporter {
    constructor(data = {}) {
        this.name = data.name || "resourceTransporter";
        this.buildingID = data.buildingID || null;
        this.posX = data.posX || null;
        this.posY = data.posY || null;
        this.outputConnectionID = data.outputConnectionID || null;
        this.outputConnection = data.outputConnection || null;
        this.internalInventory = data.internalInventory || new Storage();
    }

    activateResourceTransporter() {
        this.interval = setInterval(() => {
            if (this.outputConnection) {
                this.internalInventory.resources.forEach(resource => {
                    if (this.internalInventory[resource] > 0) {
                        this.outputConnection.internalInventory[resource] += 1;
                        this.internalInventory[resource] -= 1;
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

export default ResourceTransporter;