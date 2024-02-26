import oreData from "./data/oreData.js";
import craftingData from "./data/craftingData.js";
import smeltingData from "./data/smeltingData.js";

class Storage {
    constructor() {
        this.name = "Storage"
        this.Capacity = 100;
        this.posX = null;
        this.posY = null;
        this.storageID = null;
        this.inputConnection = null;
        this.outputConnection = null;
        this.resources = [];
        this.setupStorage();
    }

    setupStorage() {

        const ores = oreData.map(ore => ore.oretype);
        ores.forEach(ore => {
            this[ore] = 0;
        });

        const craftingMaterials = craftingData.map(craft => craft.outputMaterial);
        craftingMaterials.forEach(material => {
            this[material] = 0;
        });

        const smeltingMaterials = smeltingData.map(smelting => smelting.outputMaterial);
        smeltingMaterials.forEach(material => {
            this[material] = 0;
        });
        
        this.resources = [...ores, ...craftingMaterials, ...smeltingMaterials];

    }

    setID(id) {
        this.storageID = id;
    }

    setPos(x, y) {
        this.posX = x;
        this.posY = y;
    }

    activateStorage() {
        this.interval = setInterval(() => {
            if (this.outputConnection) {
                if (this.outputConnection.name === "Storage") {
                    this.resources.forEach(resource => {
                        if (this[resource] > 0) {
                            this.outputConnection[resource] += 1;
                            this[resource] -= 1;
                        }
                    });
                } else {
                    this.resources.forEach(resource => {
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