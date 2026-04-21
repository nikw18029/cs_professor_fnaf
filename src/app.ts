import express from "express";
import initRoute from "./routes/init.js";
import saveApi from "./api/saves.js"
import cookieParser from "cookie-parser";
import { MongoClient } from 'mongodb';

const app = express();

const PORT = 3000;
const MONGO_URI = "mongodb://localhost:27017";  // probably shouldn't be this
const DB_NAME = "sessions";

const client = new MongoClient(MONGO_URI);
await client.connect();
const db = client.db(DB_NAME);
app.locals.db = db;

app.use(cookieParser());
app.use(express.json());
app.use(express.static('public', { index: false })); // Statically serve pages, don't auto serve index
app.use(express.static('dist/client')); // Statically serve JS files
app.use('/api/save', saveApi);
app.use('/', initRoute);    // client initialization logic. This serves the first html page

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});