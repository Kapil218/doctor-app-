"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const ADMIN_EMAIL = "admin@tothenew.com";

const LoginHeader = () => (
  <div className={styles.loginHeader}>
    <h1 className={styles.loginTitle}>Admin Login</h1>
    <p className={styles.loginSubtitle}>Doctor Appointment System</p>
  </div>
);

const FormInput = ({ type, id, name, value, onChange, placeholder, label }) => (
  <div className={styles.formGroup}>
    <label htmlFor={id} className={styles.formLabel}>
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={styles.formInput}
      placeholder={placeholder}
      required
    />
  </div>
);

const LoginForm = ({ formData, onSubmit, onChange, error }) => (
  <form onSubmit={onSubmit} className={styles.loginForm}>
    {error && <div className={styles.errorMessage}>{error}</div>}
    
    <FormInput
      type="email"
      id="email"
      name="email"
      value={formData.email}
      onChange={onChange}
      placeholder="Enter admin email"
      label="Email"
    />

    <FormInput
      type="password"
      id="password"
      name="password"
      value={formData.password}
      onChange={onChange}
      placeholder="Enter your password"
      label="Password"
    />

    <button type="submit" className={styles.loginButton}>
      Login
    </button>
  </form>
);

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    // Check if the email is the admin email
    if (formData.email !== ADMIN_EMAIL) {
      setError("Access denied. Only admin login is allowed.");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to login');
      }

      // If login is successful, redirect to admin dashboard
      router.push('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <LoginHeader />
        <LoginForm
          formData={formData}
          onSubmit={handleSubmit}
          onChange={handleChange}
          error={error}
        />
      </div>
    </div>
  );
};

export default LoginPage; 