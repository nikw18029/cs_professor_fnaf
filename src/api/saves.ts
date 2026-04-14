import { Router } from 'express';
import type { Request, Response } from "express";
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  try {
    const savePath = path.resolve('game-save.json');
    writeFileSync(savePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save game state' });
  }
});

router.get('/', (req: Request, res: Response) => {
  try {
    const savePath = path.resolve('game-save.json');
    const data = readFileSync(savePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load game state' });
  }
});

export default router;