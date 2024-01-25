import React, { useState, useEffect, useRef } from "react";
import Post from "./Post";
import "../style/postList.css";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState(
    localStorage.getItem("sortOption") || "date DESC"
  );
  const postsPerPage = 6;

  const paginationRef = useRef(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const [sort, order] = sortOption.split(" ");
        const response = await fetch(
          `http://localhost:4000/my/posts?sort=${sort}&order=${order}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchPosts();
  }, [currentPage, sortOption]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (paginationRef.current) {
        const paginationPosition =
          paginationRef.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: paginationPosition, behavior: "smooth" });
      }
    }, 0);

    return () => clearTimeout(timer); // Clear the timeout if the component unmounts
  }, [currentPage]);

  const handleDeletePost = (id) => {
    const updatedPosts = posts.filter((post) => post.id !== id);
    setPosts(updatedPosts);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    localStorage.setItem("sortOption", e.target.value);
  };

  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container">
      <div className="sort-options">
        <label>Sort by: </label>
        <select value={sortOption} onChange={handleSortChange}>
          <option value="date DESC">Editing Date (Newest First)</option>
          <option value="date ASC">Editing Date (Oldest First)</option>
          <option value="id DESC">Creating Date (Newest First)</option>
          <option value="id ASC">Creating Date (Oldest First)</option>
        </select>
      </div>
      <div className="row">
        {currentPosts.map((post) => (
          <Post key={post.id} post={post} onDelete={handleDeletePost} />
        ))}
      </div>
      <div ref={paginationRef}>
        <Pagination
          postsPerPage={postsPerPage}
          totalPosts={posts.length}
          paginate={paginate}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

const Pagination = ({ postsPerPage, totalPosts, paginate, currentPage }) => {
  const pageNumbers = [];
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  pageNumbers.push(1);
  if (totalPages > 1) {
    pageNumbers.push(2);
  }

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

  if (totalPages > 3) {
    pageNumbers.push(totalPages - 1);
  }
  if (totalPages > 2) {
    pageNumbers.push(totalPages);
  }

  return (
    <nav>
      <ul className="pagination">
        {currentPage > 1 && (
          <li className="page-item">
            <button
              onClick={() => paginate(Math.max(currentPage - 1, 1))}
              className="page-link"
            >
              &laquo; Previous
            </button>
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
              className={`page-item ${currentPage === number ? "active" : ""}`}
            >
              <button onClick={() => paginate(number)} className="page-link">
                {number}
              </button>
            </li>
          )
        )}
        {currentPage < totalPages && (
          <li className="page-item">
            <button
              onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
              className="page-link"
            >
              Next &raquo;
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default PostList;
