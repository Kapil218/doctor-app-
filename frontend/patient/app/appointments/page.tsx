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
  const [isTopRated, setIsTopRated] = useState(true);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [filters, setFilters] = useState({
    rating: "",
    experience: "",
    gender: "",
  });
  const [pendingFilters, setPendingFilters] = useState(filters);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (!Object.values(dropdownRefs.current).some(ref => ref?.contains(event.target as Node))) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        setIsTopRated(false);
      } else if (!filtersApplied) {
        params.append("topRated", "true");
        setIsTopRated(true);
      } else {
        setIsTopRated(false);
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
          setTotalDoctors(data.data.pagination?.totalDoctors || 0);
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

  const toggleDropdown = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setActiveDropdown(null);
    setPage(1);
  };

  const clearFilter = (key: string) => {
    setFilters(prev => ({ ...prev, [key]: "" }));
    setPage(1);
  };

  const getFilterLabel = (key: string, value: string) => {
    if (!value) return `Select ${key}`;
    
    switch (key) {
      case 'rating':
        return `${value} star${value === '1' ? '' : 's'}`;
      case 'experience':
        return `${value} years`;
      case 'gender':
        return value;
      default:
        return value;
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>Find a doctor at your own ease</h1>
      <div className={styles.searchWrapper}>
        <div className={styles.searchBar}>
          <div className={styles.searchContainer}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search doctors"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <h2 className={styles.header}>
        {isTopRated ? "Our Top Doctors" : `${totalDoctors} doctors available`}
      </h2>
      <p className={styles.subHeader}>
        Book appointments with minimum wait-time & verified doctor details
      </p>

      {/* Mobile/Tablet Dropdowns */}
      <div className={styles.filterDropdowns}>
        {/* Rating Dropdown */}
        <div className={styles.filterDropdown} ref={(el) => { dropdownRefs.current['rating'] = el }}>
          <button 
            className={`${styles.dropdownButton} ${activeDropdown === 'rating' ? styles.active : ''} ${filters.rating ? styles.activeFilter : ''}`}
            onClick={() => toggleDropdown('rating')}
          >
            {getFilterLabel('rating', filters.rating)}
            {filters.rating && (
              <button className={styles.clearButton} onClick={(e) => { e.stopPropagation(); clearFilter('rating'); }}>
                ×
              </button>
            )}
          </button>
          <div className={`${styles.dropdownContent} ${activeDropdown === 'rating' ? styles.active : ''}`}>
            {["", "1", "2", "3", "4", "5"].map((r) => (
              <div key={r} className={styles.filterOption}>
                <input
                  type="radio"
                  id={`rating-${r}`}
                  name="rating"
                  value={r}
                  checked={filters.rating === r}
                  onChange={() => handleFilterChange("rating", r)}
                />
                <label htmlFor={`rating-${r}`}>
                  {r ? `${r} star${r === '1' ? '' : 's'}` : "Show all"}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Dropdown */}
        <div className={styles.filterDropdown} ref={(el) => { dropdownRefs.current['experience'] = el }}>
          <button 
            className={`${styles.dropdownButton} ${activeDropdown === 'experience' ? styles.active : ''} ${filters.experience ? styles.activeFilter : ''}`}
            onClick={() => toggleDropdown('experience')}
          >
            {getFilterLabel('experience', filters.experience)}
            {filters.experience && (
              <button className={styles.clearButton} onClick={(e) => { e.stopPropagation(); clearFilter('experience'); }}>
                ×
              </button>
            )}
          </button>
          <div className={`${styles.dropdownContent} ${activeDropdown === 'experience' ? styles.active : ''}`}>
            {["", "15", "10-15", "5-10", "3-5", "1-3", "0-1"].map((exp) => (
              <div key={exp} className={styles.filterOption}>
                <input
                  type="radio"
                  id={`exp-${exp}`}
                  name="experience"
                  value={exp}
                  checked={filters.experience === exp}
                  onChange={() => handleFilterChange("experience", exp)}
                />
                <label htmlFor={`exp-${exp}`}>
                  {exp ? `${exp} years` : "Show all"}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Dropdown */}
        <div className={styles.filterDropdown} ref={(el) => { dropdownRefs.current['gender'] = el }}>
          <button 
            className={`${styles.dropdownButton} ${activeDropdown === 'gender' ? styles.active : ''} ${filters.gender ? styles.activeFilter : ''}`}
            onClick={() => toggleDropdown('gender')}
          >
            {getFilterLabel('gender', filters.gender)}
            {filters.gender && (
              <button className={styles.clearButton} onClick={(e) => { e.stopPropagation(); clearFilter('gender'); }}>
                ×
              </button>
            )}
          </button>
          <div className={`${styles.dropdownContent} ${activeDropdown === 'gender' ? styles.active : ''}`}>
            {["", "Male", "Female"].map((g) => (
              <div key={g} className={styles.filterOption}>
                <input
                  type="radio"
                  id={`gender-${g}`}
                  name="gender"
                  value={g}
                  checked={filters.gender === g}
                  onChange={() => handleFilterChange("gender", g)}
                />
                <label htmlFor={`gender-${g}`}>
                  {g || "Show all"}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Desktop Sidebar */}
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

          <div className={styles.filterSection}>
            <h4>Rating</h4>
            {["", "1", "2", "3", "4", "5"].map((r) => (
              <div key={r} className={styles.filterOption}>
                <input
                  type="radio"
                  id={`rating-desktop-${r}`}
                  name="rating-desktop"
                  value={r}
                  checked={pendingFilters.rating === r}
                  onChange={() => handlePendingFilterChange("rating", r)}
                />
                <label htmlFor={`rating-desktop-${r}`}>
                  {r ? `${r} star${r === '1' ? '' : 's'}` : "Show all"}
                </label>
              </div>
            ))}
          </div>

          <div className={styles.filterSection}>
            <h4>Experience</h4>
            {["", "15", "10-15", "5-10", "3-5", "1-3", "0-1"].map((exp) => (
              <div key={exp} className={styles.filterOption}>
                <input
                  type="radio"
                  id={`exp-desktop-${exp}`}
                  name="experience-desktop"
                  value={exp}
                  checked={pendingFilters.experience === exp}
                  onChange={() => handlePendingFilterChange("experience", exp)}
                />
                <label htmlFor={`exp-desktop-${exp}`}>
                  {exp ? `${exp} years` : "Show all"}
                </label>
              </div>
            ))}
          </div>

          <div className={styles.filterSection}>
            <h4>Gender</h4>
            {["", "Male", "Female"].map((g) => (
              <div key={g} className={styles.filterOption}>
                <input
                  type="radio"
                  id={`gender-desktop-${g}`}
                  name="gender-desktop"
                  value={g}
                  checked={pendingFilters.gender === g}
                  onChange={() => handlePendingFilterChange("gender", g)}
                />
                <label htmlFor={`gender-desktop-${g}`}>
                  {g || "Show all"}
                </label>
              </div>
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

      {/* Show pagination only when not showing top-rated doctors */}
      {!isTopRated && doctors.length > 0 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={styles.pageButton}
          >
            &lt; Prev
          </button>

          {totalPages <= 5 ? (
            // If 5 or fewer pages, show all page numbers
            Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`${styles.pageButton} ${pageNum === page ? styles.active : ''}`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </button>
            ))
          ) : (
            // If more than 5 pages, show current page with neighbors and ellipsis
            <>
              {page > 2 && (
                <button
                  className={styles.pageButton}
                  onClick={() => setPage(1)}
                >
                  1
                </button>
              )}
              
              {page > 3 && <span className={styles.ellipsis}>...</span>}

              {Array.from({ length: 5 }, (_, i) => {
                const pageNum = Math.max(
                  Math.min(
                    page - 2 + i,
                    totalPages - 2
                  ),
                  Math.max(3, page - 2)
                );
                return pageNum <= totalPages - 2 ? (
                  <button
                    key={pageNum}
                    className={`${styles.pageButton} ${pageNum === page ? styles.active : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ) : null;
              })}

              {page < totalPages - 2 && <span className={styles.ellipsis}>...</span>}
              
              {page < totalPages - 1 && (
                <button
                  className={styles.pageButton}
                  onClick={() => setPage(totalPages)}
                >
                  {totalPages}
                </button>
              )}
            </>
          )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={styles.pageButton}
          >
            Next &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
