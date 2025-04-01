"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./bookAppointment.module.css";

interface Doctor {
  name: string;
  location: string;
  available_times: Record<string, Record<string, string[]>>; // { date: { time_period: [slots] } }
}

const AppointmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [doctorData, setDoctorData] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<"video" | "hospital">("video");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const timeCategories = {
    morning: { label: "Morning", start: "09:00", end: "11:59" },
    afternoon: { label: "Afternoon", start: "12:00", end: "15:59" },
    evening: { label: "Evening", start: "16:00", end: "18:00" },
  };

  const convertTo12HourFormat = (time24: string) => {
    const [hour, minute] = time24.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const generateTimeSlots = (start: string, end: string) => {
    const slots = [];
    let current = start;

    while (current <= end) {
      slots.push(current);
      const [h, m] = current.split(":").map(Number);
      const nextHour = h + (m === 30 ? 1 : 0);
      const nextMin = m === 30 ? "00" : "30";
      current = `${nextHour.toString().padStart(2, "0")}:${nextMin}`;
    }

    return slots;
  };

  const getFilteredSlots = (
    availableSlots: string[],
    start: string,
    end: string
  ) => {
    const allSlots = generateTimeSlots(start, end);
    return allSlots.map((slot) => ({
      time: slot,
      available: availableSlots.includes(slot),
    }));
  };

  const generateDates = () => {
    const today = new Date();
    const selectedMonth = currentMonth.getMonth();
    const selectedYear = currentMonth.getFullYear();
    
    // Get first and last day of selected month
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    
    const dates = [];
    
    // If selected month is current month, start from today
    // Otherwise, start from first day of selected month
    const startDate = selectedMonth === today.getMonth() && 
                     selectedYear === today.getFullYear() 
                     ? today 
                     : firstDay;

    // Generate dates from start date to last day of month
    for (let d = new Date(startDate); d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push({
        day: d.toLocaleString("en-US", { weekday: "short" }),
        date: d.getDate(),
        month: d.toLocaleString("en-US", { month: "short" }),
        fullDate: d.toISOString().split("T")[0],
      });
    }
    
    return dates;
  };

  const handleBookAppointment = async () => {
    if (!id || !selectedDate || !selectedTime || !doctorData) return;

    setBooking(true);

    const shift = Object.keys(timeCategories).find(
      (key) =>
        selectedTime >=
          timeCategories[key as keyof typeof timeCategories].start &&
        selectedTime <= timeCategories[key as keyof typeof timeCategories].end
    );

    const appointmentData = {
      doctor_id: Number(id),
      appointment_time: {
        date: selectedDate,
        shift: shift || "unknown",
        slot_time: selectedTime,
      },
      location: selectedTab === "video" ? "Online" : selectedLocation,
      consultation_type: selectedTab,
    };

    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/appointments/book-appointment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointmentData),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Appointment booked successfully!");
        router.push("/appointments"); // Redirect after booking
      } else {
        alert(data.message || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const availableDates = generateDates();

  const isBeforeCurrentMonth = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() < today.getFullYear() ||
      (date.getFullYear() === today.getFullYear() && 
       date.getMonth() < today.getMonth())
    );
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() - 1);
    
    if (!isBeforeCurrentMonth(newDate)) {
      setCurrentMonth(newDate);
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const handleDateScroll = () => {
    const dateSelector = document.querySelector(`.${styles.dateSelector}`);
    if (dateSelector) {
      // Scroll by the width of 3 date buttons (including gap)
      dateSelector.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleBackScroll = () => {
    const dateSelector = document.querySelector(`.${styles.dateSelector}`);
    if (dateSelector) {
      dateSelector.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    async function fetchDoctor() {
      if (!id) return;
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3000/api/v1/doctors/${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch doctor");

        const fetchData = await response.json();
        console.log("Fetched doctor data:", fetchData);

        setDoctorData({
          name: fetchData.data.name,
          location: fetchData.data.location || "",
          available_times: fetchData.data.available_times || {},
        });

        setSelectedLocation(fetchData.data.location || "");

        setLoading(false);
      } catch (error) {
        console.error("Error fetching doctor:", error);
        setLoading(false);
      }
    }
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    if (!doctorData?.available_times) return;

    const firstAvailableDate = availableDates.find(
      (d) =>
        doctorData?.available_times?.[d.fullDate] &&
        Object.values(doctorData.available_times[d.fullDate]).some(
          (slots) => slots.length > 0
        )
    );

    setSelectedDate(firstAvailableDate ? firstAvailableDate.fullDate : "");
  }, [doctorData]);

  return (
    <>
      <main className={styles.hero}>
        <div className={styles.scdcontainer}>
          <div className={styles.slotContainer}>
            <div className={styles.heading_and_button}>
              <span>Schedule Appointment</span>
              <button
                className={styles.bookButton}
                disabled={!selectedTime || booking}
                onClick={handleBookAppointment}
              >
                {booking ? "Booking..." : "Book Appointment"}
              </button>
            </div>

            {/* Tabs for Consultation Type */}
            <div className={styles.consultationTabs}>
              <button
                className={`${styles.tabButton} ${
                  selectedTab === "video" ? styles.activeTab : ""
                }`}
                onClick={() => setSelectedTab("video")}
              >
                Book Video Consult
              </button>

              <button
                className={`${styles.tabButton} ${
                  selectedTab === "hospital" ? styles.activeTab : ""
                }`}
                onClick={() => setSelectedTab("hospital")}
              >
                Book Hospital Visit
              </button>
            </div>

            {/* Only show location when hospital visit is selected */}
            {selectedTab === "hospital" && (
              <div className={styles.locationSelector}>
                <div className={styles.locationDisplay}>
                  <span>MedicareHeart Institute, Okhla Road</span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                    className={styles.chevronIcon}
                  >
                    <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            )}

            <div className={styles.monthSelector}>
              <button 
                onClick={handlePreviousMonth} 
                className={styles.monthNav}
                disabled={isBeforeCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span className={styles.currentMonth}>
                {currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button onClick={handleNextMonth} className={styles.monthNav}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className={styles.dateScrollContainer}>
              <button 
                className={styles.dateScrollButton}
                onClick={handleBackScroll}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className={styles.dateSelector}>
                {availableDates.map((d) => {
                  const hasSlots =
                    doctorData?.available_times?.[d.fullDate] &&
                    Object.values(doctorData.available_times[d.fullDate]).some(
                      (slots) => slots.length > 0
                    );

                  return (
                    <button
                      key={d.fullDate}
                      className={`${styles.dateButton} ${
                        selectedDate === d.fullDate ? styles.selectedDate : ''
                      } ${!hasSlots ? styles.unavailableDate : ''}`}
                      onClick={() => setSelectedDate(d.fullDate)}
                    >
                      <span className={styles.day}>{d.day}</span>
                      <span className={styles.date}>
                        {d.date} {d.month}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button 
                className={styles.dateScrollButton}
                onClick={handleDateScroll}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className={styles.slotsContainer}>
              {selectedDate ? (
                doctorData?.available_times?.[selectedDate] ? (
                  Object.entries(timeCategories).map(([key, { label, start, end }]) => {
                    const slots = getFilteredSlots(
                      doctorData.available_times[selectedDate]?.[key] || [],
                      start,
                      end
                    );
                    return (
                      <div key={key} className={styles.timeSection}>
                        {slots.length > 0 && (
                          <>
                            <div className={styles.timeHeader}>
                              <span>{label}</span>
                              <span className={styles.slotCount}>
                                {slots.filter(({ available }) => available).length} Slots
                              </span>
                            </div>
                            <div className={styles.slotContainer}>
                              {slots.map((slot) => (
                                <button
                                  key={slot.time}
                                  className={`${styles.slotButton} ${
                                    slot.available ? styles.available : styles.unavailable
                                  } ${selectedTime === slot.time ? styles.selectedTime : ''}`}
                                  onClick={() => slot.available && setSelectedTime(slot.time)}
                                  disabled={!slot.available}
                                >
                                  {convertTo12HourFormat(slot.time)}
                                  {!slot.available && (
                                    <span className={styles.tooltip}>Not Available</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.noAvailabilityMessage}>
                    Doctor not available on this date
                  </div>
                )
              ) : (
                <p className={styles.noSlotsMessage}>Please select a date</p>
              )}
            </div>

            <button className={styles.nextButton} disabled={!selectedTime}>
              Next
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default AppointmentPage;