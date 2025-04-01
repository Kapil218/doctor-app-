"use client";

import React from 'react';
import styles from './home.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className={styles.container}>
      {/* Left Section */}
      <div className={styles.heroText}>
        <h1 className={styles.title}>
          Health in Your<br />
          Hands.
        </h1>
        <p className={styles.description}>
          Take control of your healthcare with MedCare. Book appointments with ease, explore health blogs, and stay on top of your well-being, all in one place.
        </p>
        <Link href="/appointments">
          <button className={styles.getStartedButton}>
            Get Started
          </button>
        </Link>
      </div>

      {/* Right Section */}
      <div className={styles.heroImage}>
        <Image 
          src="/landingpage.svg" 
          alt="Doctor with patient"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
    </div>
  );
}
