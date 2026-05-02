import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export class ProjectService {
  async createProject(name: string, description: string | undefined, createdById: string) {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById,
        // Auto-add creator as ADMIN member
        members: {
          create: {
            userId: createdById,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { tasks: true } },
      },
    });

    return project;
  }

  async getProjects(userId: string) {
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Add task stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const taskStats = await prisma.task.groupBy({
          by: ['status'],
          where: { projectId: project.id },
          _count: { status: true },
        });

        const stats = {
          total: 0,
          todo: 0,
          inProgress: 0,
          done: 0,
        };

        taskStats.forEach((stat) => {
          stats.total += stat._count.status;
          if (stat.status === 'TODO') stats.todo = stat._count.status;
          if (stat.status === 'IN_PROGRESS') stats.inProgress = stat._count.status;
          if (stat.status === 'DONE') stats.done = stat._count.status;
        });

        return { ...project, taskStats: stats };
      })
    );

    return projectsWithStats;
  }

  async getProjectById(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    return project;
  }

  async updateProject(projectId: string, data: { name?: string; description?: string }) {
    const project = await prisma.project.update({
      where: { id: projectId },
      data,
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return project;
  }

  async deleteProject(projectId: string) {
    await prisma.project.delete({ where: { id: projectId } });
  }

  async addMember(projectId: string, userId: string, role: 'ADMIN' | 'MEMBER') {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Check if already a member
    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (existing) {
      throw ApiError.conflict('User is already a member of this project');
    }

    const member = await prisma.projectMember.create({
      data: { projectId, userId, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return member;
  }

  async removeMember(projectId: string, userId: string) {
    // Don't allow removing the last admin
    const admins = await prisma.projectMember.findMany({
      where: { projectId, role: 'ADMIN' },
    });

    const isRemovingAdmin = admins.some((a) => a.userId === userId);
    if (isRemovingAdmin && admins.length <= 1) {
      throw ApiError.badRequest('Cannot remove the last admin from the project');
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  }
}

export const projectService = new ProjectService();
