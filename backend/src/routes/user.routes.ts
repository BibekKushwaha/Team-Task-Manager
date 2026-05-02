import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/me', (req, res, next) => userController.getMe(req, res, next));
router.get('/', (req, res, next) => userController.getAllUsers(req, res, next));

export default router;
