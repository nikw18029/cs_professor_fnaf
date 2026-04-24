import express from 'express';
import type { Request, Response } from "express";
import path from "path";
import { loadSaveForClient } from '../api/saves.js';
import { getUserFromToken } from '../api/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const user = getUserFromToken(req); // we will get user iff token is set
        if (!user) {
            return res.sendFile(path.join(process.cwd(), 'public', 'login.html'));  // no token -> login
        } else if (user == 'guest') res.sendFile(path.join(process.cwd(), 'public', 'new-game.html'));  // guest send to new game

        const save = await loadSaveForClient(req, user.userId); // try get save
        const file = save && !save.playerKilled ? 'load-game.html' : 'new-game.html';   // depending on if we get a save load or new game send
        res.sendFile(path.join(process.cwd(), 'public', file));
    } catch (err) {
        console.error(err);
        res.status(500).send('Init failed');
    }
});

export default router;