import express from "express";
import gameRoute from "./routes/game.js";

const PORT = 3000;

const app = express();

app.use(express.static('../public2'));
app.use('/game', gameRoute);        // for this tiny example go to localhost:3000/game

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});