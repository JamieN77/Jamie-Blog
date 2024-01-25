import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { FaArrowCircleLeft } from "react-icons/fa";
import Pagination from "./homepg-cpnts/Pagination.jsx";
import "../style/searchResults.css";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  const [totalCount, setTotalCount] = useState(0);

  const query = searchParams.get("q");

  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `http://localhost:4000/search?q=${query}&page=${currentPage}&limit=${postsPerPage}`
          );
          if (!response.ok) throw new Error("Search failed");
          const data = await response.json();
          setResults(data.posts);
          setTotalCount(data.totalCount);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [query, currentPage, postsPerPage]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="search-results">
      <FaArrowCircleLeft
        id="search-results-go-back"
        className="single-go-back-icon"
        onClick={handleGoBack}
      />
      <h1 className="search-title">Search Results</h1>
      <div className="results-container">
        {results.map((result) => (
          <Link
            key={result.id}
            to={`/article/${result.id}`}
            className="result-item"
          >
            <img
              src={`http://localhost:4000/${result.imagepath}`}
              alt={result.title}
              className="result-image"
            />
            <h3 className="result-title">{result.title}</h3>
            <p className="result-content">{result.content}</p>
          </Link>
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPosts={totalCount}
        postsPerPage={postsPerPage}
        paginate={paginate}
      />
    </div>
  );
};

export default SearchResults;
