import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaHeartBroken } from "react-icons/fa"; // Import heart icons
import "../../style/homepg-cpnts-style/post.css";

const Post = ({
  currentPage,
  postsPerPage,
  activeCategoryIds,
  activeTagIds,
}) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const safeCurrentPage = Math.max(currentPage, 1);
      const offset = (safeCurrentPage - 1) * postsPerPage;
      let filterQuery = "";

      if (activeCategoryIds.length > 0) {
        // Construct a query string with all active category IDs
        filterQuery += `&categories=${activeCategoryIds.join(",")}`;
      }

      if (activeTagIds.length > 0) {
        filterQuery += `&tags=${activeTagIds.join(",")}`;
      }

      try {
        const response = await fetch(
          `http://localhost:4000/posts?limit=${postsPerPage}&offset=${offset}${filterQuery}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch posts for the current page");
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchPosts();
  }, [currentPage, postsPerPage, activeCategoryIds, activeTagIds]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div>
      {posts.map((post) => (
        <article className="row mb-5" key={post.id}>
          <div className="col-12">
            <div className="post-image">
              <img
                loading="lazy"
                src={`http://localhost:4000/${post.imagepath}`}
                className="img-fluid"
                alt={post.title}
              />
            </div>
          </div>
          <div className="col-12 mx-auto">
            <h3>{post.title}</h3>
            <ul className="list-inline post-meta mb-4">
              <li className="list-inline-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-person-circle"
                  viewBox="0 0 16 16"
                >
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                  <path
                    fillRule="evenodd"
                    d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                  />
                </svg>
                <span className="home-post-author">{post.display_name}</span>
              </li>
              <li className="list-inline-item">
                <p className="home-post-p">Date: {formatDate(post.date)}</p>
              </li>
              <li className="list-inline-item">
                Categories :{" "}
                <span className="home-post-category">
                  {post.categories && post.categories.length > 0
                    ? post.categories.join(", ")
                    : "No Categories"}
                </span>
              </li>
              <li className="list-inline-item">
                Tags :{" "}
                <span className="home-post-tag">
                  {post.tags && post.tags.length > 0
                    ? post.tags.join(", ")
                    : "No Tags"}
                </span>
              </li>
              <li className="popular-point-section">
                {post.popular_point > 0 ? (
                  <FaHeart className="popular-point-heart" />
                ) : (
                  <FaHeartBroken className="popular-point-broken-heart" />
                )}
                <span className="popular-point-value">
                  {post.popular_point}
                </span>
              </li>
            </ul>
            <p className="home-post-actual-content">{post.content}</p>
            <Link
              to={`/article/${post.id}`}
              className="main-pg-post-btn btn-outline-primary"
            >
              Continue Reading
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
};

export default Post;
