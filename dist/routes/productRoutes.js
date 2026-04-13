"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Rutas públicas
router.get('/', productController_1.getAllProducts);
router.get('/categories', productController_1.getCategories);
router.get('/:id', productController_1.getProductById);
// Rutas protegidas (admin only)
router.post('/', auth_1.authMiddleware, auth_1.adminMiddleware, productController_1.createProduct);
router.put('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, productController_1.updateProduct);
router.delete('/:id', auth_1.authMiddleware, auth_1.adminMiddleware, productController_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map