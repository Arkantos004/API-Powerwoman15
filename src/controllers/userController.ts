import { Request, Response } from 'express';
import { query } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, LoginRequest, RegisterRequest, ApiResponse } from '../types';

// Registrar nuevo usuario
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, full_name, password, phone, address, city, country, postal_code } = req.body as RegisterRequest;

    // Validar campos requeridos
    if (!email || !full_name || !password) {
      res.status(400).json({
        success: false,
        error: 'Email, nombre y contraseña son requeridos',
      });
      return;
    }

    // Verificar si el usuario ya existe
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      res.status(409).json({
        success: false,
        error: 'El email ya está registrado',
      });
      return;
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = await query(
      'INSERT INTO users (email, full_name, password_hash, phone, address, city, country, postal_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, full_name, phone, address, city, country, postal_code, is_admin, created_at',
      [email, full_name, hashedPassword, phone || null, address || null, city || null, country || null, postal_code || null]
    );

    const user = result.rows[0];

    // Generar JWT
    const token = (jwt.sign as any)(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user,
        token,
      },
    });
  } catch (error: any) {
    console.error('Error en registro:', error);
    res.status(500).json({ success: false, error: 'Error al registrar usuario' });
  }
};

// Login de usuario
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validar campos
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos',
      });
      return;
    }

    // Buscar usuario
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Usuario o contraseña inválidos',
      });
      return;
    }

    const user = result.rows[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        error: 'Usuario o contraseña inválidos',
      });
      return;
    }

    // Generar JWT
    const token = (jwt.sign as any)(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          is_admin: user.is_admin,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, error: 'Error al iniciar sesión' });
  }
};

// Obtener perfil del usuario
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const result = await query(
      'SELECT id, email, full_name, phone, address, city, country, postal_code, profile_image_url, is_admin, is_instructor, instructor_approved, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ success: false, error: 'Error al obtener perfil' });
  }
};

// Actualizar perfil del usuario
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { full_name, phone, address, city, country, postal_code } = req.body;

    const result = await query(
      'UPDATE users SET full_name = $1, phone = $2, address = $3, city = $4, country = $5, postal_code = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING id, email, full_name, phone, address, city, country, postal_code',
      [full_name, phone, address, city, country, postal_code, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar perfil' });
  }
};

// Obtener todos los usuarios (solo admin)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT id, email, full_name, is_admin, is_active, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ success: false, error: 'Error al obtener usuarios' });
  }
};

// Solicitar ser instructora
export const requestInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    // Verificar si ya solicitó
    const checkRequest = await query(
      'SELECT is_instructor, instructor_approved FROM users WHERE id = $1',
      [userId]
    );

    if (checkRequest.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    const user = checkRequest.rows[0];

    if (user.is_instructor) {
      res.status(400).json({ success: false, error: 'Ya eres instructora' });
      return;
    }

    // Actualizar solicitud
    const result = await query(
      'UPDATE users SET is_instructor = true, instructor_request_date = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, email, full_name, is_instructor, instructor_approved',
      [userId]
    );

    res.json({
      success: true,
      message: 'Solicitud de instructora registrada. El admin la revisará pronto.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error solicitando instructor:', error);
    res.status(500).json({ success: false, error: 'Error al solicitar ser instructora' });
  }
};

// Obtener solicitudes de instructoras (solo admin)
export const getInstructorRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT id, email, full_name, instructor_request_date FROM users WHERE is_instructor = true AND instructor_approved = false ORDER BY instructor_request_date DESC'
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    res.status(500).json({ success: false, error: 'Error al obtener solicitudes' });
  }
};

// Aprobar instructora (solo admin)
export const approveInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const result = await query(
      'UPDATE users SET instructor_approved = true WHERE id = $1 RETURNING id, email, full_name, is_instructor, instructor_approved',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      success: true,
      message: 'Instructora aprobada exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error aprobando instructora:', error);
    res.status(500).json({ success: false, error: 'Error al aprobar instructora' });
  }
};

// Rechazar solicitud de instructora (solo admin)
export const rejectInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const result = await query(
      'UPDATE users SET is_instructor = false, instructor_approved = false, instructor_request_date = NULL WHERE id = $1 RETURNING id, email, full_name, is_instructor, instructor_approved',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      success: true,
      message: 'Solicitud de instructora rechazada',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error rechazando instructora:', error);
    res.status(500).json({ success: false, error: 'Error al rechazar solicitud' });
  }
};
