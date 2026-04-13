import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authMiddleware } from '../middleware/auth';

const router = Router({ mergeParams: true });

/**
 * POST /api/courses/:courseId/modules - Create module
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { courseId } = req.params;
    const { title, description, order_number } = req.body;
    
    // Verificar que es la instructora del curso
    const courseCheck = await pool.query(
      'SELECT instructor_id FROM courses WHERE id = $1',
      [courseId]
    );
    
    if (courseCheck.rows.length === 0) {
      res.status(404).json({ error: 'Curso no encontrado' });
      return;
    }
    
    if (courseCheck.rows[0].instructor_id !== userId) {
      res.status(403).json({ error: 'No puedes editar este curso' });
      return;
    }
    
    if (!title) {
      res.status(400).json({ error: 'El título es requerido' });
      return;
    }
    
    const query = `
      INSERT INTO course_modules (course_id, title, description, order_number)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [courseId, title, description, order_number]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/courses/:courseId/modules/:moduleId - Update module
 */
router.put('/:moduleId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { courseId, moduleId } = req.params;
    const { title, description, order_number } = req.body;
    
    // Verificar que es la instructora del curso
    const courseCheck = await pool.query(
      'SELECT instructor_id FROM courses WHERE id = $1',
      [courseId]
    );
    
    if (courseCheck.rows[0]?.instructor_id !== userId) {
      res.status(403).json({ error: 'No puedes editar este curso' });
      return;
    }
    
    const query = `
      UPDATE course_modules
      SET title = $1, description = $2, order_number = $3
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [title, description, order_number, moduleId]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/courses/:courseId/modules/:moduleId - Delete module
 */
router.delete('/:moduleId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { courseId, moduleId } = req.params;
    
    // Verificar que es la instructora del curso
    const courseCheck = await pool.query(
      'SELECT instructor_id FROM courses WHERE id = $1',
      [courseId]
    );
    
    if (courseCheck.rows[0]?.instructor_id !== userId) {
      res.status(403).json({ error: 'No puedes editar este curso' });
      return;
    }
    
    await pool.query('DELETE FROM course_modules WHERE id = $1', [moduleId]);
    res.json({ success: true, message: 'Módulo eliminado' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
