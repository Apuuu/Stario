import WebGLRenderer from "./webGL/webGLRenderer.js"
import UI from "./buildings/systems/UI.js";
import Storage from "./buildings/systems/storage.js";
import Furnace from "./buildings/furnace.js";
import Miner from "./buildings/oreHarvester.js";
import Constructor from "./buildings/constructor.js";
import StorageCrate from "./buildings/storageCrate.js";
import ResourceTransporter from "./buildings/resourcesTransporter.js";
import mineralDepositesGenerator from "./buildings/systems/mineralDepositesGenerator.js";
import ItemSplitter from "./buildings/itemSplitter.js";
import ProgressTracker from "./buildings/systems/progressTracking.js";

class Main {

    constructor() {
        this.webGLRenderer = new WebGLRenderer();
        this.UI = new UI();
        this.storgeUnit = new Storage();
        this.mineralDepositesGenerator = new mineralDepositesGenerator();
        this.progressTracker = new ProgressTracker();
        this.deposites = [];
        this.connections = [];
        this.connectionDistance = 500;
        this.buildingsMap = new Map();
        this.classes = {
            Miner: Miner,
            Furnace: Furnace,
            StorageCrate: StorageCrate,
            Constructor: Constructor,
            ResourceTransporter: ResourceTransporter,
            ItemSplitter: ItemSplitter,
        }

        this.buildingsNames = new Map();

        this.buildingsNames.set(1, "Furnace");
        this.buildingsNames.set(2, "Miner");
        this.buildingsNames.set(3, "StorageCrate");
        this.buildingsNames.set(4, "Selector");
        this.buildingsNames.set(5, "Connector");
        this.buildingsNames.set(6, "Constructor");
        this.buildingsNames.set(7, "ResourceTransporter");
        this.buildingsNames.set(8, "ItemSplitter");
    }

    init() {

        this.webGLRenderer.initwebGLRenderer();

        this.mineralDepositesGenerator.generateDepositRandom(166, this.webGLRenderer);

        this.webGLRenderer.createMineralDepositsBuffer("mineralVerts", "mineralBuffer", "mineralCounter");
    }

}

$(document).ready(() => {
    const main = new Main();
    main.init();

    let then = 0;
    let frameCount = 0;
    let lastFPSUpdate = 0;
    const fpsLimit = 10;
    const interval = 1000 / fpsLimit;

    function updateFrame(now) {
        const elapsed = now - then;

        if (elapsed > interval) {
            then = now - (elapsed % interval);

            main.webGLRenderer.updateFrame();

            frameCount++;

            if (now - lastFPSUpdate > 1000) {
                const fps = frameCount;
                //console.log(`Current FPS: ${fps}`);

                frameCount = 0;
                lastFPSUpdate = now;
            }
        }

        requestAnimationFrame(updateFrame);
    }
    requestAnimationFrame(updateFrame);

    function saveGameState() {

        const gameState = {
            webglbuildings: main.webGLRenderer.rectInfos,
            webgllines: main.webGLRenderer.lineInfos,
            miners: main.miners,
            furnaces: main.furnaces,
            storages: main.storages,
            constructors: main.constructors,
            transporters: main.resourceTransporters,
            splitters: main.splitters,
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
                        newMiner.activateMiner(index - 1, main.webGLRenderer, main.progressTracker);
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
                        newFurnace.activateFurnace(index - 1, main.webGLRenderer, main.progressTracker);
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
                        newConstructor.activateConstructor(index - 1, main.webGLRenderer, main.progressTracker);
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
                main.transporters = [];
            }

            if (gameState.splitters) {
                main.splitters = gameState.splitters.map((data, index) => {
                    if (index === 0) {
                        return null;
                    } else if (data !== null) {
                        const newSplitter = new ItemSplitter(data);
                        newSplitter.activateSplitter(index - 1, main.webGLRenderer);
                        main.buildingsMap.set(index, newSplitter);
                        return newSplitter
                    }
                });
            } else {
                main.splitters = [];
            }
        }

        for (const [{ }, value] of main.buildingsMap) {
            if (value !== null) {
                if (value.outputConnectionID !== null) {
                    value.outputConnection = main.buildingsMap.get(value.outputConnectionID);
                }

                if (value.outputConnectionID2 !== null) {
                    value.outputConnection2 = main.buildingsMap.get(value.outputConnectionID2);
                }
            }
        }
    }

    function clearGameState() {
        localStorage.removeItem("gameState");
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
                    if (main.buildingsMap.get(firstSelection).outputConnectionID == null) {
                        main.buildingsMap.get(firstSelection).outputConnectionID = secondSelection;
                        main.buildingsMap.get(secondSelection).inputConnectionID = firstSelection;
                        main.buildingsMap.get(firstSelection).outputConnection = main.buildingsMap.get(secondSelection);
                        main.webGLRenderer.addLine(main.webGLRenderer.lineCounter, main.buildingsMap.get(firstSelection).posX + (main.webGLRenderer.scale / 4), main.buildingsMap.get(firstSelection).posY + (main.webGLRenderer.scale / 4), main.buildingsMap.get(secondSelection).posX + (main.webGLRenderer.scale / 4), main.buildingsMap.get(secondSelection).posY + (main.webGLRenderer.scale / 4));
                    } else if (main.buildingsMap.get(firstSelection).outputConnectionID !== null && main.buildingsMap.get(firstSelection).outputConnectionID2 == "unused") {
                        console.log("connecting second output");
                        main.buildingsMap.get(firstSelection).outputConnectionID2 = secondSelection;
                        main.buildingsMap.get(secondSelection).inputConnectionID = firstSelection;
                        main.buildingsMap.get(firstSelection).outputConnection2 = main.buildingsMap.get(secondSelection);
                        main.webGLRenderer.addLine(main.webGLRenderer.lineCounter, main.buildingsMap.get(firstSelection).posX + (main.webGLRenderer.scale / 4), main.buildingsMap.get(firstSelection).posY + (main.webGLRenderer.scale / 4), main.buildingsMap.get(secondSelection).posX + (main.webGLRenderer.scale / 4), main.buildingsMap.get(secondSelection).posY + (main.webGLRenderer.scale / 4));
                    } else {
                        console.log("no connection possible");
                    }
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

    function placeBuilding(buildingName) {

        const excludedBuildings = ["Selector", "Connector"];

        if (!excludedBuildings.includes(buildingName)) {
            try {
                if (main[`${buildingName}s`] === undefined) {
                    main[`${buildingName}s`] = [];
                }

                const buildingConfigs = {
                    Miner: () => main.mineralDepositesGenerator.isDepositAtPosition(event).oreType,
                    Furnace: () => main.UI.smeltID,
                    Constructor: () => main.UI.craftID,
                    StorageCrate: () => null,
                    ResourceTransporter: () => null,
                    ItemSplitter: () => null,
                }

                let setupParam = buildingConfigs[buildingName]();

                main.webGLRenderer.addRectangleAtMousePosition(event, buildingName);

                main[`${buildingName}s`][main.webGLRenderer.buildingRenderer.counter] = new main.classes[buildingName]();
                main[`${buildingName}s`][main.webGLRenderer.buildingRenderer.counter].setID(main.webGLRenderer.buildingRenderer.counter);
                main[`${buildingName}s`][main.webGLRenderer.buildingRenderer.counter].setPos(main.webGLRenderer.buildingRenderer.buildings[main.webGLRenderer.buildingRenderer.counter - 1].x, main.webGLRenderer.buildingRenderer.buildings[main.webGLRenderer.buildingRenderer.counter - 1].y);
                main[`${buildingName}s`][main.webGLRenderer.buildingRenderer.counter].setupBuilding(setupParam);
                main[`${buildingName}s`][main.webGLRenderer.buildingRenderer.counter].activateBuilding(main.webGLRenderer.buildingRenderer.counter - 1, main.webGLRenderer, main.progressTracker);
                main.buildingsMap.set(main.webGLRenderer.buildingRenderer.counter, main[`${buildingName}s`][main.webGLRenderer.buildingRenderer.counter]);
            } catch (error) {
                console.log(error);
            }
        } else {
            if (buildingName === "Selector") {
                displayBuildingInfos();
            } else if (buildingName === "Connector") {
                createConnection();
            }
        }
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

    $("#printTracker").click(function () {
        console.log(main.progressTracker.internalInventory);
    });

    $("#glCanvas").on("click", function (event) {
        console.log(main.buildingsNames.get(main.UI.BuildingID));
        placeBuilding(main.buildingsNames.get(main.UI.BuildingID));
    });

    $("#glCanvas").mousemove(function (event) {
        main.UI.changeVals(event, main.webGLRenderer.buildingRenderer.counter, main.storgeUnit);
    });
});