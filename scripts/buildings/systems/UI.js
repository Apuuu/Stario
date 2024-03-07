import oreData from "../data/oreData.js";
import craftingData from "../data/craftingData.js";
import smeltingData from "../data/smeltingData.js";

class UI {

    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.BuildingID = 1;
        this.oreID = "iron";
        this.smeltID = "steel";
        this.craftID = "copperwire";

        $(".funcbut").click((event) => {
            this.BuildingID = $(event.target).data("value");
        });

        $("body").on("click", ".glCanvas-ui-minerselection-element", (event) => {
            this.oreID = $(event.target).data("value");
        });

        $("body").on("click", ".glCanvas-ui-furnaceselection-element", (event) => {
            this.smeltID = $(event.target).data("value");
        });

        $("body").on("click", ".glCanvas-ui-constructorselection-element", (event) => {
            this.craftID = $(event.target).data("value");
        });
        
        $(".glCanvas-ui-element").click((event) => {
            this.BuildingID = $(event.target).data("type");
            console.log(this.BuildingID);
            switch ($(event.target).data("value")) {
                case 2:
                    $(".glCanvas-ui-furnaceselection").css("display", "block");
                    break;
                case 3:
                    $(".glCanvas-ui-constructorselection").css("display", "block");
                    break;
            }
        });

        $("body").on("click", ".glCanvas-ui-minerselection-element", (event) => {
            $(".glCanvas-ui-minerselection").css("display", "none");
        });

        $("body").on("click", ".glCanvas-ui-furnaceselection-element", (event) => {
            $(".glCanvas-ui-furnaceselection").css("display", "none");
        });

        $("body").on("click", ".glCanvas-ui-constructorselection-element", (event) => {
            $(".glCanvas-ui-constructorselection").css("display", "none");
        });

        this.addOresToMinerUI();
        this.addSmeltingToUI();
        this.addCraftingToUI();

    }

    addOresToMinerUI() {

        const ores = oreData.map(ore => ore.oretype);

        for (let i = 0; i < ores.length; i++) {
            const div = $(`<div class="glCanvas-ui-minerselection-element" data-value="${ores[i]}">${ores[i]}</div>`);
            $(".glCanvas-ui-minerselection-container").append(div);
        }
    }

    addSmeltingToUI() {

        const smeltingMaterials = smeltingData.map(smelting => smelting.outputMaterial);

        for (let i = 0; i < smeltingMaterials.length; i++) {
            const div = $(`<div class="glCanvas-ui-furnaceselection-element" data-value="${smeltingMaterials[i]}">${smeltingMaterials[i]}</div>`);
            $(".glCanvas-ui-furnaceselection-container").append(div);
        }
    }

    addCraftingToUI() {
        const craftingMaterials = craftingData.map(craft => craft.outputMaterial);
        for (let i = 0; i < craftingMaterials.length; i++) {
            const div = $(`<div class="glCanvas-ui-constructorselection-element" data-value="${craftingMaterials[i]}">${craftingMaterials[i]}</div>`);
            $(".glCanvas-ui-constructorselection-container").append(div);
        }
    }



    changeVals(event, count) {
        const rect = $("#glCanvas")[0].getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;

        $("#glCanvas-MousePos-x").text(`MouseX: ${this.mouseX}`);
        $("#glCanvas-MousePos-y").text(`MouseY: ${this.mouseY}`);
        $("#glCanvas-MousePos-elementcount").text(`Count: ${count}`);
        $("#glCanvas-MousePos-elementselection").text(`BuildingID: ${this.BuildingID}`);
    }

    getIDFromBuilding(event, renderer) {
        const rect = $("#glCanvas")[0].getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
        console.log(this.mouseX, this.mouseY);
        for (let i = 0; i < renderer.buildingRenderer.buildings.length; i++) {
            if (this.mouseX > renderer.buildingRenderer.buildings[i].x && this.mouseX < renderer.buildingRenderer.buildings[i].x + 50 && this.mouseY > renderer.buildingRenderer.buildings[i].y && this.mouseY < renderer.buildingRenderer.buildings[i].y + 50) {
                console.log(i);
                return i;
            }
        }
    }

    getBuildingIDfromMouse(event, renderer) {
        const rect = $("#glCanvas")[0].getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;

        for (let i = 0; i < renderer.buildingRenderer.buildings.length; i++) {
            if (this.mouseX > renderer.buildingRenderer.buildings[i].x && this.mouseX < renderer.buildingRenderer.buildings[i].x + 50 && this.mouseY > renderer.buildingRenderer.buildings[i].y && this.mouseY < renderer.buildingRenderer.buildings[i].y + 50) {
                return i+1;
            }
        }

    }

    displayBuildingInformations(building) {
        const whitelistKeys = ["productionMaterial", "name", "isRunning", "speed", "oreType", "upgradeLevel", "workload", "outputConnectionID", "outputConnectionID2", "inputConnectionID", "buildingID"];
        const divC = $(`<div class="ui-displaybuildinginfos"></div>`);
        const closeButton = $("<button>Close</button>");
        const showInventory = $("<button>Open Inv</button>");

        divC.css({
            backgroundColor: "white",
            borderRadius: 5 + "px",
            opacity: 0.5,
            position: "absolute",
            left: building.posX + 30 + "px",
            top: building.posY - 70 + "px",
        });

        for (let key in building) {
            if (building.hasOwnProperty(key) && typeof building[key] !== "function") {
                if (whitelistKeys.includes(key)) {
                    const div = $(`<div>${key}: ${building[key]}</div>`);
                    divC.append(div);
                }
            }
        }

        closeButton.on("click", function () {
            divC.remove();
        });

        showInventory.on("click", function () {
            if (building.name != "Storage") {
                for (let items in building.internalInventory) {
                    if (building.internalInventory.hasOwnProperty(items)) {
                        const div = $(`<div>${items}: ${building.internalInventory[items]}</div>`);
                        divC.append(div);
                    }
                }
            } else {
                for (let items in building) {
                    if (building.hasOwnProperty(items)) {
                        const div = $(`<div>${items}: ${building[items]}</div>`);
                        divC.append(div);
                    }
                }
            }
        });

        divC.append(closeButton);
        divC.append(showInventory);
        $("body").append(divC);
    }
}


export default UI;
