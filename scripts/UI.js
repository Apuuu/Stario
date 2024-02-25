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

        $(".glCanvas-ui-minerselection-element").click((event) => {
            this.oreID = $(event.target).data("value");
        });

        $(".glCanvas-ui-furnaceselection-element").click((event) => {
            this.smeltID = $(event.target).data("value");
        });

        $(".glCanvas-ui-constructorselection-element").click((event) => {
            this.craftID = $(event.target).data("value");
        });

        $(".glCanvas-ui-element").click((event) => { 
            this.BuildingID = $(event.target).data("type");
            console.log(this.BuildingID);
            switch($(event.target).data("value")){
                case 1:
                    $(".glCanvas-ui-minerselection").css("display", "block");
                    break;
                case 2:
                    $(".glCanvas-ui-furnaceselection").css("display", "block");
                    break;
                case 3:
                    $(".glCanvas-ui-constructorselection").css("display", "block");
                    break;
            }
        });

        $(".glCanvas-ui-minerselection-element").click((event) => { 
            $(".glCanvas-ui-minerselection").css("display", "none");
        });

        $(".glCanvas-ui-furnaceselection-element").click((event) => { 
            $(".glCanvas-ui-furnaceselection").css("display", "none");
        });

        $(".glCanvas-ui-constructorselection-element").click((event) => { 
            $(".glCanvas-ui-constructorselection").css("display", "none");
        });


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

        for (let i = 0; i < renderer.rectInfos.length; i++) {
            if (this.mouseX > renderer.rectInfos[i][0] && this.mouseX < renderer.rectInfos[i][0] + 50 && this.mouseY > renderer.rectInfos[i][1] && this.mouseY < renderer.rectInfos[i][1] + 50) {
                console.log(i);
                return i;
            }
        }
    }

    displayBuildingInformations(building) {
        const whitelistKeys = ["productionMaterial", "name", "isRunning", "speed", "oreType", "upgradeLevel", "workload", "outputConnection", "inputConnection", "internalInventory"];
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

        closeButton.on('click', function () {
            divC.remove();
        });

        showInventory.on('click', function () {
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
        $('body').append(divC);
    }
}


export default UI;
