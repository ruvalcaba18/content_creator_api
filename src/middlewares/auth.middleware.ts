import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['x-api-key'];

  if (key !== config.apiKey) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  next();
};
