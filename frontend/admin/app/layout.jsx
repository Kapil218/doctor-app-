import './globals.css';
import styles from './layout.module.css';
import { Montserrat } from "next/font/google";
import LayoutWrapper from '../components/LayoutWrapper';

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
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
} 