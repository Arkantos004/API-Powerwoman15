"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Rutas protegidas
router.get('/', auth_1.authMiddleware, orderController_1.getUserOrders);
router.get('/:id', auth_1.authMiddleware, orderController_1.getOrderById);
router.post('/', auth_1.authMiddleware, orderController_1.createOrder);
router.patch('/:id/status', auth_1.authMiddleware, orderController_1.updateOrderStatus);
// Rutas admin
router.get('/admin/all', auth_1.authMiddleware, auth_1.adminMiddleware, orderController_1.getAllOrders);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map