import { Router } from 'express';
import { projectController } from '../controllers/project.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireProjectRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createProjectSchema, updateProjectSchema, addMemberSchema } from '../utils/validators.js';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// CRUD
router.post('/', validate(createProjectSchema), (req, res, next) => projectController.create(req, res, next));
router.get('/', (req, res, next) => projectController.getAll(req, res, next));
router.get('/:id', requireProjectRole(), (req, res, next) => projectController.getById(req, res, next));
router.put('/:id', requireProjectRole('ADMIN'), validate(updateProjectSchema), (req, res, next) => projectController.update(req, res, next));
router.delete('/:id', requireProjectRole('ADMIN'), (req, res, next) => projectController.delete(req, res, next));

// Member management
router.post('/:id/members', requireProjectRole('ADMIN'), validate(addMemberSchema), (req, res, next) => projectController.addMember(req, res, next));
router.delete('/:id/members/:userId', requireProjectRole('ADMIN'), (req, res, next) => projectController.removeMember(req, res, next));

export default router;
