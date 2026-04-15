import express from 'express';
import type { Request, Response } from "express";
import path from "path";

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

export default router;