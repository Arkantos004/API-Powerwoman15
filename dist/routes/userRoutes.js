"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Rutas públicas
router.post('/register', userController_1.register);
router.post('/login', userController_1.login);
// Rutas protegidas
router.get('/profile', auth_1.authMiddleware, userController_1.getProfile);
router.put('/profile', auth_1.authMiddleware, userController_1.updateProfile);
router.post('/request-instructor', auth_1.authMiddleware, userController_1.requestInstructor);
// Rutas admin
router.get('/all', auth_1.authMiddleware, auth_1.adminMiddleware, userController_1.getAllUsers);
router.get('/instructor/requests', auth_1.authMiddleware, auth_1.adminMiddleware, userController_1.getInstructorRequests);
router.patch('/:userId/approve-instructor', auth_1.authMiddleware, auth_1.adminMiddleware, userController_1.approveInstructor);
router.patch('/:userId/reject-instructor', auth_1.authMiddleware, auth_1.adminMiddleware, userController_1.rejectInstructor);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map