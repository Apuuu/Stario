import Storage from "./storage.js";
import smeltingData from "./data/smeltingData.js";

class Furnace {
    constructor() {
        this.name = "Furnace";
        this.furnaceID = null;
        this.isRunning = false;
        this.speed = 2;
        this.workload = null;
        this.productionMaterial = null;
        this.craftingMaterials = null;
        this.progress = 0;
        this.posX = null;
        this.posY = null;
        this.internalInventory = new Storage();
        this.outputConnection = null;
        this.inputConnection = null;
        this.acceptTransfer = true;
    }

    setupFurnace(materialName) {
        let output = smeltingData.find(output => output.outputMaterial === materialName);
        this.productionMaterial = output.outputMaterial;
        this.workload = output.workload;
        this.craftingMaterials = output.inputMaterials;
    }

    activateFurnace(id, renderer) {

        if (!this.isRunning) {
            this.isRunning = true;
            if (this.progress < this.workload) {
                this.interval = setInterval(() => {
                    const allMaterialsPresent = Object.keys(this.craftingMaterials).every(material => {
                        return this.internalInventory[material] >= this.craftingMaterials[material]
                    });
                    if (allMaterialsPresent) {
                        this.progress = this.progress + this.speed;
                        if (this.progress >= this.workload) {
                            renderer.updateColorByID(id, [0, 1, 0, 1]);
                            this.internalInventory[this.productionMaterial] += 1;
                            for (let material in this.craftingMaterials) {
                                this.internalInventory[material] -= this.craftingMaterials[material];
                            }
                            this.progress = 0;
                        } else {
                            renderer.updateColorByID(id, [this.progress / this.workload, 0, 0, 1]);
                        }
                    }
                }, 100);
            }
        }
    }

    setPos(x, y) {
        this.posX = x;
        this.posY = y;
    }


    deactivateFurnace() {
        if (this.isRunning) {
            this.isRunning = false;
        }
    }

    setID(id) {
        this.furnaceID = id;
    }

    getID() {
        return this.furnaceID;
    }
}

export default Furnace;