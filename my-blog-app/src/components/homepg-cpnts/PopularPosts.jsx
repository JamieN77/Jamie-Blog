import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../style/homepg-cpnts-style/popularPosts.css";

const PopularPosts = ({ postCount = 5 }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchRandomPosts = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/posts-latest?count=${postCount}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch random posts");
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchRandomPosts();
  }, [postCount]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="widget">
      <h5 className="widget-title">
        <span>Latest Article</span>
      </h5>
      {/* post-item */}
      {posts.map((post) => (
        <ul key={post.id} className="list-unstyled widget-list">
          <li className="media widget-post align-items-center">
            <Link to={`/article/${post.id}`}>
              <img
                loading="lazy"
                className="mr-3"
                src={`http://localhost:4000/${post.imagepath}`}
                alt="Post"
              />
            </Link>
            <div className="media-body">
              <h5 className="h6 mb-0">
                <Link to={`/article/${post.id}`} className="widget-post-title">
                  {post.title}
                </Link>
              </h5>
              <small>{formatDate(post.date)}</small>
            </div>
          </li>
        </ul>
      ))}
    </div>
  );
};

export default PopularPosts;
