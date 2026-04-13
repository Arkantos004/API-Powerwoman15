import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Genera un nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Solo aceptar imágenes
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'));
    }
  }
});

// Ruta para subir imagen
router.post(
  '/image',
  upload.single('file'),
  (req: Request, res: Response): void => {
    const file = (req as any).file;
    
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Construir URL completa del servidor
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';
    const imageUrl = `${protocol}://${host}/uploads/${file.filename}`;
    
    res.json({
      success: true,
      message: 'Imagen subida correctamente',
      url: imageUrl,
      filename: file.filename
    });
  }
);

export default router;
