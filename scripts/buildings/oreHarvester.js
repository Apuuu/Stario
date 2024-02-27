import oreData from './data/oreData.js';
import Storage from './storage.js';

class Miner {
    constructor(data = []) {
        this.name = data.name || "Miner";
        this.isRunning = data.isRunning || false;
        this.progress = data.progress || 0;
        this.minerID = data.minerID || "default ID";
        this.posX = data.posX || 0;
        this.posY = data.posY || 0;
        this.speed = data.speed || 10;
        this.oreType = data.oreType || "default ore type";
        this.upgradeLevel = data.upgradeLevel || 1;
        this.workload = data.workload || 0;
        this.internalInventory = new Storage(data.internalInventory || {});
        this.outputConnection = data.outputConnection || null;
        this.transferSpeed = data.transferSpeed || 1;
        this.progressSteps = data.progressSteps || 0;
    }

    setEfficiency(efficiency) {
        this.speed = efficiency;
    }

    setupMiner(oreName) {

        let ore = oreData.find(ore => ore.oretype === oreName);
        this.oreType = ore.oretype;
        this.workload = ore.workload;
        this.weight = ore.weight;

    }

    setProgressSteps() {
        let prog = this.progress / this.workload;
        this.progressSteps = Math.floor(prog * 5) / 5;
        if(this.progressSteps > 0.8) {
            this.progressSteps = 0.8;
        }
    }

    activateMiner(id, renderer) {
        if (!this.isRunning) {
            this.isRunning = true;
            if (this.progress < this.workload) {
                this.interval = setInterval(() => {
                    if (this.internalInventory[this.oreType] <= this.internalInventory.Capacity) {
                        this.progress = this.progress + this.speed;
                        this.setProgressSteps();
                        renderer.updateProgress(id, this.progressSteps);
                        if (this.progress >= this.workload) {
                            this.internalInventory[this.oreType] += 1;
                            this.progress = 0;
                        }
                    } else {
                        this.deactivateMiner();
                        clearInterval(this.interval);
                    }

                    if (this.outputConnection && this.internalInventory[this.oreType] >= this.transferSpeed) {
                        if (this.outputConnection.name != "Storage") {
                            this.outputConnection.internalInventory[this.oreType] += this.transferSpeed;
                            this.internalInventory[this.oreType] -= this.transferSpeed;
                        } else {
                            this.outputConnection[this.oreType] += this.transferSpeed;
                            this.internalInventory[this.oreType] -= this.transferSpeed;
                        }
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
        this.minerID = id;
    }

    setPos(x, y) {
        this.posX = x;
        this.posY = y;
    }

}


export default Miner;
