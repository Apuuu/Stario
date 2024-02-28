import WebGLRenderer from "./webGLRenderer.js"
import UI from "./UI.js";
import Storage from "./buildings/storage.js";
import Furnace from "./buildings/furnace.js";
import Miner from "./buildings/oreHarvester.js";
import Constructor from "./buildings/constructor.js";
import StorageCrate from "./buildings/storageCrate.js";
import ResourceTransporter from "./buildings/resourcesTransporter.js";

class Main {

    constructor() {
        this.webGLRenderer = new WebGLRenderer();
        this.UI = new UI();
        this.storgeUnit = new Storage();
        this.furnaces = [];
        this.miners = [];
        this.storages = [];
        this.constructors = [];
        this.resourceTransporters = [];
        this.connections = [];
        this.connectionDistance = 500;
        this.buildingsMap = new Map();

    }

    init() {

        this.webGLRenderer.initwebGLRenderer();
        this.webGLRenderer.generateTerrain();
        this.webGLRenderer.createTerrainOverlay("pebblesVerts", "pebblesBuffer", 60, "pebblesCounter", 100, 20, false, 0);
        this.webGLRenderer.createTerrainOverlay("pebblesVerts2", "pebblesBuffer2", 70, "pebblesCounter2", 100, 20, false, 0);
        this.webGLRenderer.createTerrainOverlay("cratersVerts", "cratersBuffer", 80, "cratersCounter", 350, 20, true, 0.97);
        this.webGLRenderer.createParticleSystem(200, "part1", 1750, 1350, 900, 1850, 1750, [1, 1, 1, 0.2]);
        this.UI.addOresToMinerUI();
        this.UI.addSmeltingToUI();
        this.UI.addCraftingToUI();

    }

}

$(document).ready(() => {
    const main = new Main();
    main.init();

    setInterval(() => {
        main.webGLRenderer.updateFrame();
    }, 100);

    function saveGameState() {

        const gameState = {
            webglbuildings: main.webGLRenderer.rectInfos,
            webgllines: main.webGLRenderer.lineInfos,
            miners: main.miners,
            furnaces: main.furnaces,
            storages: main.storages,
            constructors: main.constructors,
            transporters: main.resourceTransporters,
        };

        const gameStateStr = JSON.stringify(gameState);

        localStorage.setItem("gameState", gameStateStr);
    }

    function loadGameState() {

        const gameStateStr = localStorage.getItem("gameState");

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

            if (gameState.transporters) {
                main.resourceTransporters = gameState.transporters.map((data, index) => {
                    if (index === 0) {
                        return null;
                    } else if (data !== null) {
                        const newTransporter = new ResourceTransporter(data);
                        newTransporter.internalInventory = data.internalInventory;
                        newTransporter.activateResourceTransporter();
                        main.buildingsMap.set(index, newTransporter);
                        return newTransporter
                    }
                });
            } else {
                main.storages = [];
            }
        }

        for (const [{ }, value] of main.buildingsMap) {
            if (value !== null) {
                if (value.outputConnectionID !== null) {
                    value.outputConnection = main.buildingsMap.get(value.outputConnectionID);
                }
            }
        }
    }

    function clearGameState() {
        localStorage.removeItem("gameState");
    }

    function placeTransporter() {
        main.webGLRenderer.addRectangleAtMousePosition(event, main.webGLRenderer.buildingIDMap.get(main.UI.BuildingID));
        main.resourceTransporters[main.webGLRenderer.counter] = new ResourceTransporter();
        main.resourceTransporters[main.webGLRenderer.counter].setID(main.webGLRenderer.counter);
        main.resourceTransporters[main.webGLRenderer.counter].setPos(main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][0], main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][1]);
        main.resourceTransporters[main.webGLRenderer.counter].activateResourceTransporter();
        main.buildingsMap.set(main.webGLRenderer.counter, main.resourceTransporters[main.webGLRenderer.counter]);
    }

    function placeConstructor() {
        main.webGLRenderer.addRectangleAtMousePosition(event, main.webGLRenderer.buildingIDMap.get(main.UI.BuildingID));
        main.constructors[main.webGLRenderer.counter] = new Constructor();
        main.constructors[main.webGLRenderer.counter].setID(main.webGLRenderer.counter);
        main.constructors[main.webGLRenderer.counter].setPos(main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][0], main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][1]);
        main.constructors[main.webGLRenderer.counter].setupConstructor(main.UI.craftID);
        main.constructors[main.webGLRenderer.counter].activateConstructor(main.webGLRenderer.counter - 1, main.webGLRenderer);
        main.buildingsMap.set(main.webGLRenderer.counter, main.constructors[main.webGLRenderer.counter]);
    }

    let selectedBuilding = null;
    let firstSelection = null;
    let secondSelection = null;
    let selectionStep = 0;

    function createConnection() {
        if (selectionStep === 0) {
            firstSelection = main.UI.getBuildingIDfromMouse(event, main.webGLRenderer, main.buildingsMap);
            selectionStep++;
        } else if (selectionStep === 1) {
            secondSelection = main.UI.getBuildingIDfromMouse(event, main.webGLRenderer, main.buildingsMap);

            function calculateDistance(x1, y1, x2, y2) {
                const dx = x2 - x1;
                const dy = y2 - y1;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance;
            }

            const firstSelectionX = main.buildingsMap.get(firstSelection).posX + (main.webGLRenderer.scale / 4);
            const firstSelectionY = main.buildingsMap.get(firstSelection).posY + (main.webGLRenderer.scale / 4);
            const secondSelectionX = main.buildingsMap.get(secondSelection).posX + (main.webGLRenderer.scale / 4);
            const secondSelectionY = main.buildingsMap.get(secondSelection).posY + (main.webGLRenderer.scale / 4);

            const distance = calculateDistance(firstSelectionX, firstSelectionY, secondSelectionX, secondSelectionY);

            if (main.buildingsMap.get(firstSelection).name === "resourceTransporter" && main.buildingsMap.get(secondSelection).name === "resourceTransporter") {
                if ((distance < main.connectionDistance * 4) && firstSelection !== secondSelection) {
                    main.buildingsMap.get(firstSelection).outputConnectionID = secondSelection;
                    main.buildingsMap.get(secondSelection).inputConnectionID = firstSelection;
                    main.buildingsMap.get(firstSelection).outputConnection = main.buildingsMap.get(secondSelection);
                    main.webGLRenderer.addLine(main.webGLRenderer.lineCounter, main.buildingsMap.get(firstSelection).posX + (main.webGLRenderer.scale / 4), main.buildingsMap.get(firstSelection).posY + (main.webGLRenderer.scale / 4), main.buildingsMap.get(secondSelection).posX + (main.webGLRenderer.scale / 4), main.buildingsMap.get(secondSelection).posY + (main.webGLRenderer.scale / 4));
                }
            } else {
                if ((distance < main.connectionDistance) && firstSelection !== secondSelection) {
                    main.buildingsMap.get(firstSelection).outputConnectionID = secondSelection;
                    main.buildingsMap.get(secondSelection).inputConnectionID = firstSelection;
                    main.buildingsMap.get(firstSelection).outputConnection = main.buildingsMap.get(secondSelection);
                    main.webGLRenderer.addLine(main.webGLRenderer.lineCounter, main.buildingsMap.get(firstSelection).posX + (main.webGLRenderer.scale / 4), main.buildingsMap.get(firstSelection).posY + (main.webGLRenderer.scale / 4), main.buildingsMap.get(secondSelection).posX + (main.webGLRenderer.scale / 4), main.buildingsMap.get(secondSelection).posY + (main.webGLRenderer.scale / 4));
                }
            }

            selectionStep = 0;
        }
    }

    function displayBuildingInfos() {
        selectedBuilding = main.UI.getIDFromBuilding(event, main.webGLRenderer);
        main.UI.displayBuildingInformations(main.buildingsMap.get(selectedBuilding + 1));
        main.UI.getBuildingIDfromMouse(event, main.webGLRenderer, main.buildingsMap);
    }

    function placeStorageCrate() {
        main.webGLRenderer.addRectangleAtMousePosition(event, main.webGLRenderer.buildingIDMap.get(main.UI.BuildingID));
        main.storages[main.webGLRenderer.counter] = new StorageCrate();
        main.storages[main.webGLRenderer.counter].setID(main.webGLRenderer.counter);
        main.storages[main.webGLRenderer.counter].setPos(main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][0], main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][1]);
        main.storages[main.webGLRenderer.counter].activateStorageCrate();
        main.buildingsMap.set(main.webGLRenderer.counter, main.storages[main.webGLRenderer.counter]);
    }

    function placeMiner() {
        main.webGLRenderer.addRectangleAtMousePosition(event, main.webGLRenderer.buildingIDMap.get(main.UI.BuildingID));
        main.miners[main.webGLRenderer.counter] = new Miner();
        main.miners[main.webGLRenderer.counter].setID(main.webGLRenderer.counter);
        main.miners[main.webGLRenderer.counter].setupMiner(main.UI.oreID);
        main.miners[main.webGLRenderer.counter].setPos(main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][0], main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][1]);
        main.miners[main.webGLRenderer.counter].setEfficiency(1);
        main.miners[main.webGLRenderer.counter].activateMiner(main.webGLRenderer.counter - 1, main.webGLRenderer);
        main.buildingsMap.set(main.webGLRenderer.counter, main.miners[main.webGLRenderer.counter]);
    }

    function placeFurnace() {
        main.webGLRenderer.addRectangleAtMousePosition(event, main.webGLRenderer.buildingIDMap.get(main.UI.BuildingID));
        main.furnaces[main.webGLRenderer.counter] = new Furnace();
        main.furnaces[main.webGLRenderer.counter].setID(main.webGLRenderer.counter);
        main.furnaces[main.webGLRenderer.counter].setPos(main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][0], main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][1]);
        main.furnaces[main.webGLRenderer.counter].setupFurnace(main.UI.smeltID);
        main.furnaces[main.webGLRenderer.counter].activateFurnace(main.webGLRenderer.counter - 1, main.webGLRenderer);
        main.buildingsMap.set(main.webGLRenderer.counter, main.furnaces[main.webGLRenderer.counter]);
    }

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

    $("#printMap").click(function () {
        console.log(main.buildingsMap);
        console.log(main.webGLRenderer.rectInfos);
    });

    const placeBuildings = {
        1: placeFurnace,
        2: placeMiner,
        3: placeStorageCrate,
        4: displayBuildingInfos,
        5: createConnection,
        6: placeConstructor,
        7: placeTransporter
    };
    
    $("#glCanvas").on("click", function (event) {
        const action = placeBuildings[main.UI.BuildingID];
        if (action) {
            action();
        }
    });

    $(window).on("resize", function () {
        main.webGLRenderer.resizeCanvas();
        main.webGLRenderer.redrawRectangles();
    });

    $("#glCanvas").mousemove(function (event) {
        main.UI.changeVals(event, main.webGLRenderer.counter, main.storgeUnit);
    });
});