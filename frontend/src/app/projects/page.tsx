'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Modal from '@/components/Modal';
import { api } from '@/lib/api';
import { ApiResponse, Project } from '@/lib/types';
import styles from './projects.module.css';

function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<Project[]>>('/projects');
      setProjects(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/projects', { name, description });
      setShowCreate(false);
      setName(''); setDescription('');
      fetchProjects();
    } catch (err) { console.error(err); }
    finally { setCreating(false); }
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <div className={styles.pageHeader}>
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">Manage your team projects</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
        </div>

        {loading ? (
          <div className={styles.projectGrid}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 14 }} />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <p className="empty-state-title">No projects yet</p>
            <p>Create your first project to get started</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ marginTop: 16 }}>
              + Create Project
            </button>
          </div>
        ) : (
          <div className={styles.projectGrid}>
            {projects.map((project, idx) => {
              const stats = project.taskStats || { total: 0, todo: 0, inProgress: 0, done: 0 };
              const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
              return (
                <Link href={`/projects/${project.id}`} key={project.id} className={`glass-card ${styles.projectCard}`}
                  style={{ animationDelay: `${idx * 60}ms` }}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{project.name}</h3>
                    <span className="badge badge-primary">{stats.total} tasks</span>
                  </div>
                  {project.description && (
                    <p className={styles.cardDesc}>{project.description}</p>
                  )}
                  <div className={styles.cardProgress}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className={styles.pctLabel}>{pct}% complete</span>
                  </div>
                  <div className={styles.cardFooter}>
                    <div className={styles.memberAvatars}>
                      {project.members.slice(0, 4).map(m => (
                        <div key={m.id} className={`avatar avatar-sm ${styles.stackedAvatar}`} title={m.user.name}>
                          {m.user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      ))}
                      {project.members.length > 4 && (
                        <span className={styles.moreMembers}>+{project.members.length - 4}</span>
                      )}
                    </div>
                    <span className={styles.cardDate}>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Create Project Modal */}
        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input className="form-input" placeholder="e.g. Website Redesign" value={name}
                onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea className="form-textarea" placeholder="Brief description of the project..."
                value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={creating}>
              {creating ? <span className="spinner" /> : 'Create Project'}
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
}

export default function ProjectsPage() {
  return <ProtectedRoute><ProjectsContent /></ProtectedRoute>;
}
