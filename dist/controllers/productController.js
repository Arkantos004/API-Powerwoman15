"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const database_1 = require("../config/database");
// Obtener todos los productos
const getAllProducts = async (req, res) => {
    try {
        const { category, available } = req.query;
        let sql = 'SELECT * FROM products WHERE 1=1';
        const params = [];
        if (category) {
            sql += ' AND category = $' + (params.length + 1);
            params.push(category);
        }
        if (available === 'true') {
            sql += ' AND is_available = true AND stock_quantity > 0';
        }
        sql += ' ORDER BY created_at DESC';
        const result = await (0, database_1.query)(sql, params);
        res.json({
            success: true,
            data: result.rows,
            count: result.rowCount,
        });
    }
    catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ success: false, error: 'Error al obtener productos' });
    }
};
exports.getAllProducts = getAllProducts;
// Obtener un producto por ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Producto no encontrado' });
            return;
        }
        res.json({
            success: true,
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({ success: false, error: 'Error al obtener producto' });
    }
};
exports.getProductById = getProductById;
// Crear nuevo producto
const createProduct = async (req, res) => {
    try {
        const { name, description, category, price_cop, image_url, stock_quantity } = req.body;
        if (!name || !category || !price_cop) {
            res.status(400).json({
                success: false,
                error: 'Nombre, categoría y precio son requeridos',
            });
            return;
        }
        const result = await (0, database_1.query)(`INSERT INTO products (name, description, category, price_cop, image_url, stock_quantity) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`, [name, description || null, category, price_cop, image_url || null, stock_quantity || 0]);
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error('Error creando producto:', error);
        if (error.code === '23505') {
            res.status(409).json({ success: false, error: 'El SKU ya existe' });
            return;
        }
        res.status(500).json({ success: false, error: 'Error al crear producto' });
    }
};
exports.createProduct = createProduct;
// Actualizar producto
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, price_cop, stock_quantity, is_available } = req.body;
        const result = await (0, database_1.query)(`UPDATE products 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           price_cop = COALESCE($4, price_cop),
           stock_quantity = COALESCE($5, stock_quantity),
           is_available = COALESCE($6, is_available),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`, [name, description, category, price_cop, stock_quantity, is_available, id]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Producto no encontrado' });
            return;
        }
        res.json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar producto' });
    }
};
exports.updateProduct = updateProduct;
// Eliminar producto
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Producto no encontrado' });
            return;
        }
        res.json({
            success: true,
            message: 'Producto eliminado exitosamente',
        });
    }
    catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar producto' });
    }
};
exports.deleteProduct = deleteProduct;
// Obtener categorías
const getCategories = async (req, res) => {
    try {
        const result = await (0, database_1.query)('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category');
        const categories = result.rows.map((row) => row.category);
        res.json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        console.error('Error obteniendo categorías:', error);
        res.status(500).json({ success: false, error: 'Error al obtener categorías' });
    }
};
exports.getCategories = getCategories;
//# sourceMappingURL=productController.js.map