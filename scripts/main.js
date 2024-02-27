import WebGLRenderer from "./webGLRenderer.js"
import UI from "./UI.js";
import Storage from "./buildings/storage.js";
import Furnace from "./buildings/furnace.js";
import Miner from "./buildings/oreHarvester.js";
import Constructor from "./buildings/constructor.js";
import StorageCrate from "./buildings/storageCrate.js";

class Main {

    constructor() {
        this.webGLRenderer = new WebGLRenderer();
        this.UI = new UI();
        this.storgeUnit = new Storage();
        this.furnaces = [];
        this.miners = [];
        this.storages = [];
        this.constructors = [];
        this.connections = [];
        this.buildingsMap = new Map();

    }

    init() {

        this.webGLRenderer.initwebGLRenderer();
        //this.webGLRenderer.generateTerrain();
        this.UI.addOresToMinerUI();
        this.UI.addSmeltingToUI();
        this.UI.addCraftingToUI();

    }

}

$(document).ready(() => {
    const main = new Main();
    main.init();

    let selectedBuilding = null;
    let firstSelection = null;
    let secondSelection = null;
    let selectionStep = 0;

    $(".funcbut").click(function () {
        console.log(main.UI.BuildingID);
    });

    $("#saveBut").click(function () {
        saveGameState();
        console.log("Inshallah, gamestate saved!        -Apu");
    });

    $("#loadBut").click(function () {
        loadGameState();
        console.log("Mashallah, gamestate loaded!        -Apu");
    });
    
    $("#resetBut").click(function () {
        clearGameState();
        console.log("Alhamduliah, gamestate cleared!        -Apu");
    });
    //TODO: Rape Joe for this code and make it better and more efficient and less retarded
    //TODO: Also make it so that the buildings are not hardcoded
    //TODO: And make it so that the buildings are not hardcoded
    //TODO: Also not hardcoded
    //TODO: Dumb code is dumb and hardcoded and dumb and bad and dumb and hardcoded and dumb
    //TODO: Vincent is raping Joe for this code and making it better and more efficient and less retarded
    //TODO: Vincent is also making it so that the buildings are not hardcoded
    //TODO: Vincent hates hardcoded code and is making it so that the buildings are not hardcoded
    //TODO: Apu is watching how Vincent is raping Joe for this code and making it better and more efficient and less retarded
     $("#printMap").click(function () {
        console.log(main.buildingsMap);
        console.log(main.webGLRenderer.rectInfos);
    });

    //TODO: Refactor this into something that doesnt look like shit
    $("#glCanvas").on('click', function (event) {
        switch (main.UI.BuildingID) {
            case 1:
                main.webGLRenderer.addRectangleAtMousePosition(event, main.webGLRenderer.buildingIDMap.get(main.UI.BuildingID));
                main.furnaces[main.webGLRenderer.counter] = new Furnace();
                main.furnaces[main.webGLRenderer.counter].setID(main.webGLRenderer.counter);
                main.furnaces[main.webGLRenderer.counter].setPos(main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][0], main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][1]);
                main.furnaces[main.webGLRenderer.counter].setupFurnace(main.UI.smeltID);
                main.furnaces[main.webGLRenderer.counter].activateFurnace(main.webGLRenderer.counter - 1, main.webGLRenderer);
                main.buildingsMap.set(main.webGLRenderer.counter, main.furnaces[main.webGLRenderer.counter]);
                break;
            case 2:
                console.log(main.miners);
                main.webGLRenderer.addRectangleAtMousePosition(event, main.webGLRenderer.buildingIDMap.get(main.UI.BuildingID));
                main.miners[main.webGLRenderer.counter] = new Miner();
                main.miners[main.webGLRenderer.counter].setID(main.webGLRenderer.counter);
                main.miners[main.webGLRenderer.counter].setupMiner(main.UI.oreID);
                main.miners[main.webGLRenderer.counter].setPos(main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][0], main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][1]);
                main.miners[main.webGLRenderer.counter].setEfficiency(1);
                main.miners[main.webGLRenderer.counter].activateMiner(main.webGLRenderer.counter - 1, main.webGLRenderer);
                main.buildingsMap.set(main.webGLRenderer.counter, main.miners[main.webGLRenderer.counter]);
                break;
            case 3:
                main.webGLRenderer.addRectangleAtMousePosition(event, main.webGLRenderer.buildingIDMap.get(main.UI.BuildingID));
                main.storages[main.webGLRenderer.counter] = new StorageCrate();
                main.storages[main.webGLRenderer.counter].setID(main.webGLRenderer.counter);
                main.storages[main.webGLRenderer.counter].setPos(main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][0], main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][1]);
                main.storages[main.webGLRenderer.counter].activateStorageCrate();
                main.buildingsMap.set(main.webGLRenderer.counter, main.storages[main.webGLRenderer.counter]);
                break;

            case 4:
                selectedBuilding = main.UI.getIDFromBuilding(event, main.webGLRenderer);
                main.UI.displayBuildingInformations(main.buildingsMap.get(selectedBuilding + 1));
                main.UI.getBuildingIDfromMouse(event, main.webGLRenderer, main.buildingsMap);
                break;

            case 5:
                if (selectionStep === 0) {
                    firstSelection = main.UI.getBuildingIDfromMouse(event, main.webGLRenderer, main.buildingsMap);
                    selectionStep++;
                } else if (selectionStep === 1) {
                    secondSelection = main.UI.getBuildingIDfromMouse(event, main.webGLRenderer, main.buildingsMap);

                    main.buildingsMap.get(firstSelection).outputConnectionID = secondSelection;
                    main.buildingsMap.get(secondSelection).inputConnectionID = firstSelection;

                    main.buildingsMap.get(firstSelection).outputConnection = main.buildingsMap.get(secondSelection);

                    main.webGLRenderer.addLine(main.webGLRenderer.lineCounter, main.buildingsMap.get(firstSelection).posX + (main.webGLRenderer.scale / 4), main.buildingsMap.get(firstSelection).posY + (main.webGLRenderer.scale / 4), main.buildingsMap.get(secondSelection).posX + (main.webGLRenderer.scale / 4), main.buildingsMap.get(secondSelection).posY + (main.webGLRenderer.scale / 4));

                    selectionStep = 0;
                }
                break;

            case 6:

                main.webGLRenderer.addRectangleAtMousePosition(event, main.webGLRenderer.buildingIDMap.get(main.UI.BuildingID));
                main.constructors[main.webGLRenderer.counter] = new Constructor();
                main.constructors[main.webGLRenderer.counter].setID(main.webGLRenderer.counter);
                main.constructors[main.webGLRenderer.counter].setPos(main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][0], main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][1]);
                main.constructors[main.webGLRenderer.counter].setupConstructor(main.UI.craftID);
                main.constructors[main.webGLRenderer.counter].activateConstructor(main.webGLRenderer.counter - 1, main.webGLRenderer);
                main.buildingsMap.set(main.webGLRenderer.counter, main.constructors[main.webGLRenderer.counter]);

                break;
        }
    });

    $(window).on('resize', function () {
        main.webGLRenderer.resizeCanvas();
        main.webGLRenderer.redrawRectangles();
    });

    setInterval(() => {
        main.webGLRenderer.updateFrame();
    }, 100);
    // retard apu
    $("#glCanvas").mousemove(function (event) {
        main.UI.changeVals(event, main.webGLRenderer.counter, main.storgeUnit);
    });

    function saveGameState() {

        console.log(main.buildingsMap);

        const gameState = {
            webglbuildings: main.webGLRenderer.rectInfos,
            webgllines: main.webGLRenderer.lineInfos,
            miners: main.miners,
            furnaces: main.furnaces,
            storages: main.storages,
            constructors: main.constructors,
        };

        const gameStateStr = JSON.stringify(gameState);

        localStorage.setItem('gameState', gameStateStr);
    }

    function loadGameState() {

        const gameStateStr = localStorage.getItem('gameState');

        if (gameStateStr) {
            const gameState = JSON.parse(gameStateStr);

            main.webGLRenderer.rectInfos = gameState.webglbuildings;
            main.webGLRenderer.lineInfos = gameState.webgllines;

            if (gameState.miners) {
                main.miners = gameState.miners.map((data, index) => {
                    if (index === 0) {
                        return null;
                    } else if (data !== null) {
                        const newMiner = new Miner(data);
                        newMiner.internalInventory = data.internalInventory;
                        newMiner.isRunning = false;
                        newMiner.activateMiner(index - 1, main.webGLRenderer);
                        main.buildingsMap.set(index, newMiner);
                        return newMiner
                    }
                });
            } else {
                main.miners = [];
            }

            if (gameState.furnaces) {
                main.furnaces = gameState.furnaces.map((data, index) => {
                    if (index === 0) {
                        return null;
                    } else if (data !== null) {
                        const newFurnace = new Furnace(data);
                        newFurnace.internalInventory = data.internalInventory;
                        newFurnace.isRunning = false;
                        newFurnace.activateFurnace(index - 1, main.webGLRenderer);
                        main.buildingsMap.set(index, newFurnace);
                        return newFurnace
                    }
                });
            } else {
                main.furnaces = [];
            }

            if (gameState.storages) {
                main.storages = gameState.storages.map((data, index) => {
                    if (index === 0) {
                        return null;
                    } else if (data !== null) {
                        const newStorage = new StorageCrate(data);
                        newStorage.activateStorageCrate();
                        main.buildingsMap.set(index, newStorage);
                        return newStorage
                    }
                });
            } else {
                main.storages = [];
            }

            if (gameState.constructors) {
                main.constructors = gameState.constructors.map((data, index) => {
                    if (index === 0) {
                        return null;
                    } else if (data !== null) {
                        const newConstructor = new Constructor(data);
                        newConstructor.internalInventory = data.internalInventory;
                        newConstructor.isRunning = false;
                        newConstructor.activateConstructor(index - 1, main.webGLRenderer);
                        main.buildingsMap.set(index, newConstructor);
                        return newConstructor
                    }
                });
            } else {
                main.constructors = [];
            }
        }
        
        for(const [{}, value] of main.buildingsMap) {
            if(value !== null) {
                if(value.outputConnectionID !== null) {
                    value.outputConnection = main.buildingsMap.get(value.outputConnectionID);
                }
            }
        }
    }

    function clearGameState() {
        localStorage.removeItem('gameState');
    }
});