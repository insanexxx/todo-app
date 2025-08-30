import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from './env';
import {IRequestUser} from "./types/user";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'NO_AUTH' });
  }

  try {
    const token = header.substring('Bearer '.length);
    const payload = jwt.verify(token, env.JWT_SECRET) as IRequestUser;
    req.user = payload;
    next();
  } 
  catch {
    return res.status(401).json({ error: 'BAD_TOKEN' });
  }
}
