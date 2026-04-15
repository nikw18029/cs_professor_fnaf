import { Router } from 'express';
import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import type { Db } from "mongodb";

const router = Router();
const COLLECTION = 'saves';
const COOKIE_NAME = 'id';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 14; // 2 weeks

/**Gets or assigns client id cookie */
function getClientId(req: Request, res: Response): string {
  let id = req.cookies?.[COOKIE_NAME];
  if (!id) {
    id = randomUUID();
    res.cookie(COOKIE_NAME, id, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      sameSite: "strict",
    });
  }
  return id;
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const clientId = getClientId(req, res);
    const db: Db = req.app.locals.db;

    await db.collection(COLLECTION).updateOne(
      { clientId },
      { $set: { clientId, state: req.body, updatedAt: new Date() } },
      { upsert: true }  // create if DNE
    );

    res.json({ success: true, clientId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save game state" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const clientId = getClientId(req, res);
    const db: Db = req.app.locals.db;

    const doc = await db.collection(COLLECTION).findOne({ clientId });

    if (!doc) {
      return res.status(404).json(null);
    }

    res.json(doc.state);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load game state" });
  }
});

export default router;