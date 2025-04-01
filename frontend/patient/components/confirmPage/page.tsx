"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./appointmentForm.module.css";

// import Button from "@/app/components/button/Button";

import {
  LucideArrowLeft,
  LucideCalendar,
  LucideClock,
  LucideMapPin,
  LucideUser,
} from "lucide-react";

const BookingConfirmation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get appointment details from URL params
  const name = searchParams.get("name") || "";
  const specialty = searchParams.get("specialty") || "";
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";
  const location = searchParams.get("location") || "";
  const typeofConsult = searchParams.get("typeofConsult") || "online";
  const doctorId = searchParams.get("doctorId") || "";

  // Patient form state
  const [patientInfo, setPatientInfo] = useState({
    fullName: "",
    age: "",
    gender: "",
    phoneNumber: "",
    email: "",
    healthProblem: "",
  });

  //useEffect to get user data
  useEffect(() => {
    async function fetching() {
      const fetchUesr = await (
        await fetch("http://localhost:8080/api/user", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "GET",
          credentials: "include",
        })
      ).json();
      console.log(fetchUesr);
    }
    fetching();
  }, []);
  //@ts-ignore
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Here you would send the appointment data to your API
      console.log("Submitting appointment:", {
        doctorId,
        name,
        specialty,
        date,
        time,
        location,
        typeofConsult,
        patientInfo,
      });

      // Navigate to success page or show confirmation
      alert("Appointment confirmed successfully!");
      router.push("/"); // Or navigate to a success page
    } catch (error) {
      console.error("Error confirming appointment:", error);
      alert(
        "There was an error confirming your appointment. Please try again."
      );
    }
  };

  async function handleSubmitbtn() {
    const response = await (
      await fetch("http://localhost:8080/api/appointments/book", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",

          //   'authorization':Bearer ${localStorage.getItem('token')}
        },
        method: "PUT",
        body: JSON.stringify({ userInfo: JSON.stringify(patientInfo) }),
        credentials: "include",
      })
    ).json();
  }

  return (
    <>
      <main className={styles.container}>
        <div className={styles.confirmationCard}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <LucideArrowLeft size={16} />
            <span>Back to Appointment Booking</span>
          </button>

          <h1 className={styles.pageTitle}>Confirm Appointment Details</h1>

          <div className={styles.appointmentSummary}>
            <h2 className={styles.sectionTitle}>Appointment Summary</h2>

            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Doctor</span>
                <span className={styles.summaryValue}>{name}</span>
                <span className={styles.summarySubValue}>{specialty}</span>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Date & Time</span>
                <div className={styles.summaryWithIcon}>
                  <LucideCalendar size={14} />
                  <span className={styles.summaryValue}>{date}</span>
                </div>
                <div className={styles.summaryWithIcon}>
                  <LucideClock size={14} />
                  <span className={styles.summaryValue}>{time}</span>
                </div>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Appointment Type</span>
                <span className={styles.summaryValue}>
                  {typeofConsult === "online"
                    ? "Video Consultation"
                    : "Hospital Visit"}
                </span>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Location</span>
                <div className={styles.summaryWithIcon}>
                  <LucideMapPin size={14} />
                  <span className={styles.summaryValue}>{location}</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.patientForm}>
            <h2 className={styles.sectionTitle}>Patient Information</h2>

            <div className={styles.formGroup}>
              <label htmlFor="fullName" className={styles.formLabel}>
                Full Name
              </label>
              <div className={styles.inputWithIcon}>
                <LucideUser size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter patient's full name"
                  value={patientInfo.fullName}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="age" className={styles.formLabel}>
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  placeholder="Enter age"
                  value={patientInfo.age}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="gender" className={styles.formLabel}>
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={patientInfo.gender}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber" className={styles.formLabel}>
                Phone Number
              </label>
              <div className={styles.inputWithIcon}>
                <span className={styles.inputIcon}>📱</span>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Enter phone number"
                  value={patientInfo.phoneNumber}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                Email Address
              </label>
              <div className={styles.inputWithIcon}>
                <span className={styles.inputIcon}>✉️</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter email address"
                  value={patientInfo.email}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="healthProblem" className={styles.formLabel}>
                Health Problem{" "}
                <span className={styles.optionalLabel}>(Optional)</span>
              </label>
              <div className={styles.inputWithIcon}>
                <span className={styles.inputIcon}>📋</span>
                <textarea
                  id="healthProblem"
                  name="healthProblem"
                  placeholder="Briefly describe your health problem"
                  value={patientInfo.healthProblem}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                />
              </div>
            </div>

            {/* <Button
              text="Confirm Appointment"
              onClick={() => handleSubmitbtn()}
              type="submit"
              variant="largeGreenBtn"
            /> */}
          </form>
        </div>
      </main>
    </>
  );
};

export default BookingConfirmation;
