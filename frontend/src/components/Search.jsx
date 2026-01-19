import { useState, useEffect } from "react";
import { TbSearch, TbArrowsSort, TbCheck } from "react-icons/tb";
import "./Search.css";

export default function Search({ onSearch, onSort }) {
  const [query, setQuery] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState("newest");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query, onSearch]);

  const handleSort = (value) => {
    setCurrentSort(value);
    onSort(value);
    setSortOpen(false);
  };

  const sortOptions = [
    { id: "newest", label: "Newest First" },
    { id: "oldest", label: "Oldest First" },
    { id: "az", label: "A-Z" },
    { id: "za", label: "Z-A" },
  ];

  return (
    <div className="search-widget">
      <div className="search-bar">
        <TbSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <div className="sort-container">
        <button 
          className={`sort-button ${sortOpen ? 'active' : ''}`}
          onClick={() => setSortOpen(!sortOpen)}
          aria-label="Sort options"
        >
          <TbArrowsSort />
        </button>

        {sortOpen && (
          <div className="sort-menu">
            {sortOptions.map((opt) => (
              <div 
                key={opt.id} 
                className={`sort-item ${currentSort === opt.id ? 'selected' : ''}`}
                onClick={() => handleSort(opt.id)}
              >
                <span>{opt.label}</span>
                {currentSort === opt.id && <TbCheck className="check-icon" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
