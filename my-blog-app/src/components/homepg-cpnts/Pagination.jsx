import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import "../../style/homepg-cpnts-style/pagination.css";

const Pagination = ({ postsPerPage, totalPosts, paginate, currentPage }) => {
  const pageNumbers = [];
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const lastPageRef = useRef(currentPage);

  // Always add the first two pages
  pageNumbers.push(1);
  if (totalPages > 1) {
    pageNumbers.push(2);
  }

  // Add the ellipses and middle pages
  if (totalPages > 4) {
    if (currentPage > 3) {
      pageNumbers.push("...");
    }
    const startMiddle = Math.max(currentPage - 1, 3);
    const endMiddle = Math.min(currentPage + 1, totalPages - 2);

    for (let i = startMiddle; i <= endMiddle; i++) {
      if (!pageNumbers.includes(i)) {
        pageNumbers.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pageNumbers.push("...");
    }
  }

  // Always add the last two pages
  if (totalPages > 3) {
    pageNumbers.push(totalPages - 1);
  }
  if (totalPages > 2) {
    pageNumbers.push(totalPages);
  }
  useEffect(() => {
    const scrollIfNeeded = () => {
      if (lastPageRef.current === totalPages && currentPage !== totalPages) {
        // Scroll slightly above the bottom of the page
        const position = document.body.scrollHeight - 150; // Adjust 150 to the desired offset from the bottom
        window.scrollTo({ top: position, behavior: "smooth" });
      }
      lastPageRef.current = currentPage; // Update the last page reference
    };

    // Adding a delay of 100 milliseconds
    const timer = setTimeout(scrollIfNeeded, 100);

    return () => clearTimeout(timer); // Clear the timeout if the component unmounts
  }, [currentPage, totalPages]);

  return (
    <div className="pagination-container">
      <nav>
        <ul className="pagination">
          {/* Only render the Previous link if not on the first page */}
          {currentPage > 1 && (
            <li>
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  paginate(Math.max(currentPage - 1, 1));
                }}
                className="page-link"
                aria-label="Previous"
              >
                <FaAngleLeft />
              </Link>
            </li>
          )}
          {pageNumbers.map((number, index) =>
            number === "..." ? (
              <li key={number + index} className="page-item disabled">
                <span className="page-link">{number}</span>
              </li>
            ) : (
              <li
                key={number}
                className={`page-item ${
                  currentPage === number ? "active" : ""
                }`}
              >
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    paginate(number);
                  }}
                  className="page-link"
                >
                  {number}
                </Link>
              </li>
            )
          )}
          {/* Only render the Next link if not on the last page */}
          {currentPage < totalPages && (
            <li>
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  paginate(Math.min(currentPage + 1, totalPages));
                }}
                className="page-link"
                aria-label="Next"
              >
                <FaAngleRight />
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

Pagination.propTypes = {
  postsPerPage: PropTypes.number.isRequired,
  totalPosts: PropTypes.number.isRequired,
  paginate: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};

export default Pagination;
