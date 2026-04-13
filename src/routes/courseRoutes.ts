import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authMiddleware } from '../middleware/auth';
import courseModuleRoutes from './courseModuleRoutes';
import courseLessonRoutes from './courseLessonRoutes';

const router = Router();

/**
 * GET /api/courses - Get all courses (published only for non-instructors)
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT c.*, u.full_name as instructor_name
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.is_published = true
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/courses/instructor - Get courses for current instructor
 */
router.get('/instructor/my-courses', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    
    // Verificar que es instructora
    const userCheck = await pool.query(
      'SELECT is_instructor, instructor_approved FROM users WHERE id = $1',
      [userId]
    );
    
    if (!userCheck.rows[0]?.is_instructor || !userCheck.rows[0]?.instructor_approved) {
      res.status(403).json({ error: 'No eres una instructora aprobada' });
      return;
    }
    
    const query = `
      SELECT * FROM courses
      WHERE instructor_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/courses/:courseId - Get single course with modules and lessons
 */
router.get('/:courseId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    
    // Obtener curso
    const courseQuery = `
      SELECT c.*, u.full_name as instructor_name
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.id = $1
    `;
    const courseResult = await pool.query(courseQuery, [courseId]);
    
    if (courseResult.rows.length === 0) {
      res.status(404).json({ error: 'Curso no encontrado' });
      return;
    }
    
    const course = courseResult.rows[0];
    
    // Obtener módulos y lecciones
    const modulesQuery = `
      SELECT m.*, 
        (SELECT json_agg(json_build_object(
          'id', l.id,
          'title', l.title,
          'description', l.description,
          'video_url', l.video_url,
          'video_type', l.video_type,
          'duration_minutes', l.duration_minutes,
          'order_number', l.order_number
        ) ORDER BY l.order_number)
        FROM course_lessons l WHERE l.module_id = m.id) as lessons
      FROM course_modules m
      WHERE m.course_id = $1
      ORDER BY m.order_number
    `;
    const modulesResult = await pool.query(modulesQuery, [courseId]);
    
    res.json({ 
      success: true, 
      data: {
        ...course,
        modules: modulesResult.rows
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/courses - Create new course (instructor only)
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { title, description, image_url, price_cop } = req.body;
    
    // Verificar que es instructora aprobada
    const userCheck = await pool.query(
      'SELECT is_instructor, instructor_approved FROM users WHERE id = $1',
      [userId]
    );
    
    if (!userCheck.rows[0]?.is_instructor || !userCheck.rows[0]?.instructor_approved) {
      res.status(403).json({ error: 'No eres una instructora aprobada' });
      return;
    }
    
    if (!title) {
      res.status(400).json({ error: 'El título es requerido' });
      return;
    }
    
    const query = `
      INSERT INTO courses (instructor_id, title, description, image_url, price_cop)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, title, description, image_url, price_cop || 0]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/courses/:courseId - Update course (instructor only)
 */
router.put('/:courseId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { courseId } = req.params;
    const { title, description, image_url, price_cop, is_published } = req.body;
    
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
    
    const query = `
      UPDATE courses
      SET title = $1, description = $2, image_url = $3, price_cop = $4, is_published = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    const result = await pool.query(query, [title, description, image_url, price_cop, is_published, courseId]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/courses/:courseId - Delete course (instructor only)
 */
router.delete('/:courseId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { courseId } = req.params;
    
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
      res.status(403).json({ error: 'No puedes eliminar este curso' });
      return;
    }
    
    await pool.query('DELETE FROM courses WHERE id = $1', [courseId]);
    res.json({ success: true, message: 'Curso eliminado' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Sub-rutas de módulos y lecciones
router.use('/:courseId/modules', courseModuleRoutes);
router.use('/:courseId/modules/:moduleId/lessons', courseLessonRoutes);

export default router;
