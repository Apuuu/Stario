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
        const keys = "buildingID, buildingName, buildingProduction, buildingPosition, buildingConnectionID, buildingInventory, buildingData";
        let dataArray = [];

        for (let i = 1; i < main.buildingsMap.size + 1; i++) {
            const data = {
                keys: keys,
                data: {
                    buildingID: main.buildingsMap.get(i).buildingID,
                    buildingName: main.buildingsMap.get(i).name,
                    buildingProduction: main.buildingsMap.get(i).productionMaterial || null,
                    buildingsPosition: JSON.stringify({ x: main.buildingsMap.get(i).posX, y: main.buildingsMap.get(i).posY }),
                    buildingConnectionID: main.buildingsMap.get(i).outputConnectionID || null,
                    buildingInventory: JSON.stringify(main.buildingsMap.get(i).internalInventory),
                    buildingData: JSON.stringify(main.buildingsMap.get(i))
                },
            };
            dataArray.push(data);
        }
        console.log(JSON.stringify(dataArray).length/1024+"KB");
        $.ajax({
            url: "http://localhost:3000/insert-data/test/test",
            type: 'POST',
            data: JSON.stringify(dataArray),
            contentType: 'application/json',
            success: function (response) {
                console.log(response);
                console.log("Inshallah, gamestate saved!        -Apu");
            },
            error: function (error) {
                console.error('Error:', error);
            }
        });
    }

    function loadGameState() {
        $.ajax({
            url: "http://localhost:3000/select-all/test/test",
            type: 'GET',
            contentType: 'application/json',
            success: function (response) {
                console.log(response);
                for (let i = 0; i < response.length; i++) {
                    const data = JSON.parse(response[i].buildingData);
                    placeBuilding(response[i].buildingName, data);
                }
                console.log("Inshallah, gamestate loaded!        -Apu");
            },  
            error: function (error) {
                console.error('Error:', error);
            }
        });
    }

    function clearGameState() {

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

    function placeBuilding(buildingName, data) {

        const excludedBuildings = ["Selector", "Connector"];

        if (!excludedBuildings.includes(buildingName)) {
            try {
                if (main[`${buildingName}s`] === undefined) {
                    main[`${buildingName}s`] = [];
                }

                const buildingConfigs = {
                    Miner: () => {
                        if (data === undefined) {
                            return main.mineralDepositesGenerator.isDepositAtPosition(event).oreType;
                        } else {
                            return data.productionMaterial;
                        }
                    },
                    Furnace: () => main.UI.smeltID,
                    Constructor: () => main.UI.craftID,
                    StorageCrate: () => null,
                    ResourceTransporter: () => null,
                    ItemSplitter: () => null,
                }
                let setupParam = buildingConfigs[buildingName]();

                if (data === undefined) {
                    main.webGLRenderer.addRectangleAtMousePosition(event, buildingName);
                } else {
                    main.webGLRenderer.addRectangleAtPosition(data.posX, data.posY, buildingName);
                }

                main[`${buildingName}s`][main.webGLRenderer.buildingRenderer.counter] = new main.classes[buildingName](data);
                main[`${buildingName}s`][main.webGLRenderer.buildingRenderer.counter].isRunning = false;
                main[`${buildingName}s`][main.webGLRenderer.buildingRenderer.counter].setID(main.webGLRenderer.buildingRenderer.counter);
                main[`${buildingName}s`][main.webGLRenderer.buildingRenderer.counter].setPos(main.webGLRenderer.buildingRenderer.buildings[main.webGLRenderer.buildingRenderer.counter - 1].x, main.webGLRenderer.buildingRenderer.buildings[main.webGLRenderer.buildingRenderer.counter - 1].y);
                main[`${buildingName}s`][main.webGLRenderer.buildingRenderer.counter].setupBuilding(setupParam);
                main[`${buildingName}s`][main.webGLRenderer.buildingRenderer.counter].activateBuilding(main.webGLRenderer.buildingRenderer.counter - 1, main.webGLRenderer, main.progressTracker);
                main.buildingsMap.set(main.webGLRenderer.buildingRenderer.counter, main[`${buildingName}s`][main.webGLRenderer.buildingRenderer.counter]);

                if(data !== undefined){
                    main[`${buildingName}s`][main.webGLRenderer.buildingRenderer.counter].internalInventory = data.internalInventory;
                }

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