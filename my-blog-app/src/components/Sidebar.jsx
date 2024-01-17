import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../style/sidebar.css";

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const imageRef = useRef(null);
  const navigate = useNavigate();

  const [randomPosts, setRandomPosts] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:4000/check-auth", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    const fetchRandomPosts = async () => {
      try {
        const response = await fetch("http://localhost:4000/posts/random", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setRandomPosts(data);
        } else {
          console.error("Failed to fetch random posts");
        }
      } catch (error) {
        console.error("Error fetching random posts: ", error);
      }
    };

    fetchRandomPosts();

    const updateImageHeight = () => {
      if (imageRef.current) {
        const width = imageRef.current.offsetWidth;
        imageRef.current.style.height = `${width}px`;
      }
    };

    updateImageHeight();
    window.addEventListener("resize", updateImageHeight);

    return () => window.removeEventListener("resize", updateImageHeight);
  }, []);

  const handleProfileClick = () => {
    navigate("/user/profile"); // Navigate to profile page
  };

  const navigateToArticle = (id) => {
    navigate(`/article/${id}`);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="col-lg-4">
      <div className="widget-blocks">
        <div className="row">
          <div className="col-lg-12">
            <div className="widget mx-5" id="profile">
              <div className="widget-body">
                <img
                  ref={imageRef}
                  loading="lazy"
                  decoding="async"
                  src={`http://localhost:4000/${user.avatar_path}`}
                  alt="User Avatar"
                  className="author-thumb-sm d-block"
                />
                <h2 className="widget-title title-text my-3">
                  {user.display_name}
                </h2>
                <p className="mb-3 pb-2 content-text">
                  {user.bio || "This person doesn't have any bio."}
                </p>
                <button
                  className="btn btn-sm btn-outline-primary devButton"
                  onClick={handleProfileClick}
                >
                  Profile
                </button>
              </div>
            </div>
          </div>
          <div className="col-lg-12 col-md-6">
            <div className="widget">
              <h2 className="section-title mb-3">Explore</h2>
              <div className="widget-body">
                <div className="widget-list">
                  {randomPosts.map((post) => (
                    <article className="card mb-4" key={post.id}>
                      <div className="card-image">
                        <img
                          loading="lazy"
                          decoding="async"
                          src={`http://localhost:4000/${post.imagepath}`}
                          alt="Post Thumbnail"
                          className="w-100"
                        />
                      </div>
                      <div className="card-body px-0 pb-1">
                        <h3 className="explore-card-title">{post.title}</h3>
                        <p className="explore-card-content">{post.content}</p>
                        <div className="fakebtn">
                          <button
                            className="btn btn-sm btn-outline-primary devButton"
                            onClick={() => navigateToArticle(post.id)}
                          >
                            Read Full Article
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
