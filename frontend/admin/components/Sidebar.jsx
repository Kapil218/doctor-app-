"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/v1/users/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        router.push("/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {isMobile && (
        <button onClick={toggleMobileMenu} className={styles.hamburgerButton}>
          <div className={`${styles.hamburgerIcon} ${isMobileMenuOpen ? styles.open : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      )}
      
      <div className={`${styles.sidebar} ${isMobile ? styles.mobile : ''} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <h2>Admin Panel</h2>
        </div>
        
        <nav className={styles.navigation}>
          <Link href="/" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>
            <span className={styles.icon}>📊</span>
            Appointments
          </Link>
          <Link href="/doctors" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>
            <span className={styles.icon}>👨‍⚕️</span>
            Doctors
          </Link>
        </nav>

        <div className={styles.bottomSection}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <span className={styles.icon}>🚪</span>
            Logout
          </button>
        </div>
      </div>
      
      {isMobile && isMobileMenuOpen && (
        <div className={styles.overlay} onClick={toggleMobileMenu}></div>
      )}
    </>
  );
};

export default Sidebar; 