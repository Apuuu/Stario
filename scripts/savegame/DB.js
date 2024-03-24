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

    addColumn(database, table, columnname, type) {
        this.connection.query(`ALTER TABLE ${database}.${table} ADD COLUMN ${columnname} ${type}`, (err, result) => {
            if (err) throw err;
            console.log("Column added");
        });
    }

    insertData(database, table, keys, data) {
        const values = Object.values(data).map(value => 
            typeof value === 'string' ? `'${value}'` : value
        ).join(', ');
    
        this.connection.query(`INSERT INTO ${database}.${table} (${keys}) VALUES (${values})`, (err, result) => {
            if (err) throw err;
            console.log("Data inserted");
        });
    }

    dropTable(database, table) {
        this.connection.query(`DROP TABLE ${database}.${table}`, (err, result) => {
            if (err) throw err;
            console.log("Table dropped");
        });
    }

    showDatabases() {
        this.connection.query("SHOW DATABASES", (err, results) => {
            if (err) throw err;
            console.log("Databases:", results);
        });
    }

    close() {
        this.connection.end();
    }

}

export default DB;

