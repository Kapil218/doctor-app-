"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import Image from 'next/image';

const DoctorCard = ({ doctor, onDelete }) => {
  return (
    <div className={styles.doctorCard}>
      <div className={styles.doctorImageContainer}>
        <Image
          src={doctor.image || "/defaultpic.jpg"}
          alt={`Dr. ${doctor.name}`}
          className={styles.doctorImage}
          width={400}
          height={400}
          priority
        />
      </div>
      <div className={styles.doctorContent}>
        <div className={styles.doctorInfo}>
          <h3>Dr. {doctor.name}</h3>
          <p className={styles.specialty}>{doctor.specialty}</p>
          <p className={styles.experience}>
            <span>👨‍⚕️</span> {doctor.experience} experience
          </p>
          <p className={styles.rating}>
            <span>⭐</span> {doctor.rating} Rating
          </p>
          <p className={styles.location}>
            <span>📍</span> {doctor.location}
          </p>
        </div>
        <div className={styles.doctorActions}>
          <Link
            href={`/doctors/edit/${doctor.id}/${doctor.id}`}
            className={styles.editButton}
          >
            Edit
          </Link>
          <Link
            href={`/doctors/schedule/${doctor.id}`}
            className={styles.scheduleButton}
          >
            Schedule
          </Link>
          <button
            onClick={() => onDelete(doctor.id)}
            className={styles.deleteButton}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const PageHeader = () => {
  return (
    <div className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>Doctors</h1>
      <Link href="/doctors/add" className={styles.addButton}>
        Add Doctor
      </Link>
    </div>
  );
};

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const debounceRef = useRef(null);

  // Add a useEffect to log page changes for debugging
  useEffect(() => {
    console.log('Current page:', page);
  }, [page]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1); // Reset to first page when search query changes
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Check if any filters or search are applied
      const hasFilters = debouncedQuery.trim() !== "" || 
                        filters.rating || 
                        filters.experience || 
                        filters.gender;

      // Add search query if it exists
      if (debouncedQuery.trim() !== "") {
        params.append("query", debouncedQuery);
      }

      // Add filters only if they have values
      if (filters.rating) {
        // Convert rating to number to match backend's parseFloat
        const numericRating = parseFloat(filters.rating);
        if (!isNaN(numericRating)) {
          params.append("rating", numericRating.toString());
        }
      }
      if (filters.experience) {
        const exp = filters.experience.replace(" years", "").trim();
        params.append("experience", exp);
      }
      if (filters.gender) {
        params.append("gender", filters.gender.toLowerCase());
      }

      // Add pagination parameters only if we're not fetching top rated doctors without filters
      if (hasFilters || !params.has("topRated")) {
        params.append("page", page.toString());
        params.append("perPage", "6");
      }

      const queryString = params.toString();
      console.log('Fetching with params:', queryString);

      const response = await fetch(
        `http://localhost:3000/api/v1/doctors?${queryString}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const result = await response.json();
      console.log('API Response:', result); // Debug log
      
      if (result.statusCode === 200) {
        setDoctors(result.data.doctors);
        
        // Handle pagination based on response
        if (result.data.pagination) {
          // We have pagination info
          const { totalPages: backendTotalPages, currentPage } = result.data.pagination;
          console.log('Backend pagination:', { totalPages: backendTotalPages, currentPage });
          setTotalPages(backendTotalPages);
          // Ensure frontend page matches backend current page
          if (currentPage !== page) {
            setPage(currentPage);
          }
        } else {
          // No pagination (top rated case or error)
          setTotalPages(1);
          setPage(1);
        }
      } else {
        throw new Error(result.message || "Failed to fetch doctors");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to handle page changes
  useEffect(() => {
    // Only fetch if we have filters or we're not on top rated
    const hasFilters = debouncedQuery.trim() !== "" || 
                      filters.rating || 
                      filters.experience || 
                      filters.gender;
    
    if (hasFilters || page > 1) {
      fetchDoctors();
    }
  }, [debouncedQuery, filters, page]);

  // Initial fetch for first page
  useEffect(() => {
    fetchDoctors();
  }, []); // Empty dependency array for initial fetch

  const handleDelete = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/doctors/remove/${doctorId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete doctor");
      }

      // Refresh the doctors list and reset to first page
      setPage(1);
      fetchDoctors();
    } catch (err) {
      setError(err.message);
      console.error("Error deleting doctor:", err);
    }
  };

  const handlePendingFilterChange = (key, value) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setFilters(pendingFilters);
    setPage(1); // Reset to first page when filters are applied
  };

  const resetFilters = () => {
    setPendingFilters({ rating: "", experience: "", gender: "" });
    setFilters({ rating: "", experience: "", gender: "" });
    setQuery(""); // Also reset search query
    setPage(1); // Reset to first page when filters are reset
  };

  if (loading) {
    return (
      <div className={styles.doctorsPage}>
        <PageHeader />
        <div className={styles.loading}>Loading doctors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.doctorsPage}>
        <PageHeader />
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Doctors</h1>
        <Link href="/doctors/add" className={styles.addButton}>
          Add Doctor
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search doctors..."
        className={styles.searchBar}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className={styles.filterSection}>
        <div className={styles.filterHeader}>
          <h2 className={styles.filterTitle}>Filter By:</h2>
          
          <div className={styles.filterContent}>
            <div className={styles.filterGroup}>
              <h3 className={styles.filterGroupTitle}>Rating:</h3>
              <select
                className={styles.select}
                value={pendingFilters.rating}
                onChange={(e) => handlePendingFilterChange("rating", e.target.value)}
              >
                <option value="">All</option>
                <option value="4.5">4.5+ ⭐</option>
                <option value="4">4+ ⭐</option>
                <option value="3.5">3.5+ ⭐</option>
                <option value="3">3+ ⭐</option>
                <option value="2">2+ ⭐</option>
                <option value="1">1+ ⭐</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterGroupTitle}>Experience:</h3>
              <select
                className={styles.select}
                value={pendingFilters.experience}
                onChange={(e) => handlePendingFilterChange("experience", e.target.value)}
              >
                <option value="">All</option>
                <option value="15">15+ years</option>
                <option value="10-15">10-15 years</option>
                <option value="5-10">5-10 years</option>
                <option value="3-5">3-5 years</option>
                <option value="1-3">1-3 years</option>
                <option value="0-1">0-1 years</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterGroupTitle}>Gender:</h3>
              <select
                className={styles.select}
                value={pendingFilters.gender}
                onChange={(e) => handlePendingFilterChange("gender", e.target.value)}
              >
                <option value="">All</option>
                {["Male", "Female"].map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterActions}>
              <button onClick={resetFilters} className={styles.resetButton}>
                Reset
              </button>
              <button onClick={applyFilters} className={styles.applyButton}>
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.doctorsList}>
          {doctors.length === 0 ? (
            <div className={styles.noDoctors}>No doctors found</div>
          ) : (
            doctors.map((doctor) => (
              <div key={doctor.id} className={styles.doctorCard}>
                <div className={styles.doctorImageContainer}>
                  <Image
                    src={doctor.image || "/defaultpic.jpg"}
                    alt={`Dr. ${doctor.name}`}
                    className={styles.doctorImage}
                    width={400}
                    height={400}
                    priority
                  />
                </div>
                <div className={styles.doctorContent}>
                  <div className={styles.doctorInfo}>
                    <h3>Dr. {doctor.name}</h3>
                    <p className={styles.specialty}>{doctor.specialty}</p>
                    <p className={styles.experience}>
                      <span>👨‍⚕️</span> {doctor.experience} experience
                    </p>
                    <p className={styles.rating}>
                      <span>⭐</span> {doctor.rating} Rating
                    </p>
                    <p className={styles.location}>
                      <span>📍</span> {doctor.location}
                    </p>
                  </div>
                  <div className={styles.doctorActions}>
                    <Link href={`/doctors/edit/${doctor.id}`} className={styles.editButton}>
                      Edit
                    </Link>
                    <Link href={`/doctors/schedule/${doctor.id}`} className={styles.scheduleButton}>
                      Schedule
                    </Link>
                    <button
                      onClick={() => handleDelete(doctor.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.pagination}>
          <button
            onClick={() => {
              console.log('Clicking prev, current page:', page);
              setPage((p) => Math.max(1, p - 1));
            }}
            disabled={page === 1}
            className={`${styles.paginationButton} ${styles.paginationNav}`}
          >
            ← Prev
          </button>

          {/* First page */}
          {page > 3 && (
            <>
              <button
                onClick={() => setPage(1)}
                className={`${styles.paginationButton} ${page === 1 ? styles.active : ''}`}
              >
                1
              </button>
              <span className={styles.paginationEllipsis}>...</span>
            </>
          )}

          {/* Page numbers */}
          {Array.from(
            { length: Math.min(5, totalPages) },
            (_, i) => {
              let pageNum;
              if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return Math.max(1, Math.min(pageNum, totalPages));
            }
          )
            .filter((value, index, self) => self.indexOf(value) === index)
            .map((p) => (
              <button
                key={p}
                onClick={() => {
                  console.log('Clicking page number:', p);
                  setPage(p);
                }}
                className={`${styles.paginationButton} ${page === p ? styles.active : ''}`}
              >
                {p}
              </button>
            ))}

          {/* Last page */}
          {page < totalPages - 2 && (
            <>
              <span className={styles.paginationEllipsis}>...</span>
              <button
                onClick={() => setPage(totalPages)}
                className={`${styles.paginationButton} ${page === totalPages ? styles.active : ''}`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => {
              console.log('Clicking next, current page:', page);
              setPage((p) => Math.min(totalPages, p + 1));
            }}
            disabled={page === totalPages}
            className={`${styles.paginationButton} ${styles.paginationNav}`}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorsList; 