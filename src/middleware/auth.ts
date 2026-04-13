import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';

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

// Middleware para verificar que es admin
export const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
    }

    // Verificar en la BD que es admin
    const result = await query('SELECT is_admin FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    if (!result.rows[0].is_admin) {
      return res.status(403).json({ success: false, error: 'Acceso denegado: se requieren permisos de administrador' });
    }

    next();
  } catch (error) {
    console.error('Error en adminMiddleware:', error);
    return res.status(500).json({ success: false, error: 'Error al verificar permisos de admin' });
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
