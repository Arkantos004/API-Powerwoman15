import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = (decoded as any).id;
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token inválido o expirado' });
  }
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);

  if (err.code === '23505') {
    res.status(409).json({ success: false, error: 'El registro ya existe' });
    return;
  }

  if (err.code === '42P01') {
    res.status(400).json({ success: false, error: 'Tabla no encontrada' });
    return;
  }

  res.status(500).json({ success: false, error: 'Error interno del servidor' });
};
