import express from "express";
import gameRoute from "./routes/game.js";

const PORT = 3000;

const app = express();

app.use(express.static('public')); // Statically serve pages
app.use(express.static('dist/client')); // Statically serve JS files

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});