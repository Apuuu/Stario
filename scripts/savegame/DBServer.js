import express from "express";
import DB from "./DB.js";
import cors from "cors";
import bodyParser from 'body-parser';

class DBServer {
    constructor() {
        this.app = express();

        this.app.use(cors());
        this.app.use(cors({ origin: 'http://127.0.0.1:3000' }));
        this.app.use(bodyParser.json({ limit: '50mb' }));
        
        this.port = 3000;
        this.db = new DB();
        this.db.connect();
        this.dbname = "savegame";

        this.app.post('/insert-data/:database/:table', (req, res) => {
            const { database, table } = req.params;

            const dbKeys = "buildingID INT, buildingName VARCHAR(255), buildingProduction VARCHAR(255), buildingPosition VARCHAR(255), buildingConnectionID INT NULL, buildingInventory TEXT, buildingData TEXT";
            this.db.dropTable("test", "test");
            this.db.createTable("test", "test", dbKeys);

            for (let item of req.body) {
                this.db.insertData(database, table, item.keys, item.data);
            }
            res.send('Data received');
        });

        this.app.post("/select-data/:database/:table", (req, res) => {
            const { database, table } = req.params;
            const id = req.body.id;

            this.db.selectDataBybuildingID(database, table, id)
                .then(result => res.send(result))
                .catch(err => res.send(err));
        });

        this.app.get("/select-all/:database/:table", (req, res) => {
            const { database, table } = req.params;

            this.db.selectAllBuildings(database, table)
                .then(result => res.send(result))
                .catch(err => res.send(err));
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server running at http://localhost:${this.port}`);
        });
    }
}

const server = new DBServer(3000);
server.start();
server.db.createDatabase("test");
