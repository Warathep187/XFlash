import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
require("dotenv").config();

import UserRoute from "./routes/user";
import DeckRoute from "./routes/deck";
import CardRoute from "./routes/card";

import { connectRedis } from "./services/redis-actions";
import { connectDatabase, createTables } from "./mysql_connection";

const app = express();

app.use(bodyParser.json({ limit: "5mb" }));
app.use(cors());
app.use(morgan("dev"));

app.use("/api", UserRoute);
app.use("/api", DeckRoute);
app.use("/api", CardRoute);

app.listen(process.env.PORT, async () => {
    console.log(`Server  is running on port ${process.env.PORT}`);
    await connectDatabase();
    await createTables();
    await connectRedis();
});
