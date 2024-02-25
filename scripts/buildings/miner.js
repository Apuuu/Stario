import oreData from './data/oreData.js';
import Storage from './storage.js';

class Miner {
    constructor() {
        this.name = "Miner";
        this.isRunning = false;
        this.progress = 0;
        this.minerID = null;
        this.posX = null;
        this.posY = null;
        this.speed = 10;
        this.oreType = null;
        this.upgradeLevel = 1;
        this.workload = null;
        this.internalInventory = new Storage();
        this.outputConnection = null;
        this.transferSpeed = 1;
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

    activateMiner(id, renderer) {
        if (!this.isRunning) {
            this.isRunning = true;
            if (this.progress < this.workload) {
                this.interval = setInterval(() => {
                    if (this.internalInventory[this.oreType] <= this.internalInventory.Capacity) {
                        this.progress = this.progress + this.speed;
                        if (this.progress >= this.workload) {
                            this.internalInventory[this.oreType] += 1;
                            renderer.updateColorByID(id, [0, 0, 1, 1]);
                            this.progress = 0;
                            if (this.outputConnection && this.internalInventory[this.oreType] > this.transferSpeed) {
                                if (this.outputConnection.name != "Storage") {
                                    this.outputConnection.internalInventory[this.oreType] += this.transferSpeed;
                                    this.internalInventory[this.oreType] -= this.transferSpeed;
                                } else {
                                    this.outputConnection[this.oreType] += this.transferSpeed;
                                    this.internalInventory[this.oreType] -= this.transferSpeed;
                                }
                            }
                        } else {
                            renderer.updateColorByID(id, [0, this.progress / this.workload, 0, 1]);
                        }
                    } else {
                        this.deactivateMiner();
                        clearInterval(this.interval);
                        renderer.updateColorByID(id, [1, 0, 0, 1]);
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
