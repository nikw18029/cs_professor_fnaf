import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { Db } from 'mongodb';
import crypto from "crypto";
import jwt from 'jsonwebtoken';

const router = Router();
const USERS = 'users';
const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 14; // 2 weeks
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'; // in an actual deployment this would need to be an env

export interface AuthPayload { userId: string; username: string; }

function sign(payload: AuthPayload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: COOKIE_MAX_AGE });
}

function setCookie(res: Response, tokenPayload: string) {
    res.cookie(COOKIE_NAME, tokenPayload, {
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE,
        sameSite: 'strict'
    })
}

router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body ?? {};
        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

        // is username taken
        const db: Db = req.app.locals.db;
        if (await db.collection(USERS).findOne({ username })) {
            return res.status(409).json({ error: 'Username taken' });
        }

        // store credentials
        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
        const { insertedId } = await db.collection(USERS).insertOne({
            username, passwordHash, salt, createdAt: new Date(),
        });

        // set cookie
        setCookie(res, sign({ userId: insertedId.toString(), username }));
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Signup failed' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    // fetch user credentials
    const db: Db = req.app.locals.db;
    const user = await db.collection(USERS).findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // compare passwords
    const loginHash = crypto.pbkdf2Sync(password, user.salt, 100000, 64, 'sha512').toString('hex');
    if (loginHash != user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // all good -> create JWT
    setCookie(res, sign({ userId: user._id.toString(), username }));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME); // revoke jwt
  res.json({ success: true });
});

router.post('/guest', async (req: Request, res: Response) => {
    try {
        // just set a cookie denoting client as a guest
        res.cookie(COOKIE_NAME, "guest", {
          httpOnly: true,
          maxAge: COOKIE_MAX_AGE,
          sameSite: 'strict'
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Guest failed auth' });
    }
});

/** Middleware, 401s if no valid JWT. Attaches decoded payload to req.user to make protected routes a little easier. */
export function verifyAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    (req as any).user = jwt.verify(token, JWT_SECRET) as AuthPayload;   // decode payload and store in the actual req object, not cookies or anyting else
                                                                        // this separates the logic a little nicer for the save route. since it doesn't have to call
                                                                        // methods from crypto.
    next(); // fall through to other express handlers
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/** Non-throwing helper for places that need to peek at auth. */
export function getUserFromToken(req: Request) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try { 
    if(token == 'guest') return token;  // guest

    return jwt.verify(token, JWT_SECRET) as AuthPayload;  // registered user
  }
  catch { return null; }
}

export default router;