import React, { useState, useEffect } from "react";
import Post from "./Post";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState(
    localStorage.getItem("sortOption") || "date DESC"
  );
  const postsPerPage = 6;

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
  }, [sortOption]);

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
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
      <Pagination
        postsPerPage={postsPerPage}
        totalPosts={posts.length}
        paginate={paginate}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

const Pagination = ({
  postsPerPage,
  totalPosts,
  paginate,
  currentPage,
  setCurrentPage, // Make sure to receive setCurrentPage as a prop
}) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  const lastPage = pageNumbers.length;

  const goToPrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  return (
    <nav>
      <ul className="pagination">
        {currentPage > 1 && (
          <li className="page-item">
            <button onClick={goToPrevPage} className="page-link">
              &laquo; Previous
            </button>
          </li>
        )}
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`page-item ${currentPage === number ? "active" : ""}`}
          >
            <button onClick={() => paginate(number)} className="page-link">
              {number}
            </button>
          </li>
        ))}
        {currentPage < lastPage && (
          <li className="page-item">
            <button onClick={goToNextPage} className="page-link">
              Next &raquo;
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default PostList;
