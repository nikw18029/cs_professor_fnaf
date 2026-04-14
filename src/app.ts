import express from "express";
import gameRoute from "./routes/game.js";
import saveApi from "./api/saves.js"

const PORT = 3000;

const app = express();

app.use(express.json());
app.use(express.static('public')); // Statically serve pages
app.use(express.static('dist/client')); // Statically serve JS files
app.use('/api/save', saveApi);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});