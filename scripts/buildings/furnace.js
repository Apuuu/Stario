import Storage from "./systems/storage.js";
import smeltingData from "./data/smeltingData.js";

class Furnace {
    constructor(data = {}) {
        this.name = data.name || "Furnace";
        this.buildingID = data.buildingID || null;
        this.isRunning = data.isRunning || false;
        this.speed = data.speed || 2;
        this.workload = data.workload || null;
        this.productionMaterial = data.productionMaterial || null;
        this.craftingMaterials = data.craftingMaterials || null;
        this.outputAmount = data.outputAmount || null;
        this.progress = data.progress || 0;
        this.posX = data.posX || null;
        this.posY = data.posY || null;
        this.internalInventory = data.internalInventory || new Storage();
        this.outputConnectionID = data.outputConnectionID || null;
        this.outputConnection = null;
        this.progressSteps = data.progressSteps || 0;
    }

    setupFurnace(materialName) {
        let output = smeltingData.find(output => output.outputMaterial === materialName);
        this.productionMaterial = output.outputMaterial;
        this.workload = output.workload;
        this.craftingMaterials = output.inputMaterials;
        this.outputAmount = output.outputAmount;
    }

    setProgressSteps() {
        let prog = this.progress / this.workload;
        this.progressSteps = Math.floor(prog * 5) / 5;
        if(this.progressSteps > 0.8) {
            this.progressSteps = 0.8;
        }
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
                        this.setProgressSteps();
                        renderer.updateProgress(id, this.progressSteps);
                        if (this.progress >= this.workload) {

                            this.internalInventory[this.productionMaterial] += this.outputAmount;
                            for (let material in this.craftingMaterials) {
                                this.internalInventory[material] -= this.craftingMaterials[material];
                            }
                            this.progress = 0;
                        }
                    }

                    if (this.outputConnection) {
                        if (this.outputConnection.name != "Storage" && this.internalInventory[this.productionMaterial] > 0) {
                            this.outputConnection.internalInventory[this.productionMaterial] += 1;
                            this.internalInventory[this.productionMaterial] -= 1;
                        } else if (this.outputConnection.name === "Storage" && this.internalInventory[this.productionMaterial] > 0){
                            this.outputConnection[this.productionMaterial] += 1;
                            this.internalInventory[this.productionMaterial] -= 1;
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
        this.buildingID = id;
    }

    getID() {
        return this.buildingID;
    }
}

export default Furnace;