import express from "express";
import gameRoute from "./routes/game.ts"

const PORT = 3000;

const app = express();

app.get('/', gameRoute);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
