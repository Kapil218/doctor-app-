"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import style from "./login.module.css";
import Link from "next/link";
import Image from "next/image";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // ✅ This ensures cookies sent from the backend are stored in the browser
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/"); // Redirect user after successful login
      } else {
        alert(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      window.location.href = "http://localhost:3000/api/v1/users/login/google";
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.form_wrapper}>
        <h2>Login</h2>
        <p className={style.signup_text}>
          Are you a new member?{" "}
          <Link href="/signup" className={style.signup_link}>
            Sign up here.
          </Link>
        </p>

        <div className={style.form_fields_wrapper}>
          <form className={style.form_fields} onSubmit={handleLogin}>
            <label htmlFor="email"> Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="password"> Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <button
              type="reset"
              onClick={() => {
                setEmail("");
                setPassword("");
              }}
            >
              Reset
            </button>
            <p>Forgot password?</p>
          </form>
        </div>

        <div className={style.divider}>
          <span>OR</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className={style.googleButton}
        >
          <Image
            src="/google-icon.svg" // Make sure to add this image to your public folder
            alt="Google"
            width={20}
            height={20}
          />
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
}
