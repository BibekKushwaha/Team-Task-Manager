import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import prisma from '../config/db.js';

const getParam = (value: string | string[] | undefined): string | null => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0) return value[0];
  return null;
};

/**
 * Check if the user has one of the required global roles.
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Check if the user is a member of the project (from :id or :projectId param)
 * and optionally has one of the required project-level roles.
 */
export const requireProjectRole = (...roles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      const projectId = getParam(req.params.id) || getParam(req.params.projectId);
      if (!projectId) {
        throw ApiError.badRequest('Project ID is required');
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: req.user.id,
          },
        },
      });

      if (!membership) {
        throw ApiError.forbidden('You are not a member of this project');
      }

      // If specific roles are required, check them
      if (roles.length > 0 && !roles.includes(membership.role)) {
        throw ApiError.forbidden('Insufficient project permissions');
      }

      // Attach membership info to request for downstream use
      (req as any).projectMembership = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
};
