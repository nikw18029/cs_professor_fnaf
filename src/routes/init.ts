import express from 'express';
import type { Request, Response } from "express";
import path from "path";
import { loadSaveForClient } from '../api/saves.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const save = await loadSaveForClient(req, res); // need to pass in req for cookies
        const file = save ? 'load-game.html' : 'new-game.html';
        res.sendFile(path.join(process.cwd(), 'public', file));
    } catch (err) {
        console.error(err);
        res.status(500).send('Init failed');
    }
});

export default router;

// All this does is check to see if there is a game state for the client, if so we need to send the client
// to load game screen. Otherwise send to new game screen.