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
        this.outputAmount = null;
        this.progress = 0;
        this.posX = null;
        this.posY = null;
        this.internalInventory = new Storage();
        this.outputConnection = null;
        this.inputConnection = null;
        this.acceptTransfer = true;
        this.progressSteps = 0;
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
        this.furnaceID = id;
    }

    getID() {
        return this.furnaceID;
    }
}

export default Furnace;