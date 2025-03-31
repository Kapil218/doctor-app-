"use client";

import style from "./schedule-appointment.module.css";
import React from "react";
import BookAppointment from '../../../components/bookAppointment/page'
import Footer from "@/components/footer/page";

export default function ScheduleAppointmentPage() {
  return (
    <div className={style.container}>
      <div className={style.wrapper}>
        {/* Left side - Hero text */}
        <div className={style.hero_text}>
          <h1>
            Book Your Next<br />
            Doctor Visit in<br />
            Seconds.
          </h1>
          <p>
            CareMate helps you find the best healthcare provider by specialty, location, and more, ensuring you get the care you need.
          </p>
        </div>

        {/* Right side - Background image and form */}
        <div className={style.hero_img}>
          <div className={style.appointmentContainer}>
            <BookAppointment />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
