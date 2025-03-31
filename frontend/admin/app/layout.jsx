import { Suspense } from 'react';
import Sidebar from '../components/Sidebar';
import styles from './layout.module.css';

export const metadata = {
  title: "Doctor Appointment App",
  description: "Admin dashboard for managing doctor appointments",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className={styles.layout}>
          <Suspense fallback={<div>Loading...</div>}>
            <Sidebar />
          </Suspense>
          <main className={styles.main}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
} 