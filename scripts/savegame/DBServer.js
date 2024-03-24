import express from "express";
import DB from "./DB.js";
import cors from "cors";
import bodyParser from 'body-parser';

class DBServer {
    constructor() {
        this.app = express();

        this.app.use(cors());
        this.app.use(cors({ origin: 'http://127.0.0.1:3000' }));
        this.app.use(bodyParser.json());

        this.port = 3000;
        this.db = new DB();
        this.db.connect();
        this.dbname = "savegame";

        this.app.get("/create-database/:name", (req, res) => {
            this.db.createDatabase(req.params.name);
            res.send("Database created");
        });

        this.app.post("/insert-data/:database/:table", (req, res) => {
            const { database, table } = req.params;
            const data = req.body.data;
            const keys = req.body.keys;

            this.db.insertData(database, table, keys, data);

            res.send("Data inserted");
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
//server.db.dropTable("test","test");
server.db.createDatabase("test");
server.db.createTable("test", "test", "bruh VARCHAR(255), kekw VARCHAR(255)");