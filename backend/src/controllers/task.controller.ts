import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service.js';
import { ApiError } from '../utils/ApiError.js';

const getParam = (value: string | string[] | undefined): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0) return value[0];
  throw ApiError.badRequest('Invalid route parameter');
};

export class TaskController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();
      const projectId = getParam(req.params.projectId);

      const task = await taskService.createTask({
        ...req.body,
        projectId,
        createdById: req.user.id,
      });

      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async getProjectTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, priority, assignedToId } = req.query;
      const projectId = getParam(req.params.projectId);
      const tasks = await taskService.getTasks(projectId, {
        status: status as string,
        priority: priority as string,
        assignedToId: assignedToId as string,
      });

      res.json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getTaskById(getParam(req.params.id));
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();

      const taskId = getParam(req.params.id);
      const task = await taskService.updateTask(taskId, req.body);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await taskService.deleteTask(getParam(req.params.id));
      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();

      const stats = await taskService.getDashboardStats(req.user.id);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getMyTasks(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();

      const { status, priority } = req.query;
      const tasks = await taskService.getMyTasks(req.user.id, {
        status: status as string,
        priority: priority as string,
      });

      res.json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
