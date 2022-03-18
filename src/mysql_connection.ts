import mysql from "mysql2";
import { usersSchema } from "./schema";
const util = require("util");

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

const connectDatabase = async () => {
    try {
        await connection.connect();
        console.log("MySQL connected");
    } catch (e: unknown) {
        if (e instanceof Error) {
            throw new Error(e.message);
        }
    }
};

const createTables = async () => {
    try {
        await connection.query(`create table if not exists ${usersSchema}`);
    } catch (e: unknown) {
        if (e instanceof Error) {
            throw new Error(e.message);
        }
    }
};

connection.query = util.promisify(connection.query);
connectDatabase();
createTables();

export default connection;
