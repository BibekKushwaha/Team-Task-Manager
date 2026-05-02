import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

interface CreateTaskData {
  title: string;
  description?: string | null;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedToId?: string | null;
  dueDate?: string | null;
  projectId: string;
  createdById: string;
}

interface UpdateTaskData {
  title?: string;
  description?: string | null;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedToId?: string | null;
  dueDate?: string | null;
}

interface TaskFilters {
  status?: string;
  priority?: string;
  assignedToId?: string;
}

export class TaskService {
  async createTask(data: CreateTaskData) {
    // Validate assignee is a project member if provided
    if (data.assignedToId) {
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: data.projectId,
            userId: data.assignedToId,
          },
        },
      });
      if (!membership) {
        throw ApiError.badRequest('Assigned user is not a member of this project');
      }
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId: data.projectId,
        assignedToId: data.assignedToId,
        createdById: data.createdById,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return task;
  }

  async getTasks(projectId: string, filters: TaskFilters = {}) {
    const where: any = { projectId };

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assignedToId) where.assignedToId = filters.assignedToId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return tasks;
  }

  async getTaskById(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    return task;
  }

  async updateTask(taskId: string, data: UpdateTaskData) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Validate assignee is a project member if changing assignee
    if (data.assignedToId) {
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: task.projectId,
            userId: data.assignedToId,
          },
        },
      });
      if (!membership) {
        throw ApiError.badRequest('Assigned user is not a member of this project');
      }
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return updated;
  }

  async deleteTask(taskId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    await prisma.task.delete({ where: { id: taskId } });
  }

  async getDashboardStats(userId: string) {
    // Get all tasks assigned to user or in user's projects
    const userProjects = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });

    const projectIds = userProjects.map((p) => p.projectId);

    // Task counts by status (user's tasks)
    const myTaskStats = await prisma.task.groupBy({
      by: ['status'],
      where: { assignedToId: userId },
      _count: { status: true },
    });

    const stats = {
      myTasks: { total: 0, todo: 0, inProgress: 0, done: 0 },
      overdueTasks: [] as any[],
      recentTasks: [] as any[],
      projectCount: projectIds.length,
    };

    myTaskStats.forEach((s) => {
      stats.myTasks.total += s._count.status;
      if (s.status === 'TODO') stats.myTasks.todo = s._count.status;
      if (s.status === 'IN_PROGRESS') stats.myTasks.inProgress = s._count.status;
      if (s.status === 'DONE') stats.myTasks.done = s._count.status;
    });

    // Overdue tasks
    stats.overdueTasks = await prisma.task.findMany({
      where: {
        assignedToId: userId,
        status: { not: 'DONE' },
        dueDate: { lt: new Date() },
      },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    // Recent tasks across all projects
    stats.recentTasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        assignedTo: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    return stats;
  }

  async getMyTasks(userId: string, filters: TaskFilters = {}) {
    const where: any = { assignedToId: userId };

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
    });

    return tasks;
  }
}

export const taskService = new TaskService();
