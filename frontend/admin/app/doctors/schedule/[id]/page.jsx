"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import styles from "./page.module.css";

const SelectedTimeSlots = ({ slots, onRemoveSlot }) => {
  return (
    <div className={styles.slotTags}>
      {slots.map((slot) => (
        <div key={slot} className={styles.slotTag}>
          {slot}
          <button
            type="button"
            onClick={() => onRemoveSlot(slot)}
            className={styles.removeSlotButton}
            title="Remove time slot"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

const DoctorSchedule = ({ params }) => {
  const unwrappedParams = use(params);
  const router = useRouter();
  const editSectionRef = useRef(null);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [editingDate, setEditingDate] = useState(null);

  const timeSlots = {
    morning: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
    afternoon: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
    evening: ["16:00", "16:30", "17:00", "17:30"]
  };

  // Helper function to check if a date is in the past
  const isPastDate = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(dateStr);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  // Filter out past dates from schedule
  const filterPastDates = (scheduleData) => {
    const filteredSchedule = {};
    Object.entries(scheduleData).forEach(([date, slots]) => {
      if (!isPastDate(date)) {
        filteredSchedule[date] = slots;
      }
    });
    return filteredSchedule;
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/v1/doctors/${unwrappedParams.id}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch schedule");
        }

        const data = await response.json();
        // Filter out past dates when setting schedule
        setSchedule(filterPastDates(data.data?.available_times || {}));
      } catch (err) {
        setError(err.message);
        console.error("Error fetching schedule:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [unwrappedParams.id]);

  const handleDateAdd = () => {
    if (!selectedDate || selectedSlots.length === 0) return;

    // Prevent adding past dates
    if (isPastDate(selectedDate)) {
      setError("Cannot add slots for past dates");
      return;
    }

    setSchedule(prev => ({
      ...prev,
      [selectedDate]: {
        morning: selectedSlots.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour < 12;
        }),
        afternoon: selectedSlots.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour >= 12 && hour < 16;
        }),
        evening: selectedSlots.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour >= 16;
        })
      }
    }));

    setSelectedDate("");
    setSelectedSlots([]);
    setError(null);
  };

  const handleDateRemove = (dateToRemove) => {
    const newSchedule = { ...schedule };
    delete newSchedule[dateToRemove];
    setSchedule(newSchedule);
    if (editingDate === dateToRemove) {
      setEditingDate(null);
    }
  };

  const handleEditDate = (date) => {
    setEditingDate(date);
    // Flatten all slots for the date into selectedSlots
    const periods = schedule[date];
    const allSlots = [...(periods.morning || []), ...(periods.afternoon || []), ...(periods.evening || [])];
    setSelectedSlots(allSlots);
    
    // Use setTimeout to ensure the scroll happens after state updates
    setTimeout(() => {
      if (editSectionRef.current) {
        const yOffset = -20; // Add some padding from the top
        const element = editSectionRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleUpdateDate = () => {
    if (!editingDate || selectedSlots.length === 0) return;

    setSchedule(prev => ({
      ...prev,
      [editingDate]: {
        morning: selectedSlots.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour < 12;
        }),
        afternoon: selectedSlots.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour >= 12 && hour < 16;
        }),
        evening: selectedSlots.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour >= 16;
        })
      }
    }));

    setEditingDate(null);
    setSelectedSlots([]);
  };

  const handleSlotToggle = (slot) => {
    setSelectedSlots(prev => {
      if (prev.includes(slot)) {
        return prev.filter(s => s !== slot);
      } else {
        return [...prev, slot].sort();
      }
    });
  };

  const handleRemoveSlot = (date, slot) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      const dateSlots = newSchedule[date];
      
      // Find which period contains this slot and remove it
      for (const period in dateSlots) {
        const slotIndex = dateSlots[period].indexOf(slot);
        if (slotIndex !== -1) {
          dateSlots[period] = dateSlots[period].filter(s => s !== slot);
          
          // If period is empty, remove it
          if (dateSlots[period].length === 0) {
            delete dateSlots[period];
          }
          
          // If no periods left, remove the date
          if (Object.keys(dateSlots).length === 0) {
            delete newSchedule[date];
          }
          break;
        }
      }
      
      return newSchedule;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/doctors/update/${unwrappedParams.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ available_times: schedule }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update schedule");
      }

      router.push("/doctors");
    } catch (err) {
      setError(err.message);
      console.error("Error updating schedule:", err);
    }
  };

  const handleQuickAddWeek = () => {
    const newSchedule = { ...schedule };
    const today = new Date();
    
    // Add next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      // Only add if date doesn't already exist
      if (!newSchedule[dateString]) {
        newSchedule[dateString] = {
          morning: timeSlots.morning,
          afternoon: timeSlots.afternoon,
          evening: timeSlots.evening
        };
      }
    }

    setSchedule(newSchedule);
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.schedulePage}>
      <h1 className={styles.pageTitle}>Manage Doctor Schedule</h1>

      <form onSubmit={handleSubmit} className={styles.scheduleForm}>
        <div id="editSection" ref={editSectionRef} className={styles.addDateSection}>
          <h3>{editingDate ? `Edit Slots for ${new Date(editingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : 'Add New Date and Time Slots'}</h3>
          
          {error && <div className={styles.error}>{error}</div>}
          
          {!editingDate && (
            <div className={styles.quickAddSection}>
              <button
                type="button"
                onClick={handleQuickAddWeek}
                className={styles.quickAddButton}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" />
                </svg>
                Make Next 7 Days Available
              </button>
            </div>
          )}
          
          <div className={styles.dateSelector}>
            {!editingDate && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={styles.dateInput}
              />
            )}

            <div className={styles.timeSlotGroups}>
              {Object.entries(timeSlots).map(([period, slots]) => (
                <div key={period} className={styles.periodSection}>
                  <h4 className={styles.periodTitle}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </h4>
                  <div className={styles.slotGrid}>
                    {slots.map(slot => (
                      <label key={slot} className={styles.slotLabel}>
                        <input
                          type="checkbox"
                          checked={selectedSlots.includes(slot)}
                          onChange={() => handleSlotToggle(slot)}
                          className={styles.slotCheckbox}
                        />
                        <span>{slot}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {editingDate ? (
              <div className={styles.editActions}>
                <button
                  type="button"
                  onClick={handleUpdateDate}
                  disabled={selectedSlots.length === 0}
                  className={styles.updateButton}
                >
                  Update Slots
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDate(null);
                    setSelectedSlots([]);
                  }}
                  className={styles.cancelButton}
                >
                  Cancel Edit
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDateAdd}
                disabled={!selectedDate || selectedSlots.length === 0}
                className={styles.addButton}
              >
                Add Selected Slots
              </button>
            )}
          </div>
        </div>

        <div className={styles.scheduledDates}>
          <h3>Scheduled Dates</h3>
          
          {Object.keys(schedule).length === 0 ? (
            <p className={styles.noSchedule}>No dates scheduled yet</p>
          ) : (
            Object.entries(schedule).map(([date, periods]) => (
              <div key={date} className={`${styles.dateCard} ${editingDate === date ? styles.editing : ''}`}>
                <div className={styles.dateHeader}>
                  <h4>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                  <div className={styles.dateActions}>
                    <button
                      type="button"
                      onClick={() => handleEditDate(date)}
                      className={styles.editButton}
                      disabled={editingDate === date}
                    >
                      Edit Slots
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDateRemove(date)}
                      className={styles.removeButton}
                    >
                      Remove Date
                    </button>
                  </div>
                </div>
                {Object.entries(periods).map(([period, slots]) => (
                  slots.length > 0 && (
                    <div key={period} className={styles.periodSlots}>
                      <h5>{period.charAt(0).toUpperCase() + period.slice(1)}</h5>
                      <SelectedTimeSlots
                        slots={slots}
                        onRemoveSlot={(slot) => handleRemoveSlot(date, slot)}
                      />
                    </div>
                  )
                ))}
              </div>
            ))
          )}
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            Save Schedule
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorSchedule; 