import { Suspense } from 'react';
import Sidebar from '../components/Sidebar';
import './globals.css';
import styles from './layout.module.css';
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Doctor Appointment App",
  description: "Admin dashboard for managing doctor appointments",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
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