import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface JwtPayload { id: string; }

export const protect = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) { res.status(401).json({ error: 'Not authorized' }); return; }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch {
    res.status(401).json({ error: 'Token invalid' });
  }
};
