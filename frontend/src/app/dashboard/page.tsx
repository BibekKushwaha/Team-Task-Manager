'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { ApiResponse, DashboardStats } from '@/lib/types';
import styles from './dashboard.module.css';

function StatsCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div className={`glass-card ${styles.statCard}`} style={{ '--card-accent': color } as React.CSSProperties}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statInfo}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </div>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<ApiResponse<DashboardStats>>('/tasks/dashboard');
        setStats(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Sidebar /><Navbar />
        <main className="main-content">
          <div className={styles.grid}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />)}
          </div>
        </main>
      </div>
    );
  }

  const progressPct = stats && stats.myTasks.total > 0
    ? Math.round((stats.myTasks.done / stats.myTasks.total) * 100)
    : 0;

  return (
    <div className="page-wrapper">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your tasks and projects</p>
        </div>

        {/* Stats Grid */}
        <div className={styles.grid}>
          <StatsCard icon="📋" label="Total Tasks" value={stats?.myTasks.total || 0} color="#6366f1" />
          <StatsCard icon="🔄" label="In Progress" value={stats?.myTasks.inProgress || 0} color="#f59e0b" />
          <StatsCard icon="✅" label="Completed" value={stats?.myTasks.done || 0} color="#10b981" />
          <StatsCard icon="📁" label="Projects" value={stats?.projectCount || 0} color="#8b5cf6" />
        </div>

        {/* Progress Bar */}
        <div className={`glass-card ${styles.progressSection}`}>
          <div className={styles.progressHeader}>
            <span className={styles.progressTitle}>Overall Progress</span>
            <span className={styles.progressPct}>{progressPct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className={styles.columns}>
          {/* Overdue Tasks */}
          <div className={`glass-card ${styles.column}`}>
            <h3 className={styles.columnTitle}>⚠️ Overdue Tasks</h3>
            {stats?.overdueTasks.length === 0 ? (
              <p className={styles.emptyText}>No overdue tasks 🎉</p>
            ) : (
              <div className={styles.taskList}>
                {stats?.overdueTasks.map(task => (
                  <div key={task.id} className={styles.taskItem}>
                    <div className={styles.taskItemHeader}>
                      <span className={styles.taskItemTitle}>{task.title}</span>
                      <span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                    </div>
                    <div className={styles.taskItemMeta}>
                      <span className={styles.taskProject}>{task.project?.name}</span>
                      <span className={styles.taskDue}>Due: {new Date(task.dueDate!).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className={`glass-card ${styles.column}`}>
            <h3 className={styles.columnTitle}>🕐 Recent Activity</h3>
            {stats?.recentTasks.length === 0 ? (
              <p className={styles.emptyText}>No recent activity</p>
            ) : (
              <div className={styles.taskList}>
                {stats?.recentTasks.map(task => (
                  <div key={task.id} className={styles.taskItem}>
                    <div className={styles.taskItemHeader}>
                      <span className={styles.taskItemTitle}>{task.title}</span>
                      <span className={`badge status-${task.status.toLowerCase().replace('_', '-')}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className={styles.taskItemMeta}>
                      <span className={styles.taskProject}>{task.project?.name}</span>
                      {task.assignedTo && (
                        <span className={styles.taskAssignee}>→ {task.assignedTo.name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
