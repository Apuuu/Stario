import WebGLRenderer from "./webGLRenderer.js"
import UI from "./UI.js";
import Storage from "./buildings/storage.js";
import Furnace from "./buildings/furnace.js";
import Miner from "./buildings/miner.js";
import Constructor from "./buildings/constructor.js";
import BackgroundDrawer from "./buildings/backgroundDrawer.js";

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
        this.BackgroundDrawer = new BackgroundDrawer();
        this.showBackground = false;
    }

    init() {

        this.webGLRenderer.initwebGLRenderer();

    }

}

$(document).ready(() => {
    const main = new Main();
    main.init();

    //const canvas = document.getElementById("twodcanvas");
    //const ctx = canvas.getContext("2d");

    //main.BackgroundDrawer.createPerlinNoiseBackground(ctx, canvas.width,canvas.height);

    let selectedBuilding = null;
    let firstSelection = null;
    let secondSelection = null;
    let selectionStep = 0;

    /*$(".setbut").click(function () {
        if(!main.showBackground){
            main.showBackground = true;
            $("#twodcanvas").css("display", "block");
        }else if(main.showBackground){
            main.showBackground = false;
            $("#twodcanvas").css("display", "none");
        }
    });*/

    $(".funcbut").click(function () {
        console.log(main.UI.BuildingID);
    });

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
                main.webGLRenderer.addRectangleAtMousePosition(event, main.webGLRenderer.buildingIDMap.get(main.UI.BuildingID));
                main.miners[main.webGLRenderer.counter] = new Miner();
                main.miners[main.webGLRenderer.counter].setID(main.webGLRenderer.counter);
                main.miners[main.webGLRenderer.counter].setupMiner(main.UI.oreID);
                main.miners[main.webGLRenderer.counter].setPos(main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][0], main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][1]);
                main.miners[main.webGLRenderer.counter].setEfficiency(1);
                main.miners[main.webGLRenderer.counter].activateMiner(main.webGLRenderer.counter - 1, main.webGLRenderer, main.storgeUnit);
                main.buildingsMap.set(main.webGLRenderer.counter, main.miners[main.webGLRenderer.counter]);
                break;
            case 3:
                main.webGLRenderer.addRectangleAtMousePosition(event, main.webGLRenderer.buildingIDMap.get(main.UI.BuildingID));
                main.storages[main.webGLRenderer.counter] = new Storage();
                main.storages[main.webGLRenderer.counter].setID(main.webGLRenderer.counter);
                main.storages[main.webGLRenderer.counter].setPos(main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][0], main.webGLRenderer.rectInfos[main.webGLRenderer.counter - 1][1]);
                main.storages[main.webGLRenderer.counter].activateStorage();
                main.buildingsMap.set(main.webGLRenderer.counter, main.storages[main.webGLRenderer.counter]);
                break;

            case 4:

                selectedBuilding = main.UI.getIDFromBuilding(event, main.webGLRenderer);
                main.UI.displayBuildingInformations(main.buildingsMap.get(selectedBuilding + 1));
                break;

            case 5:

                if (selectionStep === 0) {
                    firstSelection = main.UI.getIDFromBuilding(event, main.webGLRenderer);
                    selectionStep++;
                } else if (selectionStep === 1) {
                    secondSelection = main.UI.getIDFromBuilding(event, main.webGLRenderer);
                    main.buildingsMap.get(firstSelection + 1).outputConnection = main.buildingsMap.get(secondSelection + 1);
                    main.buildingsMap.get(secondSelection + 1).inputConnection = main.buildingsMap.get(firstSelection + 1);

                    main.webGLRenderer.addLine(main.webGLRenderer.lineCounter,main.buildingsMap.get(firstSelection + 1).posX+12.5, main.buildingsMap.get(firstSelection + 1).posY+12.5, main.buildingsMap.get(secondSelection + 1).posX+12.5, main.buildingsMap.get(secondSelection + 1).posY+12.5, [1,0,0,1]);

                    console.log(main.webGLRenderer.lineInfos);

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

    setInterval(() => {

        // main.UI.updateStorageUI(main.storgeUnit);

    }, 500);

    $("#glCanvas").mousemove(function (event) {
        main.UI.changeVals(event, main.webGLRenderer.counter, main.storgeUnit);
    });
});


