"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import style from "./header.module.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface HeaderProps {
  isLoggedIn: boolean;
}

export default function Header({ isLoggedIn }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.querySelector(`.${style.mobileMenu}`);
      const hamburger = document.querySelector(`.${style.hamburger}`);
      
      if (menuOpen && mobileMenu && hamburger && 
          !mobileMenu.contains(event.target as Node) && 
          !hamburger.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  const isActive = (path: string) => (pathname === path ? style.activeLink : "");

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/v1/users/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        window.location.href = "/login";
        router.refresh();
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const NavLinks = () => (
    <>
      <Link href="/" className={isActive("/")}>
        Home
      </Link>
      <Link href="/appointments" className={isActive("/appointments")}>
        Appointments
      </Link>
      <Link href="/reviews" className={isActive("/reviews")}>
        Reviews
      </Link>
      <Link href="/help" className={isActive("/help")}>
        Help
      </Link>
    </>
  );

  const AuthButtons = () => (
    <>
      {isLoggedIn ? (
        <>
          <button onClick={handleLogout} className={style.logoutButton}>
            Logout
          </button>
          <button 
            className={style.logoutButton} 
            onClick={() => router.push("/profile")}
          >
            Profile
          </button>
        </>
      ) : (
        <>
          <Link href="/login">
            <button className={style.loginButton}>Login</button>
          </Link>
          <Link href="/signup">
            <button className={style.registerButton}>Register</button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className={style.container}>
      <div className={style.wrapper}>
        <div className={style.link_wrapper}>
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="MedCare Logo"
              width={191}
              height={56}
              priority
            />
          </Link>
          <nav className={style.navLinks}>
            <NavLinks />
          </nav>
        </div>

        <div className={style.buttonContainer}>
          <AuthButtons />
        </div>

        <button
          className={`${style.hamburger} ${menuOpen ? style.active : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div 
          className={`${style.mobileMenu} ${menuOpen ? style.active : ""}`}
          aria-hidden={!menuOpen}
        >
          <div className={style.mobileMenuHeader}>
            <Link href="/">
              <Image
                src="/logo.svg"
                alt="MedCare Logo"
                width={150}
                height={44}
                priority
              />
            </Link>
            <button 
              className={style.closeButton}
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <nav className={style.navLinks}>
            <NavLinks />
          </nav>
          <div className={style.buttonContainer}>
            <AuthButtons />
          </div>
        </div>
      </div>
    </header>
  );
}
