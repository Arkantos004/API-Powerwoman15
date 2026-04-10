"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.updateOrderStatus = exports.createOrder = exports.getOrderById = exports.getUserOrders = void 0;
const database_1 = require("../config/database");
// Obtener todas las órdenes del usuario
const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const result = await (0, database_1.query)('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json({
            success: true,
            data: result.rows,
            count: result.rowCount,
        });
    }
    catch (error) {
        console.error('Error obteniendo órdenes:', error);
        res.status(500).json({ success: false, error: 'Error al obtener órdenes' });
    }
};
exports.getUserOrders = getUserOrders;
// Obtener una orden por ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const orderResult = await (0, database_1.query)('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Orden no encontrada' });
            return;
        }
        const itemsResult = await (0, database_1.query)('SELECT * FROM order_items WHERE order_id = $1', [id]);
        res.json({
            success: true,
            data: {
                ...orderResult.rows[0],
                items: itemsResult.rows,
            },
        });
    }
    catch (error) {
        console.error('Error obteniendo orden:', error);
        res.status(500).json({ success: false, error: 'Error al obtener orden' });
    }
};
exports.getOrderById = getOrderById;
// Crear nueva orden
const createOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { items } = req.body;
        if (!items || items.length === 0) {
            res.status(400).json({
                success: false,
                error: 'La orden debe contener al menos un producto',
            });
            return;
        }
        // Calcular subtotal
        let subtotal = 0;
        for (const item of items) {
            const productResult = await (0, database_1.query)('SELECT price_cop FROM products WHERE id = $1', [
                item.product_id,
            ]);
            if (productResult.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    error: `Producto con ID ${item.product_id} no encontrado`,
                });
                return;
            }
            const productPrice = productResult.rows[0].price_cop;
            subtotal += productPrice * item.quantity;
        }
        const tax = Math.floor(subtotal * 0.19);
        const total = subtotal + tax;
        // Crear orden
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const orderResult = await (0, database_1.query)(`INSERT INTO orders (user_id, order_number, subtotal_cop, tax_cop, total_cop, status) 
       VALUES ($1, $2, $3, $4, $5, 'pending') 
       RETURNING *`, [userId, orderNumber, subtotal, tax, total]);
        const orderId = orderResult.rows[0].id;
        // Agregar items a la orden
        for (const item of items) {
            const productResult = await (0, database_1.query)('SELECT price_cop FROM products WHERE id = $1', [
                item.product_id,
            ]);
            const price = productResult.rows[0].price_cop;
            const itemSubtotal = price * item.quantity;
            await (0, database_1.query)(`INSERT INTO order_items (order_id, product_id, quantity, price_cop, subtotal_cop) 
         VALUES ($1, $2, $3, $4, $5)`, [orderId, item.product_id, item.quantity, price, itemSubtotal]);
            // Actualizar stock
            await (0, database_1.query)('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [
                item.quantity,
                item.product_id,
            ]);
        }
        res.status(201).json({
            success: true,
            message: 'Orden creada exitosamente',
            data: orderResult.rows[0],
        });
    }
    catch (error) {
        console.error('Error creando orden:', error);
        res.status(500).json({ success: false, error: 'Error al crear orden' });
    }
};
exports.createOrder = createOrder;
// Actualizar estado de la orden
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            res.status(400).json({
                success: false,
                error: 'El estado es requerido',
            });
            return;
        }
        const result = await (0, database_1.query)('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [status, id]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Orden no encontrada' });
            return;
        }
        res.json({
            success: true,
            message: 'Orden actualizada exitosamente',
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error('Error actualizando orden:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar orden' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
// Obtener todas las órdenes (solo admin)
const getAllOrders = async (req, res) => {
    try {
        const result = await (0, database_1.query)(`SELECT o.*, u.email, u.full_name 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`);
        res.json({
            success: true,
            data: result.rows,
            count: result.rowCount,
        });
    }
    catch (error) {
        console.error('Error obteniendo órdenes:', error);
        res.status(500).json({ success: false, error: 'Error al obtener órdenes' });
    }
};
exports.getAllOrders = getAllOrders;
//# sourceMappingURL=orderController.js.map