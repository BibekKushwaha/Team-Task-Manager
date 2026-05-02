export const ROLES = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type TaskStatusType = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
export type TaskPriorityType = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];
