"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./doctorPage.module.css";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: string;
  degree: string;
  location: string;
  gender: string;
  image?: string;
  available_times?: Record<string, { morning?: string[]; evening?: string[] }>;
}

type DoctorReview = {
  review_id: number;
  review: string;
  rating: number;
  created_at: string;
  patient_name: string;
};

const DoctorProfile = () => {
  const { id } = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<DoctorReview[]>([]);

  const today = new Date();
  const todayDateString = today.toISOString().split("T")[0];

  const formatDate = (dateString: string) => {
    if (!dateString) return "Invalid Date";

    const dateParts = dateString.split("-");
    if (dateParts.length !== 3) return "Invalid Date";

    const [year, month, day] = dateParts.map(Number);
    const dateObj = new Date(year, month - 1, day);

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        if (!id) return;
        const res = await fetch(`http://localhost:3000/api/v1/doctors/${id}`);
        const data = await res.json();
        setDoctor(data.data);
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      }
    };

    const fetchDoctorReviews = async () => {
      try {
        if (!id) return;
        const res = await fetch(`http://localhost:3000/api/v1/reviews/doctor-reviews/${id}`, {
          credentials: 'include'
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch reviews');
        }

        const data = await res.json();
        setReviews(data.data || []);
      } catch (error) {
        console.error('Error fetching doctor reviews:', error);
      }
    };

    fetchDoctor();
    fetchDoctorReviews();
  }, [id]);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          ← Back to Doctors List
        </button>
        <button
          className={styles.bookButton}
          onClick={() => router.push(`/doctors/${doctor?.id}/bookAppointment`)}
        >
          Book Appointment
        </button>
      </header>

      <div className={styles.profileSection}>
        <div className={styles.leftColumn}>
          <img
            src={doctor?.image || "/defaultpic.jpg"}
            alt={doctor?.name || "Doctor"}
            className={styles.profileImage}
          />
        </div>
        <div className={styles.rightColumn}>
          <h1>{doctor?.name}</h1>
          <p className={styles.specialty}>{doctor?.specialty}</p>
          <p><strong>Experience:</strong> {doctor?.experience} years</p>
          <p><strong>Degree:</strong> {doctor?.degree}</p>
          <p><strong>Location:</strong> {doctor?.location}</p>
          <p><strong>Gender:</strong> {doctor?.gender}</p>
          <p>
            <strong>Rating:</strong>{" "}
            {doctor?.rating && parseFloat(doctor.rating) > 0
              ? "⭐".repeat(Math.round(parseFloat(doctor.rating)))
              : "No ratings yet"}
          </p>
        </div>
      </div>

      <div className={styles.appointmentSection}>
        <h2>Available Appointment Slots</h2>
        {doctor?.available_times && Object.keys(doctor.available_times).length > 0 ? (
          Object.entries(doctor.available_times)
            .filter(([date]) => date >= todayDateString)
            .map(([date, slots]) => {
              const allSlots = [...(slots.morning || []), ...(slots.evening || [])];

              return (
                <div key={date} className={styles.dateContainer}>
                  <h3 className={styles.dateHeader}>{formatDate(date)}</h3>
                  <div className={styles.slotContainer}>
                    {allSlots.length > 0 ? (
                      allSlots.map((time) => (
                        <span key={time} className={styles.slotPill}>
                          {time}
                        </span>
                      ))
                    ) : (
                      <p className={styles.noSlots}>No slots available</p>
                    )}
                  </div>
                </div>
              );
            })
        ) : (
          <p className={styles.noSlots}>No available appointment slots</p>
        )}
      </div>

      {/* Reviews Section */}
      <div className={styles.reviewsSection}>
        <h2 className={styles.sectionTitle}>Patient Reviews</h2>
        
        {reviews.length > 0 && (
          <div className={styles.reviewsSummary}>
            <div className={styles.averageRating}>
              <div className={styles.ratingNumber}>
                {(reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)}
              </div>
              <div className={styles.stars}>
                {[...Array(5)].map((_, index) => (
                  <span 
                    key={index}
                    className={styles.star}
                  >
                    {index < Math.round(reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length) 
                      ? "★" 
                      : "☆"}
                  </span>
                ))}
              </div>
              <div className={styles.totalReviews}>
                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              </div>
            </div>
          </div>
        )}

        <div className={styles.reviewsList}>
          {reviews.map((review) => (
            <div key={review.review_id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  <h3>{review.patient_name}</h3>
                  <span className={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.reviewRating}>
                  {[...Array(5)].map((_, index) => (
                    <span key={index}>
                      {index < review.rating ? "★" : "☆"}
                    </span>
                  ))}
                </div>
              </div>
              <p className={styles.reviewText}>{review.review}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className={styles.noReviews}>No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
