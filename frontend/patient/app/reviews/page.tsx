"use client";
import { useState, useEffect } from 'react';
import styles from "./reviews.module.css";

type Review = {
  id: number;
  patient_id: number;
  doctor_id: number;
  rating: number;
  review: string;
  created_at: string;
  appointment_id: number;
};

type PendingAppointment = {
  appointment_id: number;
  doctor_id: number;
  appointment_time: string;
  location: string;
  consultation_type: string;
  status: string;

};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<PendingAppointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<PendingAppointment | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');

  const fetchReviewHistory = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/reviews", {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      setReviews(result.data || []);
    } catch (error) {
      console.error("Failed to fetch review history:", error);
      setReviews([]);
    }
  };

  const fetchPendingReviews = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/reviews/review-pending", {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      setPendingAppointments(result.data || []);
    } catch (error) {
      console.error("Failed to fetch pending reviews:", error);
      setPendingAppointments([]);
    }
  };

  const handleSubmitReview = async () => {
    if (!currentAppointment) return;
    setError('');

    try {
      console.log('Current Appointment:', currentAppointment);
      
      const reviewData = {
        doctor_id: currentAppointment.doctor_id,
        appointment_id: currentAppointment.appointment_id,
        review: reviewText,
        rating: rating
      };

      console.log('Sending review data:', reviewData);

      const res = await fetch("http://localhost:3000/api/v1/reviews/add-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(reviewData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to submit review');
      }

      const data = await res.json();
      setIsModalOpen(false);
      setRating(0);
      setReviewText('');
      fetchReviewHistory();
      fetchPendingReviews();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit review');
      console.error("Failed to submit review:", error);
    }
  };

  useEffect(() => {
    fetchReviewHistory();
    fetchPendingReviews();
  }, []);

  return (
    <main className={styles.container}>
      <h1 className={styles.mainTitle}>My Reviews</h1>

      {/* Pending Reviews Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Pending Reviews</h2>
        <div className={styles.pendingList}>
          {pendingAppointments.map((appointment) => (
            <div key={appointment.appointment_id} className={styles.pendingCard}>
              <div className={styles.appointmentInfo}>
                <h3>Doctor ID: {appointment.doctor_id}</h3>
                <p>Date: {new Date(appointment.appointment_time).toLocaleDateString()}</p>
                <p>Type: {appointment.consultation_type}</p>
                <p>Location: {appointment.location}</p>
              </div>
              <button
                className={styles.reviewButton}
                onClick={() => {
                  console.log('Selected appointment:', appointment);
                  setCurrentAppointment(appointment);
                  setIsModalOpen(true);
                }}
              >
                Write Review
              </button>
            </div>
          ))}
          {pendingAppointments.length === 0 && (
            <p className={styles.noReviews}>No pending reviews</p>
          )}
        </div>
      </section>

      {/* Given Reviews Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Reviews Given</h2>
        <div className={styles.reviewsList}>
          {reviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <h3>Doctor ID: {review.doctor_id}</h3>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, index) => (
                    <span 
                      key={index} 
                      className={index < review.rating ? styles.starActive : styles.starInactive}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className={styles.reviewText}>"{review.review}"</p>
              <p className={styles.reviewDate}>
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className={styles.noReviews}>No reviews given yet</p>
          )}
        </div>
      </section>

      {/* Review Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={() => {
                setIsModalOpen(false);
                setError('');
                setRating(0);
                setReviewText('');
              }}
            >
              ×
            </button>
            
            <div className={styles.modalContent}>
              <h2>Write Your Review</h2>
              
              {error && <p className={styles.errorMessage}>{error}</p>}

              <div className={styles.appointmentDetails}>
                <p>Appointment Date: {currentAppointment && new Date(currentAppointment.appointment_time).toLocaleDateString()}</p>
                <p>Location: {currentAppointment?.location}</p>
                <p>Type: {currentAppointment?.consultation_type}</p>
              </div>
              
              <div className={styles.ratingSection}>
                <label>Your Rating</label>
                <div className={styles.ratingContainer}>
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <span
                        key={index}
                        className={ratingValue <= (hover || rating) ? styles.starActive : styles.starInactive}
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                      >
                        ★
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className={styles.reviewSection}>
                <label>Your Review</label>
                <textarea
                  className={styles.reviewInput}
                  placeholder="Share your experience with the doctor..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </div>

              <button 
                className={styles.submitButton}
                onClick={handleSubmitReview}
                disabled={!rating || !reviewText}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}