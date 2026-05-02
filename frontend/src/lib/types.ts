export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
}

export interface ProjectTaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: Pick<User, 'id' | 'name' | 'email'>;
  members: ProjectMember[];
  tasks?: Task[];
  taskStats?: ProjectTaskStats;
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  projectId: string;
  assignedToId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: Pick<User, 'id' | 'name' | 'email'> | null;
  createdBy: Pick<User, 'id' | 'name'>;
  project?: Pick<Project, 'id' | 'name'>;
}

export interface DashboardStats {
  myTasks: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
  overdueTasks: Task[];
  recentTasks: Task[];
  projectCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: { field: string; message: string }[];
}
