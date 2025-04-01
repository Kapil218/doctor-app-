"use client";
import React from "react";
import Link from "next/link";
import styles from "./help.module.css";
import { FaPhone, FaAmbulance, FaHospital, FaInfoCircle, FaHeartbeat } from "react-icons/fa";

export default function EmergencyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Emergency Contacts</h1>
        <p>Get immediate help in case of emergency</p>
      </div>

      <div className={styles.emergencyCall}>
        <FaPhone className={styles.phoneIcon} />
        <h2>Emergency? Call Now</h2>
        <a href="tel:911" className={styles.emergencyNumber}>911</a>
        <p>For immediate life-threatening emergencies</p>
      </div>

      <div className={styles.contactGrid}>
        <div className={styles.contactCard}>
          <FaAmbulance className={styles.icon} />
          <h3>Ambulance Services</h3>
          <a href="tel:911">911</a>
          <p>For medical emergencies requiring immediate transport</p>
        </div>

        <div className={styles.contactCard}>
          <FaHospital className={styles.icon} />
          <h3>Nearest Hospitals</h3>
          <ul>
            <li>
              <strong>City General Hospital</strong>
              <p>123 Medical Drive</p>
              <a href="tel:+15551234567">555-123-4567</a>
            </li>
            <li>
              <strong>Memorial Medical Center</strong>
              <p>456 Health Avenue</p>
              <a href="tel:+15559876543">555-987-6543</a>
            </li>
          </ul>
        </div>

        <div className={styles.contactCard}>
          <FaHeartbeat className={styles.icon} />
          <h3>Urgent Care Centers</h3>
          <ul>
            <li>
              <strong>QuickCare Clinic</strong>
              <p>789 Express Lane</p>
              <a href="tel:+15552223333">555-222-3333</a>
              <p>Hours: 8am-8pm daily</p>
            </li>
            <li>
              <strong>Urgent Med</strong>
              <p>321 Fast Street</p>
              <a href="tel:+15554445555">555-444-5555</a>
              <p>Hours: 24/7</p>
            </li>
          </ul>
        </div>

        <div className={styles.contactCard}>
          <FaInfoCircle className={styles.icon} />
          <h3>Non-Emergency Helplines</h3>
          <ul>
            <li>
              <strong>Poison Control</strong>
              <a href="tel:+18002221222">1-800-222-1222</a>
            </li>
            <li>
              <strong>Mental Health Crisis</strong>
              <a href="tel:988">988</a>
            </li>
            <li>
              <strong>Nurse Advice Line</strong>
              <a href="tel:+15557778888">555-777-8888</a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.emergencyInfo}>
        <h2>When to Seek Emergency Care</h2>
        <ul className={styles.symptomsList}>
          <li>Difficulty breathing or shortness of breath</li>
          <li>Chest or upper abdominal pain or pressure</li>
          <li>Fainting, sudden dizziness, weakness</li>
          <li>Changes in vision</li>
          <li>Confusion or changes in mental status</li>
          <li>Any sudden or severe pain</li>
          <li>Uncontrolled bleeding</li>
          <li>Severe or persistent vomiting or diarrhea</li>
          <li>Coughing or vomiting blood</li>
          <li>Suicidal or homicidal feelings</li>
        </ul>
      </div>

      <div className={styles.actionButtons}>
        <Link href="/appointments">
          <button className={styles.appointmentButton}>Schedule Appointment</button>
        </Link>
        <Link href="/">
          <button className={styles.homeButton}>Return to Home</button>
        </Link>
      </div>
    </div>
  );
} 