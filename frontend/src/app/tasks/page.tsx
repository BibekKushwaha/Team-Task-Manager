'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { ApiResponse, Task } from '@/lib/types';
import styles from './tasks.module.css';

function TasksContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get<ApiResponse<Task[]>>(`/tasks/my-tasks${query}`);
      setTasks(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [statusFilter, priorityFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">All tasks assigned to you across projects</p>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <select className="form-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {loading ? (
          <div className={styles.taskList}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <p className="empty-state-title">No tasks found</p>
            <p>You don&apos;t have any tasks matching the filters</p>
          </div>
        ) : (
          <div className={styles.taskList}>
            {tasks.map((task, idx) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
              return (
                <div key={task.id} className={`glass-card ${styles.taskRow} ${isOverdue ? styles.overdueRow : ''}`}
                  style={{ animationDelay: `${idx * 40}ms` }}>
                  <div className={styles.taskMain}>
                    <div className={styles.taskInfo}>
                      <h4 className={styles.taskTitle}>{task.title}</h4>
                      <div className={styles.taskMeta}>
                        {task.project && (
                          <Link href={`/projects/${task.project.id}`} className={styles.projectLink}>
                            📁 {task.project.name}
                          </Link>
                        )}
                        {task.dueDate && (
                          <span className={isOverdue ? styles.overdueBadge : styles.dueBadge}>
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.taskBadges}>
                      <span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <select
                        className={`form-select ${styles.statusSelect}`}
                        value={task.status}
                        onChange={e => handleStatusChange(task.id, e.target.value)}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function TasksPage() {
  return <ProtectedRoute><TasksContent /></ProtectedRoute>;
}
