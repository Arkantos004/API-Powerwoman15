import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

// ============ COURSE COMMENTS ============

export const getCourseComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const result = await query(
      `SELECT 
        cc.id,
        cc.course_id,
        cc.user_id,
        cc.content,
        cc.created_at,
        u.full_name,
        u.profile_image_url
      FROM course_comments cc
      JOIN users u ON cc.user_id = u.id
      WHERE cc.course_id = $1
      ORDER BY cc.created_at DESC`,
      [courseId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error obteniendo comentarios del curso:', error);
    res.status(500).json({ success: false, error: 'Error al obtener comentarios' });
  }
};

export const createCourseComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'El comentario no puede estar vacío',
      });
      return;
    }

    if (content.length > 2000) {
      res.status(400).json({
        success: false,
        error: 'El comentario no puede exceder 2000 caracteres',
      });
      return;
    }

    // Verificar que el curso existe
    const courseResult = await query('SELECT id FROM courses WHERE id = $1', [courseId]);
    if (courseResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Curso no encontrado' });
      return;
    }

    const result = await query(
      `INSERT INTO course_comments (course_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [courseId, req.userId, content.trim()]
    );

    // Obtener el comentario con información del usuario
    const fullCommentResult = await query(
      `SELECT 
        cc.id,
        cc.course_id,
        cc.user_id,
        cc.content,
        cc.created_at,
        u.full_name,
        u.profile_image_url
      FROM course_comments cc
      JOIN users u ON cc.user_id = u.id
      WHERE cc.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente',
      data: fullCommentResult.rows[0],
    });
  } catch (error) {
    console.error('Error creando comentario en curso:', error);
    res.status(500).json({ success: false, error: 'Error al crear comentario' });
  }
};

export const deleteCourseComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, commentId } = req.params;

    // Verificar que el comentario pertenezca al usuario
    const checkResult = await query(
      'SELECT user_id FROM course_comments WHERE id = $1 AND course_id = $2',
      [commentId, courseId]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Comentario no encontrado' });
      return;
    }

    if (checkResult.rows[0].user_id !== req.userId) {
      res.status(403).json({ success: false, error: 'No tienes permiso para eliminar este comentario' });
      return;
    }

    await query('DELETE FROM course_comments WHERE id = $1', [commentId]);

    res.json({
      success: true,
      message: 'Comentario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando comentario del curso:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar comentario' });
  }
};

// ============ PRODUCT COMMENTS ============

export const getProductComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const result = await query(
      `SELECT 
        pc.id,
        pc.product_id,
        pc.user_id,
        pc.content,
        pc.created_at,
        u.full_name,
        u.profile_image_url
      FROM product_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.product_id = $1
      ORDER BY pc.created_at DESC`,
      [productId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error obteniendo comentarios del producto:', error);
    res.status(500).json({ success: false, error: 'Error al obtener comentarios' });
  }
};

export const createProductComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'El comentario no puede estar vacío',
      });
      return;
    }

    if (content.length > 2000) {
      res.status(400).json({
        success: false,
        error: 'El comentario no puede exceder 2000 caracteres',
      });
      return;
    }

    // Verificar que el producto existe
    const productResult = await query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Producto no encontrado' });
      return;
    }

    const result = await query(
      `INSERT INTO product_comments (product_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [productId, req.userId, content.trim()]
    );

    // Obtener el comentario con información del usuario
    const fullCommentResult = await query(
      `SELECT 
        pc.id,
        pc.product_id,
        pc.user_id,
        pc.content,
        pc.created_at,
        u.full_name,
        u.profile_image_url
      FROM product_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente',
      data: fullCommentResult.rows[0],
    });
  } catch (error) {
    console.error('Error creando comentario en producto:', error);
    res.status(500).json({ success: false, error: 'Error al crear comentario' });
  }
};

export const deleteProductComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, commentId } = req.params;

    // Verificar que el comentario pertenezca al usuario
    const checkResult = await query(
      'SELECT user_id FROM product_comments WHERE id = $1 AND product_id = $2',
      [commentId, productId]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Comentario no encontrado' });
      return;
    }

    if (checkResult.rows[0].user_id !== req.userId) {
      res.status(403).json({ success: false, error: 'No tienes permiso para eliminar este comentario' });
      return;
    }

    await query('DELETE FROM product_comments WHERE id = $1', [commentId]);

    res.json({
      success: true,
      message: 'Comentario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando comentario del producto:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar comentario' });
  }
};
