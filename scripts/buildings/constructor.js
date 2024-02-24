import Storage from "./storage.js";
import craftingData from "./data/craftingData.js";

class Constructor {
    constructor() {
        this.name = "Constructor";
        this.constructorID = null;
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

    setupConstructor(materialName) {
        let output = craftingData.find(output => output.outputMaterial === materialName);
        this.productionMaterial = output.outputMaterial;
        this.workload = output.workload;
        this.craftingMaterials = output.inputMaterials;
    }

    activateConstructor(id, renderer) {

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
                            renderer.updateColorByID(id, [0, 0, this.progress / this.workload, 1]);
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


    deactivateConstructor() {
        if (this.isRunning) {
            this.isRunning = false;
        }
    }

    setID(id) {
        this.constructorID = id;
    }

    getID() {
        return this.constructorID;
    }
}

export default Constructor;