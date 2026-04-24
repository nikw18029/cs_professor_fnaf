import { Router } from 'express';
import type { Request, Response } from "express";
import type { Db } from "mongodb";
import { verifyAuth, AuthPayload } from './auth.js';

const router = Router();
const COLLECTION = 'saves';

router.use(verifyAuth); // protect this route. soooo much simpler this way

router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).user as AuthPayload;  // accessing from express object with voodoo
    const db: Db = req.app.locals.db;

    await db.collection(COLLECTION).updateOne(  // save or create
      { userId },
      { $set: { userId, state: req.body, updatedAt: new Date() } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save game state' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { userId } = (req as any).user as AuthPayload;
    const state = await loadSaveForClient(req, userId);
    if (!state) return res.status(404).json(null);
    res.json(state);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load game state' });
  }
});

export async function loadSaveForClient(req: Request, id: string) { // load from mongo
  const db: Db = req.app.locals.db;
  const doc = await db.collection(COLLECTION).findOne({ id });
  return doc?.state ?? null;
}

export default router;