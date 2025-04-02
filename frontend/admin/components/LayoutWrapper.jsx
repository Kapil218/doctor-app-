"use client";

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import styles from '../app/layout.module.css';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <div className={styles.layout}>
      {!isLoginPage && <Sidebar />}
      <main className={`${styles.main} ${isLoginPage ? styles.fullWidth : ''}`}>
        {children}
      </main>
    </div>
  );
} 