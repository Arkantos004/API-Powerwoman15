"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectInstructor = exports.approveInstructor = exports.getInstructorRequests = exports.requestInstructor = exports.getAllUsers = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const database_1 = require("../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Registrar nuevo usuario
const register = async (req, res) => {
    try {
        const { email, full_name, password, phone, address, city, country, postal_code } = req.body;
        // Validar campos requeridos
        if (!email || !full_name || !password) {
            res.status(400).json({
                success: false,
                error: 'Email, nombre y contraseña son requeridos',
            });
            return;
        }
        // Verificar si el usuario ya existe
        const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            res.status(409).json({
                success: false,
                error: 'El email ya está registrado',
            });
            return;
        }
        // Hashear contraseña
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Crear usuario
        const result = await (0, database_1.query)('INSERT INTO users (email, full_name, password_hash, phone, address, city, country, postal_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, full_name, phone, address, city, country, postal_code, is_admin, created_at', [email, full_name, hashedPassword, phone || null, address || null, city || null, country || null, postal_code || null]);
        const user = result.rows[0];
        // Generar JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user,
                token,
            },
        });
    }
    catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ success: false, error: 'Error al registrar usuario' });
    }
};
exports.register = register;
// Login de usuario
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validar campos
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email y contraseña son requeridos',
            });
            return;
        }
        // Buscar usuario
        const result = await (0, database_1.query)('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            res.status(401).json({
                success: false,
                error: 'Usuario o contraseña inválidos',
            });
            return;
        }
        const user = result.rows[0];
        // Verificar contraseña
        const passwordMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!passwordMatch) {
            res.status(401).json({
                success: false,
                error: 'Usuario o contraseña inválidos',
            });
            return;
        }
        // Generar JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, is_admin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
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
    }
    catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, error: 'Error al iniciar sesión' });
    }
};
exports.login = login;
// Obtener perfil del usuario
const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const result = await (0, database_1.query)('SELECT id, email, full_name, phone, address, city, country, postal_code, profile_image_url, is_admin, is_instructor, instructor_approved, created_at FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            return;
        }
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ success: false, error: 'Error al obtener perfil' });
    }
};
exports.getProfile = getProfile;
// Actualizar perfil del usuario
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { full_name, phone, address, city, country, postal_code } = req.body;
        const result = await (0, database_1.query)('UPDATE users SET full_name = $1, phone = $2, address = $3, city = $4, country = $5, postal_code = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING id, email, full_name, phone, address, city, country, postal_code', [full_name, phone, address, city, country, postal_code, userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            return;
        }
        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar perfil' });
    }
};
exports.updateProfile = updateProfile;
// Obtener todos los usuarios (solo admin)
const getAllUsers = async (req, res) => {
    try {
        const result = await (0, database_1.query)('SELECT id, email, full_name, is_admin, is_active, created_at FROM users ORDER BY created_at DESC');
        res.json({
            success: true,
            data: result.rows,
            count: result.rowCount,
        });
    }
    catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ success: false, error: 'Error al obtener usuarios' });
    }
};
exports.getAllUsers = getAllUsers;
// Solicitar ser instructora
const requestInstructor = async (req, res) => {
    try {
        const userId = req.userId;
        // Verificar si ya solicitó
        const checkRequest = await (0, database_1.query)('SELECT is_instructor, instructor_approved FROM users WHERE id = $1', [userId]);
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
        const result = await (0, database_1.query)('UPDATE users SET is_instructor = true, instructor_request_date = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, email, full_name, is_instructor, instructor_approved', [userId]);
        res.json({
            success: true,
            message: 'Solicitud de instructora registrada. El admin la revisará pronto.',
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error('Error solicitando instructor:', error);
        res.status(500).json({ success: false, error: 'Error al solicitar ser instructora' });
    }
};
exports.requestInstructor = requestInstructor;
// Obtener solicitudes de instructoras (solo admin)
const getInstructorRequests = async (req, res) => {
    try {
        const result = await (0, database_1.query)('SELECT id, email, full_name, instructor_request_date FROM users WHERE is_instructor = true AND instructor_approved = false ORDER BY instructor_request_date DESC');
        res.json({
            success: true,
            data: result.rows,
            count: result.rowCount,
        });
    }
    catch (error) {
        console.error('Error obteniendo solicitudes:', error);
        res.status(500).json({ success: false, error: 'Error al obtener solicitudes' });
    }
};
exports.getInstructorRequests = getInstructorRequests;
// Aprobar instructora (solo admin)
const approveInstructor = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await (0, database_1.query)('UPDATE users SET instructor_approved = true WHERE id = $1 RETURNING id, email, full_name, is_instructor, instructor_approved', [userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            return;
        }
        res.json({
            success: true,
            message: 'Instructora aprobada exitosamente',
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error('Error aprobando instructora:', error);
        res.status(500).json({ success: false, error: 'Error al aprobar instructora' });
    }
};
exports.approveInstructor = approveInstructor;
// Rechazar solicitud de instructora (solo admin)
const rejectInstructor = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await (0, database_1.query)('UPDATE users SET is_instructor = false, instructor_approved = false, instructor_request_date = NULL WHERE id = $1 RETURNING id, email, full_name, is_instructor, instructor_approved', [userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            return;
        }
        res.json({
            success: true,
            message: 'Solicitud de instructora rechazada',
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error('Error rechazando instructora:', error);
        res.status(500).json({ success: false, error: 'Error al rechazar solicitud' });
    }
};
exports.rejectInstructor = rejectInstructor;
//# sourceMappingURL=userController.js.map