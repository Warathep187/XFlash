import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
require("dotenv").config();

import UserRouter from "./routes/user";

const app = express();

app.use(bodyParser.json({limit: "5mb"}));
app.use(cors());
app.use(morgan("dev"));

app.use(UserRouter);

app.listen(process.env.PORT, () => console.log(`Server  is running on port ${process.env.PORT}`));