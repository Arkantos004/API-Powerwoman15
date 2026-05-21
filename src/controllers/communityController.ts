import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Obtener todos los posts con información del usuario
export const getAllPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT 
        p.id,
        p.user_id,
        p.content,
        p.created_at,
        u.full_name,
        u.profile_image_url,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comments_count,
        (SELECT COUNT(*) > 0 FROM post_likes WHERE post_id = p.id AND user_id = $1)::boolean as is_liked_by_user
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 50`,
      [req.userId || null]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error obteniendo posts:', error);
    res.status(500).json({ success: false, error: 'Error al obtener posts' });
  }
};

// Obtener un post con sus comentarios
export const getPostById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const postResult = await query(
      `SELECT 
        p.id,
        p.user_id,
        p.content,
        p.created_at,
        u.full_name,
        u.profile_image_url,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comments_count,
        (SELECT COUNT(*) > 0 FROM post_likes WHERE post_id = p.id AND user_id = $1)::boolean as is_liked_by_user
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $2`,
      [req.userId || null, id]
    );

    if (postResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Post no encontrado' });
      return;
    }

    const commentsResult = await query(
      `SELECT 
        pc.id,
        pc.user_id,
        pc.content,
        pc.created_at,
        u.full_name,
        u.profile_image_url
      FROM post_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.post_id = $1
      ORDER BY pc.created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...postResult.rows[0],
        comments: commentsResult.rows,
      },
    });
  } catch (error) {
    console.error('Error obteniendo post:', error);
    res.status(500).json({ success: false, error: 'Error al obtener post' });
  }
};

// Crear un nuevo post
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'El contenido del post es requerido',
      });
      return;
    }

    if (content.length > 5000) {
      res.status(400).json({
        success: false,
        error: 'El contenido del post no puede exceder 5000 caracteres',
      });
      return;
    }

    const result = await query(
      `INSERT INTO posts (user_id, content) 
       VALUES ($1, $2) 
       RETURNING *`,
      [req.userId, content.trim()]
    );

    // Obtener el post con información del usuario
    const fullPostResult = await query(
      `SELECT 
        p.id,
        p.user_id,
        p.content,
        p.created_at,
        u.full_name,
        u.profile_image_url,
        0 as likes_count,
        0 as comments_count,
        false as is_liked_by_user
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({
      success: true,
      message: 'Post creado exitosamente',
      data: fullPostResult.rows[0],
    });
  } catch (error) {
    console.error('Error creando post:', error);
    res.status(500).json({ success: false, error: 'Error al crear post' });
  }
};

// Actualizar un post
export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'El contenido del post es requerido',
      });
      return;
    }

    // Verificar que el post pertenezca al usuario
    const checkResult = await query('SELECT user_id FROM posts WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Post no encontrado' });
      return;
    }

    if (checkResult.rows[0].user_id !== req.userId) {
      res.status(403).json({ success: false, error: 'No tienes permiso para editar este post' });
      return;
    }

    const result = await query(
      `UPDATE posts SET content = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [content.trim(), id]
    );

    res.json({
      success: true,
      message: 'Post actualizado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error actualizando post:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar post' });
  }
};

// Eliminar un post
export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar que el post pertenezca al usuario
    const checkResult = await query('SELECT user_id FROM posts WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Post no encontrado' });
      return;
    }

    if (checkResult.rows[0].user_id !== req.userId) {
      res.status(403).json({ success: false, error: 'No tienes permiso para eliminar este post' });
      return;
    }

    await query('DELETE FROM posts WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Post eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando post:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar post' });
  }
};

// Crear un comentario en un post
export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'El contenido del comentario es requerido',
      });
      return;
    }

    // Verificar que el post existe
    const postResult = await query('SELECT id FROM posts WHERE id = $1', [postId]);
    
    if (postResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Post no encontrado' });
      return;
    }

    const result = await query(
      `INSERT INTO post_comments (post_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [postId, req.userId, content.trim()]
    );

    // Obtener el comentario con información del usuario
    const fullCommentResult = await query(
      `SELECT 
        pc.id,
        pc.post_id,
        pc.user_id,
        pc.content,
        pc.created_at,
        u.full_name,
        u.profile_image_url
      FROM post_comments pc
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
    console.error('Error creando comentario:', error);
    res.status(500).json({ success: false, error: 'Error al crear comentario' });
  }
};

// Like a post
export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: postId } = req.params;

    // Verificar que el post existe
    const postResult = await query('SELECT id FROM posts WHERE id = $1', [postId]);
    
    if (postResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Post no encontrado' });
      return;
    }

    // Verificar si ya existe el like
    const existingLike = await query(
      'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [postId, req.userId]
    );

    if (existingLike.rows.length > 0) {
      res.status(400).json({ success: false, error: 'Ya has dado like a este post' });
      return;
    }

    await query(
      'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
      [postId, req.userId]
    );

    // Obtener conteo actualizado de likes
    const likesResult = await query(
      'SELECT COUNT(*) as likes_count FROM post_likes WHERE post_id = $1',
      [postId]
    );

    res.json({
      success: true,
      message: 'Like agregado exitosamente',
      data: {
        likes_count: parseInt(likesResult.rows[0].likes_count),
      },
    });
  } catch (error) {
    console.error('Error dando like:', error);
    res.status(500).json({ success: false, error: 'Error al dar like' });
  }
};

// Unlike a post
export const unlikePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: postId } = req.params;

    const result = await query(
      'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2 RETURNING id',
      [postId, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ success: false, error: 'No has dado like a este post' });
      return;
    }

    // Obtener conteo actualizado de likes
    const likesResult = await query(
      'SELECT COUNT(*) as likes_count FROM post_likes WHERE post_id = $1',
      [postId]
    );

    res.json({
      success: true,
      message: 'Like removido exitosamente',
      data: {
        likes_count: parseInt(likesResult.rows[0].likes_count),
      },
    });
  } catch (error) {
    console.error('Error removiendo like:', error);
    res.status(500).json({ success: false, error: 'Error al remover like' });
  }
};
