'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Modal from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ApiResponse, Project, Task, User } from '@/lib/types';
import styles from './detail.module.css';

const STATUS_COLUMNS = [
  { key: 'TODO' as const, label: 'To Do', icon: '📋', color: '#94a3b8' },
  { key: 'IN_PROGRESS' as const, label: 'In Progress', icon: '🔄', color: '#f59e0b' },
  { key: 'DONE' as const, label: 'Done', icon: '✅', color: '#10b981' },
];

function ProjectDetailContent() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [taskError, setTaskError] = useState('');

  // Member form state
  const [memberUserId, setMemberUserId] = useState('');
  const [memberRole, setMemberRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');

  const isProjectAdmin = project?.members.some(m => m.userId === user?.id && m.role === 'ADMIN') ?? false;

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<Project>>(`/projects/${projectId}`);
      setProject(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const fetchUsers = async () => {
    try {
      const res = await api.get<ApiResponse<User[]>>('/users');
      setAllUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const openCreateTask = (status: 'TODO' | 'IN_PROGRESS' | 'DONE' = 'TODO') => {
    setEditingTask(null);
    setTaskTitle(''); setTaskDesc(''); setTaskStatus(status);
    setTaskPriority('MEDIUM'); setTaskAssignee(''); setTaskDueDate('');
    setTaskError('');
    setShowTaskModal(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setTaskAssignee(task.assignedToId || '');
    setTaskDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setTaskError('');
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTaskError('');
    try {
      const body: Record<string, unknown> = {
        title: taskTitle, description: taskDesc || null,
        status: taskStatus, priority: taskPriority,
        assignedToId: taskAssignee || null,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : null,
      };
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, body);
      } else {
        await api.post(`/tasks/projects/${projectId}/tasks`, body);
      }
      setShowTaskModal(false);
      fetchProject();
    } catch (err) {
      console.error(err);
      setTaskError(err instanceof Error ? err.message : 'Failed to save task');
    }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProject();
    } catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProject();
    } catch (err) { console.error(err); }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${projectId}/members`, { userId: memberUserId, role: memberRole });
      setShowMemberModal(false);
      setMemberUserId('');
      fetchProject();
    } catch (err) { console.error(err); }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      fetchProject();
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="page-wrapper"><Sidebar /><Navbar />
        <main className="main-content">
          <div className="skeleton" style={{ height: 40, width: 300, borderRadius: 8, marginBottom: 32 }} />
          <div style={{ display: 'flex', gap: 20 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ flex: 1, height: 400, borderRadius: 14 }} />)}
          </div>
        </main>
      </div>
    );
  }

  if (!project) return null;

  const tasks = project.tasks || [];

  return (
    <div className="page-wrapper">
      <Sidebar /><Navbar />
      <main className="main-content">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className="page-title">{project.name}</h1>
            {project.description && <p className="page-subtitle">{project.description}</p>}
          </div>
          <div className={styles.headerActions}>
            <button className="btn btn-primary" onClick={() => openCreateTask()}>+ New Task</button>
            {isProjectAdmin && (
              <button className="btn btn-secondary" onClick={() => { fetchUsers(); setShowMemberModal(true); }}>
                👥 Members
              </button>
            )}
          </div>
        </div>

        {/* Members strip */}
        <div className={styles.membersStrip}>
          {project.members.map(m => (
            <div key={m.id} className={styles.memberChip}>
              <div className="avatar avatar-sm">{m.user.name.split(' ').map(n => n[0]).join('')}</div>
              <span>{m.user.name}</span>
              <span className={`badge ${m.role === 'ADMIN' ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: 10 }}>
                {m.role}
              </span>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        <div className={styles.kanban}>
          {STATUS_COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} className={styles.kanbanCol}>
                <div className={styles.colHeader} style={{ '--col-color': col.color } as React.CSSProperties}>
                  <span className={styles.colIcon}>{col.icon}</span>
                  <span className={styles.colTitle}>{col.label}</span>
                  <span className={styles.colCount}>{colTasks.length}</span>
                </div>
                <div className={styles.colBody}>
                  {colTasks.map(task => (
                    <div key={task.id} className={`glass-card ${styles.taskCard}`}>
                      <div className={styles.taskTop}>
                        <span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                        <div className={styles.taskActions}>
                          <button className="btn-ghost btn-icon" onClick={() => openEditTask(task)} title="Edit">✏️</button>
                          <button className="btn-ghost btn-icon" onClick={() => handleDeleteTask(task.id)} title="Delete">🗑️</button>
                        </div>
                      </div>
                      <h4 className={styles.taskTitle}>{task.title}</h4>
                      {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                      <div className={styles.taskBottom}>
                        {task.assignedTo ? (
                          <div className={styles.taskAssignee}>
                            <div className="avatar avatar-sm">{task.assignedTo.name.split(' ').map(n => n[0]).join('')}</div>
                            <span>{task.assignedTo.name}</span>
                          </div>
                        ) : <span className={styles.unassigned}>Unassigned</span>}
                        {task.dueDate && (
                          <span className={new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? styles.overdue : styles.dueDate}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {/* Quick status change */}
                      <div className={styles.quickStatus}>
                        {STATUS_COLUMNS.filter(s => s.key !== col.key).map(s => (
                          <button key={s.key} className={styles.quickBtn} onClick={() => handleStatusChange(task.id, s.key)}
                            title={`Move to ${s.label}`}>
                            {s.icon} {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className={styles.addCardBtn} onClick={() => openCreateTask(col.key)}>+ Add task</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Task Modal */}
        <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title={editingTask ? 'Edit Task' : 'Create Task'}>
          <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {taskError && <div className="form-error">{taskError}</div>}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={taskStatus} onChange={e => setTaskStatus(e.target.value as typeof taskStatus)}>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={taskPriority} onChange={e => setTaskPriority(e.target.value as typeof taskPriority)}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select className="form-select" value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}>
                <option value="">Unassigned</option>
                {project.members.map(m => (
                  <option key={m.userId} value={m.userId}>{m.user.name} ({m.user.email})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? <span className="spinner" /> : (editingTask ? 'Update Task' : 'Create Task')}
            </button>
          </form>
        </Modal>

        {/* Members Modal */}
        <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Manage Members">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className={styles.memberList}>
              {project.members.map(m => (
                <div key={m.id} className={styles.memberRow}>
                  <div className="avatar avatar-md">{m.user.name.split(' ').map(n => n[0]).join('')}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{m.user.name}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{m.user.email}</div>
                  </div>
                  <span className={`badge ${m.role === 'ADMIN' ? 'badge-primary' : 'badge-neutral'}`}>{m.role}</span>
                  {isProjectAdmin && m.userId !== user?.id && (
                    <button className="btn-ghost btn-icon" onClick={() => handleRemoveMember(m.userId)}>✕</button>
                  )}
                </div>
              ))}
            </div>
            {isProjectAdmin && (
              <form onSubmit={handleAddMember} className={styles.addMemberForm}>
                <h4 style={{ marginBottom: 'var(--space-3)' }}>Add Member</h4>
                <select className="form-select" value={memberUserId} onChange={e => setMemberUserId(e.target.value)} required>
                  <option value="">Select user...</option>
                  {allUsers.filter(u => !project.members.some(m => m.userId === u.id)).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <select className="form-select" value={memberRole} onChange={e => setMemberRole(e.target.value as 'ADMIN' | 'MEMBER')}>
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button type="submit" className="btn btn-primary">Add</button>
              </form>
            )}
          </div>
        </Modal>
      </main>
    </div>
  );
}

export default function ProjectDetailPage() {
  return <ProtectedRoute><ProjectDetailContent /></ProtectedRoute>;
}
