import mysql from "mysql2";
import { usersSchema, decksSchema, cardsSchema, likesSchema } from "./schema";
const util = require("util");

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

export const connectDatabase = async () => {
    try {
        await connection.connect();
        console.log("MySQL connected");
        connection.query = util.promisify(connection.query);
    } catch (e: unknown) {
        if (e instanceof Error) {
            throw new Error(e.message);
        }
    }
};

export const createTables = async () => {
    try {
        await connection.query(`create table if not exists ${usersSchema}`);
        await connection.query(`create table if not exists ${decksSchema}`);
        await connection.query(`create table if not exists ${cardsSchema}`);
        await connection.query(`create table if not exists ${likesSchema}`);
    } catch (e: unknown) {
        if (e instanceof Error) {
            throw new Error(e.message);
        }
    }
};

export default connection;
