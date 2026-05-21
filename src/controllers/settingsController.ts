import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Obtener todas las configuraciones del sitio
export const getSiteSettings = async (req: any, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT setting_key, setting_value FROM site_settings');

    const settings: Record<string, any> = {};
    result.rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error obteniendo configuraciones:', error);
    res.status(500).json({ success: false, error: 'Error al obtener configuraciones' });
  }
};

// Obtener una configuración específica
export const getSiteSetting = async (req: any, res: Response): Promise<void> => {
  try {
    const { key } = req.params;

    const result = await query('SELECT setting_key, setting_value FROM site_settings WHERE setting_key = $1', [key]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Configuración no encontrada' });
      return;
    }

    res.json({
      success: true,
      data: {
        key: result.rows[0].setting_key,
        value: result.rows[0].setting_value,
      },
    });
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({ success: false, error: 'Error al obtener configuración' });
  }
};

// Actualizar una configuración (admin only)
export const updateSiteSetting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    // Validar que sea una URL válida si es un campo de video
    if (key === 'hero_video_url' && value && value.trim().length > 0) {
      try {
        new URL(value);
      } catch {
        res.status(400).json({
          success: false,
          error: 'URL inválida',
        });
        return;
      }
    }

    const result = await query(
      `UPDATE site_settings 
       SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
       WHERE setting_key = $2 
       RETURNING setting_key, setting_value`,
      [value || null, key]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Configuración no encontrada' });
      return;
    }

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      data: {
        key: result.rows[0].setting_key,
        value: result.rows[0].setting_value,
      },
    });
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar configuración' });
  }
};
