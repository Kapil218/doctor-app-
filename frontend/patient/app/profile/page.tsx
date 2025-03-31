"use client";
import { useEffect, useState } from "react";
import styles from "./profile.module.css";

type UserAppointment = {
  id: number;
  doctor_id: number;
  appointment_time: string;
  location: string;
  consultation_type: string;
  status: string;
  doctor_name: string;
};

type UserProfile = {
  name: string;
  email: string;
};

export default function UserProfile() {
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter appointments by status
  const pendingAppointments = appointments.filter(app => app.status.toLowerCase() === 'pending');
  const acceptedAppointments = appointments.filter(app => app.status.toLowerCase() === 'accepted');
  const rejectedAppointments = appointments.filter(app => app.status.toLowerCase() === 'rejected');
  const completedAppointments = appointments.filter(app => app.status.toLowerCase() === 'completed');

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const [profileRes, appointmentsRes] = await Promise.all([
          fetch("http://localhost:3000/api/v1/users/profile", {
            credentials: "include",
          }),
          fetch("http://localhost:3000/api/v1/appointments/get-user-appointments", {
            credentials: "include",
          })
        ]);

       

        const profileData = await profileRes.json();
        const appointmentsData = await appointmentsRes.json();
console.log(appointmentsData,profileData);

        setUserInfo(profileData.data);
        setAppointments(appointmentsData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const AppointmentList = ({ appointments, title }: { appointments: UserAppointment[], title: string }) => (
    appointments.length > 0 ? (
      <div className={styles.appointmentCategory}>
        <h3 className={styles.categoryTitle}>{title} ({appointments.length})</h3>
        <div className={styles.appointmentsList}>
          {appointments.map((appointment) => (
            <div key={appointment.id} className={styles.appointmentCard}>
              <div className={styles.appointmentHeader}>
                <h3>Dr. {appointment.doctor_name}</h3>
                <span className={`${styles.status} ${styles[appointment.status.toLowerCase()]}`}>
                  {appointment.status}
                </span>
              </div>
              <div className={styles.appointmentDetails}>
                <div className={styles.detail}>
                  <span className={styles.label}>Date & Time:</span>
                  <span>{new Date(appointment.appointment_time).toLocaleString()}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Location:</span>
                  <span>{appointment.location}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.label}>Type:</span>
                  <span>{appointment.consultation_type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null
  );

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      {/* User Info Section */}
      <section className={styles.userSection}>
        <h1 className={styles.title}>My Profile</h1>
        <div className={styles.userCard}>
          <div className={styles.userInfo}>
            <div className={styles.infoGroup}>
              <label>Name</label>
              <p>{userInfo?.name}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>Email</label>
              <p>{userInfo?.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Appointments Sections */}
      <section className={styles.appointmentsSection}>
        <h2 className={styles.subtitle}>My Appointments</h2>
        
        {appointments.length === 0 ? (
          <p className={styles.noAppointments}>No appointments found</p>
        ) : (
          <>
            <AppointmentList appointments={pendingAppointments} title="Pending Appointments" />
            <AppointmentList appointments={acceptedAppointments} title="Accepted Appointments" />
            <AppointmentList appointments={rejectedAppointments} title="Rejected Appointments" />
            <AppointmentList appointments={completedAppointments} title="Completed Appointments" />
          </>
        )}
      </section>
    </div>
  );
} 