import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireProjectRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createTaskSchema, updateTaskSchema } from '../utils/validators.js';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// Dashboard & my tasks
router.get('/dashboard', (req, res, next) => taskController.getDashboard(req, res, next));
router.get('/my-tasks', (req, res, next) => taskController.getMyTasks(req, res, next));

// Project-scoped task routes
router.post('/projects/:projectId/tasks', requireProjectRole(), validate(createTaskSchema), (req, res, next) => taskController.create(req, res, next));
router.get('/projects/:projectId/tasks', requireProjectRole(), (req, res, next) => taskController.getProjectTasks(req, res, next));

// Individual task routes
router.get('/:id', (req, res, next) => taskController.getById(req, res, next));
router.put('/:id', validate(updateTaskSchema), (req, res, next) => taskController.update(req, res, next));
router.delete('/:id', (req, res, next) => taskController.delete(req, res, next));

export default router;
