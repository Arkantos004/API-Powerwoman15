import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authMiddleware } from '../middleware/auth';

const router = Router({ mergeParams: true });

/**
 * POST /api/courses/:courseId/modules/:moduleId/lessons - Create lesson
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { courseId, moduleId } = req.params;
    const { title, description, video_url, video_type, duration_minutes, order_number } = req.body;
    
    // Verificar que es la instructora del curso
    const courseCheck = await pool.query(
      'SELECT instructor_id FROM courses WHERE id = $1',
      [courseId]
    );
    
    if (courseCheck.rows[0]?.instructor_id !== userId) {
      res.status(403).json({ error: 'No puedes editar este curso' });
      return;
    }
    
    if (!title) {
      res.status(400).json({ error: 'El título es requerido' });
      return;
    }
    
    const query = `
      INSERT INTO course_lessons (module_id, title, description, video_url, video_type, duration_minutes, order_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(
      query,
      [moduleId, title, description, video_url, video_type, duration_minutes, order_number]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/courses/:courseId/modules/:moduleId/lessons/:lessonId - Update lesson
 */
router.put('/:lessonId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { courseId, moduleId, lessonId } = req.params;
    const { title, description, video_url, video_type, duration_minutes, order_number } = req.body;
    
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
      UPDATE course_lessons
      SET title = $1, description = $2, video_url = $3, video_type = $4, duration_minutes = $5, order_number = $6
      WHERE id = $7
      RETURNING *
    `;
    const result = await pool.query(
      query,
      [title, description, video_url, video_type, duration_minutes, order_number, lessonId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/courses/:courseId/modules/:moduleId/lessons/:lessonId - Delete lesson
 */
router.delete('/:lessonId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { courseId, moduleId, lessonId } = req.params;
    
    // Verificar que es la instructora del curso
    const courseCheck = await pool.query(
      'SELECT instructor_id FROM courses WHERE id = $1',
      [courseId]
    );
    
    if (courseCheck.rows[0]?.instructor_id !== userId) {
      res.status(403).json({ error: 'No puedes editar este curso' });
      return;
    }
    
    await pool.query('DELETE FROM course_lessons WHERE id = $1', [lessonId]);
    res.json({ success: true, message: 'Lección eliminada' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
