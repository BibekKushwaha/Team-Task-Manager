import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/project.service.js';
import { ApiError } from '../utils/ApiError.js';

const getParam = (value: string | string[] | undefined): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0) return value[0];
  throw ApiError.badRequest('Invalid route parameter');
};

export class ProjectController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();

      const { name, description } = req.body;
      const project = await projectService.createProject(name, description, req.user.id);

      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized();

      const projects = await projectService.getProjects(req.user.id);
      res.json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.getProjectById(getParam(req.params.id));
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.updateProject(getParam(req.params.id), req.body);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await projectService.deleteProject(getParam(req.params.id));
      res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, role } = req.body;
      const member = await projectService.addMember(getParam(req.params.id), userId, role);
      res.status(201).json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      await projectService.removeMember(getParam(req.params.id), getParam(req.params.userId));
      res.json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const projectController = new ProjectController();
