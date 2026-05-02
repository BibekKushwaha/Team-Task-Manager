'use client';

import React from 'react';
import styles from './Navbar.module.css';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <h2 className={styles.greeting}>
          Welcome back, <span className={styles.name}>{user?.name?.split(' ')[0]}</span> 👋
        </h2>
      </div>
      <div className={styles.right}>
        <span className={styles.date}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>
    </header>
  );
}
