"use client";
import React, { useState } from "react";
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

  const isActive = (path: string) => (pathname === path ? style.activeLink : "");

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/v1/users/logout", {
        method: "POST",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        window.location.href = "/login";
     
        router.refresh(); // ✅ Ensures UI updates properly
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
      <Link href="/health-blog" className={isActive("/health-blog")}>
        Health Blog
      </Link>
      <Link href="/reviews" className={isActive("/reviews")}>
        Reviews
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
        <button className={style.logoutButton} onClick={() => router.push("/profile")}>Profile</button></>
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
          <Image
            src="/logo.svg"
            alt="MedCare Logo"
            width={191}
            height={56}
            priority
          />
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
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`${style.mobileMenu} ${menuOpen ? style.active : ""}`}>
          <NavLinks />
          <div className={style.buttonContainer}>
            <AuthButtons />
          </div>
        </div>
      </div>
    </header>
  );
}
