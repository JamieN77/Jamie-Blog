import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../../style/homepg-cpnts-style/search.css";

const Search = () => {
  const navigate = useNavigate(); // Instantiate navigate

  const handleSearchSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submission
    const searchQuery = event.target.elements["search-query"].value.trim();
    if (searchQuery) {
      // Navigate to the search results page with the query
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="aside-widget">
      <h5 className="aside-widget-title">
        <span>Search</span>
      </h5>
      <form onSubmit={handleSearchSubmit} className="widget-search">
        {" "}
        {/* Updated form tag */}
        <input
          id="search-query"
          name="s"
          type="search"
          placeholder="Type &amp; Hit Enter..."
        />
        <button type="submit">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-search" // Updated class to className
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default Search;
