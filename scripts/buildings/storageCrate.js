import Storage from "./systems/storage.js";

class StorageCrate {
    constructor(data = {}) {
        this.name = data.name || "StorageCrate";
        this.buildingID = data.buildingID || null;
        this.posX = data.posX || null;
        this.posY = data.posY || null;
        this.outputConnectionID = data.outputConnectionID || null;
        this.outputConnection = data.outputConnection || null;
        this.internalInventory = data.internalInventory || new Storage();
    }

    setupBuilding() {
        console.log("Empty setupBuilding function");
    }

    activateBuilding(id, renderer, tracker) {
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

export default StorageCrate;