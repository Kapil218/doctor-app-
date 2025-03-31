"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import style from "./signup.module.css";
import Link from "next/link";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        router.push("/login"); // Redirect user after successful registration
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.form_wrapper}>
        <h2>Sign Up</h2>
        <p>
          <span>Already a member? </span>
          <Link href="/login" className={style.signup_link}>
            Login.
          </Link>
        </p>
        <div className={style.form_fields_wrapper}>
          <form className={style.form_fields} onSubmit={handleSignup}>
            <label htmlFor="name"> Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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
              {loading ? "Registering..." : "Submit"}
            </button>

            <button
              type="reset"
              onClick={() => {
                setName("");
                setEmail("");
                setPassword("");
              }}
            >
              Reset
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
