import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
require("dotenv").config();
import connection from "./mysql_connection";

const app = express();

app.use(bodyParser.json({limit: "5mb"}));
app.use(cors());
app.use(morgan("dev"));

connection.end();

app.listen(process.env.PORT, () => console.log(`Server  is running on port ${process.env.PORT}`));