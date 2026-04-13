import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import uploadRoutes from './routes/uploadRoutes';
import courseRoutes from './routes/courseRoutes';
import { errorHandler } from './middleware/auth';

dotenv.config();

const app: Application = express();

// Middleware
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir carpeta uploads como contenido estático
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/courses', courseRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'API POWERWOMAN funcionando ✅' });
});

// Manejo de errores
app.use(errorHandler);

// Manejo de 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 API POWERWOMAN - ${process.env.NODE_ENV || 'development'}`);
});
