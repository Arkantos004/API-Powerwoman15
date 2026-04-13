"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.adminMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, error: 'Token no proporcionado' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, error: 'Token inválido o expirado' });
    }
};
exports.authMiddleware = authMiddleware;
// Middleware para verificar que es admin
const adminMiddleware = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        }
        // Verificar en la BD que es admin
        const result = await (0, database_1.query)('SELECT is_admin FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }
        if (!result.rows[0].is_admin) {
            return res.status(403).json({ success: false, error: 'Acceso denegado: se requieren permisos de administrador' });
        }
        next();
    }
    catch (error) {
        console.error('Error en adminMiddleware:', error);
        return res.status(500).json({ success: false, error: 'Error al verificar permisos de admin' });
    }
};
exports.adminMiddleware = adminMiddleware;
const errorHandler = (err, req, res, next) => {
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
exports.errorHandler = errorHandler;
//# sourceMappingURL=auth.js.map