"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./appointments.module.css";
import { useRouter } from "next/navigation";

interface Doctor {
  id: string;
  name: string;
  degree: string;
  specialty: string;
  experience: number;
  rating: string;
  image?: string;
}


const DoctorsPage = () => {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filters, setFilters] = useState({
    rating: "",
    experience: "",
    gender: "",
  });
  const [pendingFilters, setPendingFilters] = useState(filters);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const fetchDoctors = async () => {
      const params = new URLSearchParams();

      const filtersApplied =
        filters.rating || filters.experience || filters.gender;

      if (debouncedQuery.trim() !== "") {
        params.append("query", debouncedQuery);
      } else if (!filtersApplied) {
        params.append("topRated", "true");
      }

      if (filters.rating) params.append("rating", filters.rating);
      if (filters.experience) params.append("experience", filters.experience);
      if (filters.gender) params.append("gender", filters.gender);

      params.append("page", page.toString());
      params.append("perPage", "6");

      try {
        const res = await fetch(
          `http://localhost:3000/api/v1/doctors?${params}`
        );
        const data = await res.json();

        if (data.statusCode === 200) {
          setDoctors(data.data.doctors);
          setTotalPages(data.data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, [debouncedQuery, filters, page]);

  const handlePendingFilterChange = (key: string, value: string) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setFilters(pendingFilters);
    setPage(1);
  };

  const resetFilters = () => {
    setPendingFilters({ rating: "", experience: "", gender: "" });
    setFilters({ rating: "", experience: "", gender: "" });
    setPage(1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search doctors"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <h2 className={styles.header}>{doctors.length} doctors available</h2>
      <p className={styles.subHeader}>
        Book appointments with minimum wait-time & verified doctor details
      </p>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <div className={styles.filterHeader}>
            <div className={styles.filterTitle}>
              <h3>Filter By:</h3>
            </div>
            <div className={styles.filterButtons}>
              <span className={styles.resetButton} onClick={resetFilters}>
                Reset
              </span>
              <span className={styles.applyButton} onClick={applyFilters}>
                Apply
              </span>
            </div>
          </div>

          <div>
            <h4>Rating</h4>
            {["", "1", "2", "3", "4", "5"].map((r) => (
              <label key={r}>
                <input
                  type="radio"
                  name="rating"
                  value={r}
                  checked={pendingFilters.rating === r}
                  onChange={() => handlePendingFilterChange("rating", r)}
                />
                {r ? `${r} star` : "Show all"}
              </label>
            ))}
          </div>

          <div>
            <h4>Experience</h4>
            {["", "15", "10-15", "5-10", "3-5", "1-3", "0-1"].map((exp) => (
              <label key={exp}>
                <input
                  type="radio"
                  name="experience"
                  value={exp}
                  checked={pendingFilters.experience === exp}
                  onChange={() => handlePendingFilterChange("experience", exp)}
                />
                {exp ? `${exp} years` : "Show all"}
              </label>
            ))}
          </div>

          <div>
            <h4>Gender</h4>
            {["", "Male", "Female"].map((g) => (
              <label key={g}>
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={pendingFilters.gender === g}
                  onChange={() => handlePendingFilterChange("gender", g)}
                />
                {g || "Show all"}
              </label>
            ))}
          </div>
        </aside>

        <section className={styles.doctorsGrid}>
          {doctors.map((doctor) => (
            <div key={doctor.id} className={styles.doctorCard}>
              <img 
                src={doctor.image || "/defaultpic.jpg"} 
                alt={doctor.name}
                className={styles.doctorImage}
                onClick={() => router.push(`/doctors/${doctor.id}`)}
              />
              <h3 className={styles.doctorName}>
                {doctor.name}, {doctor.degree}
              </h3>
              <div className={styles.specialtyInfo}>
                <svg 
                  className={styles.specialtyIcon} 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <path d="M13 7h-2v5h5v-2h-3V7z"/>
                </svg>
                <span>{doctor.specialty}</span>
                <span>·</span>
                <span>{doctor.experience} Years</span>
              </div>
              <div className={styles.ratingsContainer}>
                <div className={styles.ratingText}>
                  Ratings:
                </div>
                <div className={styles.starRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                      {star <= Number(doctor.rating) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
              </div>
              <button
                className={styles.bookButton}
                onClick={() => router.push(`/schedule-appointment/${doctor.id}`)}
              >
                Book Appointment
              </button>
            </div>
          ))}
        </section>
      </div>

      <div className={styles.pagination}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          &lt; Prev
        </button>

        {Array.from(
          { length: Math.min(totalPages, 5) },
          (_, index) => index + 1
        ).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={page === p ? styles.active : ""}
          >
            {p}
          </button>
        ))}

        {totalPages > 5 && <span>...</span>}

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
};

export default DoctorsPage;
