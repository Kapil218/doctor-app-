"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

const StatusBadge = ({ status }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return styles.statusApproved;
      case "rejected":
        return styles.statusRejected;
      case "completed":
        return styles.statusCompleted;
      default:
        return styles.statusPending;
    }
  };

  return (
    <span className={`${styles.statusBadge} ${getStatusBadgeClass(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const AppointmentRow = ({ appointment, onStatusChange }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className={styles.appointmentRow}>
      <div className={styles.cell} data-label="Patient ID">
        {appointment.patient_id}
      </div>
      <div className={styles.cell} data-label="Doctor ID">
        {appointment.doctor_id}
      </div>
      <div className={styles.cell} data-label="Date & Time">
        {formatDate(appointment.appointment_time)}
      </div>
      <div className={styles.cell} data-label="Location">
        {appointment.location}
      </div>
      <div className={styles.cell} data-label="Type">
        {appointment.consultation_type}
      </div>
      <div className={styles.cell} data-label="Status">
        <StatusBadge status={appointment.status} />
      </div>
      <div className={styles.cell} data-label="Actions">
        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionButton} ${styles.approveButton}`}
            onClick={() => onStatusChange(appointment.id, "approved")}
            disabled={appointment.status === "approved" || appointment.status === "completed"}
          >
            Approve
          </button>
          <button
            className={`${styles.actionButton} ${styles.completeButton}`}
            onClick={() => onStatusChange(appointment.id, "completed")}
            disabled={appointment.status === "completed" || appointment.status === "rejected" || appointment.status === "pending"}
          >
            Complete
          </button>
          <button
            className={`${styles.actionButton} ${styles.rejectButton}`}
            onClick={() => onStatusChange(appointment.id, "rejected")}
            disabled={appointment.status === "rejected" || appointment.status === "completed"}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const AppointmentsHeader = () => (
  <div className={styles.appointmentsHeader}>
    <div className={styles.headerCell}>Patient ID</div>
    <div className={styles.headerCell}>Doctor ID</div>
    <div className={styles.headerCell}>Date & Time</div>
    <div className={styles.headerCell}>Location</div>
    <div className={styles.headerCell}>Type</div>
    <div className={styles.headerCell}>Status</div>
    <div className={styles.headerCell}>Actions</div>
  </div>
);

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateOrder, setDateOrder] = useState("newest");
  const [consultationTypes, setConsultationTypes] = useState([]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/appointments', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.data);
      setFilteredAppointments(data.data);
      
      // Extract unique consultation types
      const types = [...new Set(data.data.map(app => app.consultation_type))];
      setConsultationTypes(types);
      
      setError(null);
    } catch (err) {
      setError('Failed to load appointments');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = [...appointments];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(app => app.consultation_type === typeFilter);
    }
    
    // Apply date ordering
    filtered.sort((a, b) => {
      const dateA = new Date(a.appointment_time);
      const dateB = new Date(b.appointment_time);
      
      if (dateOrder === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
    
    setFilteredAppointments(filtered);
  }, [statusFilter, typeFilter, dateOrder, appointments]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/appointments/updateStatus', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          status: newStatus
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update status');
      }

      // Refresh appointments after status change
      await fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update appointment status');
    }
  };

  const handleFilterChange = (e, filterType) => {
    const value = e.target.value;
    
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'type':
        setTypeFilter(value);
        break;
      case 'date':
        setDateOrder(value);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading appointments...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.pageTitle}>Appointment Requests</h1>
        
        <div className={styles.filtersWrapper}>
          <div className={styles.filterContainer}>
            <label htmlFor="statusFilter" className={styles.filterLabel}>
              Status:
            </label>
            <select
              id="statusFilter"
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => handleFilterChange(e, 'status')}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className={styles.filterContainer}>
            <label htmlFor="typeFilter" className={styles.filterLabel}>
              Type:
            </label>
            <select
              id="typeFilter"
              className={styles.filterSelect}
              value={typeFilter}
              onChange={(e) => handleFilterChange(e, 'type')}
            >
              <option value="all">All Types</option>
              {consultationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.filterContainer}>
            <label htmlFor="dateOrder" className={styles.filterLabel}>
              Date:
            </label>
            <select
              id="dateOrder"
              className={styles.filterSelect}
              value={dateOrder}
              onChange={(e) => handleFilterChange(e, 'date')}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.appointmentsContainer}>
        <AppointmentsHeader />
        
        {filteredAppointments.length === 0 ? (
          <div className={styles.noAppointments}>No appointments found</div>
        ) : (
          filteredAppointments.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard; 