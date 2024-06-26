import oreData from './data/oreData.js';
import Storage from './systems/storage.js';

class Miner {
    constructor(data = []) {
        this.name = data.name || "Miner";
        this.isRunning = data.isRunning || false;
        this.progress = data.progress || 0;
        this.buildingID = data.buildingID || null;
        this.posX = data.posX || 0;
        this.posY = data.posY || 0;
        this.speed = data.speed || 10;
        this.productionMaterial = data.productionMaterial || "iron";
        this.upgradeLevel = data.upgradeLevel || 1;
        this.workload = data.workload || 0;
        this.internalInventory = new Storage(data.internalInventory || {});
        this.outputConnectionID = data.outputConnectionID || null;
        this.outputConnection = null;
        this.transferSpeed = data.transferSpeed || 1;
        this.progressSteps = data.progressSteps || 0;
    }

    setEfficiency(efficiency) {
        this.speed = efficiency;
    }

    setupBuilding(oreName) {

        let ore = oreData.find(ore => ore.oretype === oreName);
        this.productionMaterial = ore.oretype;
        this.workload = ore.workload;
        this.weight = ore.weight;

    }

    setProgressSteps() {
        let prog = this.progress / this.workload;
        this.progressSteps = Math.floor(prog * 5) / 5;
        if (this.progressSteps > 0.8) {
            this.progressSteps = 0.8;
        }
    }

    activateBuilding(id, renderer, tracker) {
        if (!this.isRunning) {
            this.isRunning = true;
            if (this.progress < this.workload) {
                this.interval = setInterval(() => {
                    if (this.internalInventory[this.productionMaterial] <= this.internalInventory.Capacity) {
                        this.progress = this.progress + this.speed;
                        this.setProgressSteps();
                        renderer.buildingRenderer.setProgress(id, this.progressSteps);
                        if (this.progress >= this.workload) {
                            this.internalInventory[this.productionMaterial] += 1;
                            this.progress = 0;

                            tracker.internalInventory[this.productionMaterial] += this.transferSpeed;
                        }
                    } else {
                        this.deactivateMiner();
                        clearInterval(this.interval);
                    }

                    if (this.outputConnection && this.internalInventory[this.productionMaterial] >= this.transferSpeed) {
                        this.outputConnection.internalInventory[this.productionMaterial] += this.transferSpeed;
                        this.internalInventory[this.productionMaterial] -= this.transferSpeed;
                    }

                }, 100);
            }
        } else {
            this.deactivateMiner();
            clearInterval(this.interval);
        }
    }

    deactivateMiner() {
        if (this.isRunning) {
            this.isRunning = false;
        }
    }

    setID(id) {
        this.buildingID = id;
    }

    setPos(x, y) {
        this.posX = x;
        this.posY = y;
    }

}


export default Miner;
