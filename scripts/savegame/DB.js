import mysql from 'mysql';

class DB {
    constructor() {
        this.connection = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "admin"
        });
    }

    connect() {
        this.connection.connect((err) => {
            if (err) throw err;
            console.log("Connected to the MariaDB server.");
        });
    }

    createDatabase(name) {
        this.connection.query(`CREATE DATABASE IF NOT EXISTS ${name}`, (err, result) => {
            if (err) throw err;
            console.log("Database created or already exists");
        });
    }

    createTable(database, tablename, keys) {
        this.connection.query(`CREATE TABLE IF NOT EXISTS ${database}.${tablename} (${keys})`, (err, result) => {
            if (err) throw err;
            console.log("Table created or already exists");
        });
    }

    insertData(database, table, keys, data) {
        const values = Object.values(data).map(value =>
            value === null || value === undefined ? 'NULL' :
                typeof value === 'string' ? `'${value}'` : value
        ).join(', ');

        this.connection.query(`INSERT INTO ${database}.${table} (${keys}) VALUES (${values})`, (err, result) => {
            if (err) throw err;
        });
    }

    selectDataBybuildingID(database, table, id) {
        return new Promise((resolve, reject) => {
            this.connection.query(`SELECT * FROM ${database}.${table} WHERE buildingID = ${id}`, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }

    selectAllBuildings(database, table) {
        return new Promise((resolve, reject) => {
            this.connection.query(`SELECT * FROM ${database}.${table}`, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }

    dropTable(database, table) {
        this.connection.query(`DROP TABLE ${database}.${table}`, (err, result) => {
            if (err) throw err;
            console.log("Table dropped");
        });
    }

    close() {
        this.connection.end();
    }

}

export default DB;

