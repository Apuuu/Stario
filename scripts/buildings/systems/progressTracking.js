import Storage from "./storage.js";

class ProgressTracker{
    constructor(){
        this.internalInventory = new Storage();
    }
}

export default ProgressTracker;