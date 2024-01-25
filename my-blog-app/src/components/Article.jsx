import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowCircleLeft,
  FaUserCircle,
  FaHeart,
  FaHeartBroken,
} from "react-icons/fa";
import "../style/article.css";

const Article = () => {
  const [post, setPost] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isEndorsed, setIsEndorsed] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  // Define fetchPost as a useCallback
  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:4000/posts/${id}`);
      if (!response.ok) {
        throw new Error("Could not fetch post");
      }
      const postData = await response.json();
      setPost(postData);

      const avatarResponse = await fetch(
        `http://localhost:4000/user/avatar/${postData.user_id}`
      );
      if (avatarResponse.ok) {
        const avatarData = await avatarResponse.json();
        setAvatar(avatarData.avatarPath);
      }

      const endorsementResponse = await fetch(
        `http://localhost:4000/posts/${id}/endorsement-status`,
        {
          credentials: "include",
        }
      );
      if (endorsementResponse.ok) {
        const { endorsement } = await endorsementResponse.json();
        setIsEndorsed(endorsement);
      }
    } catch (error) {
      console.error("Fetch error: ", error);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleEndorsementChange = async (endorse) => {
    try {
      const response = await fetch(
        `http://localhost:4000/posts/${id}/endorse`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ endorsement: endorse }),
        }
      );
      if (response.ok) {
        setIsEndorsed(endorse);
        fetchPost();
      } else if (response.status === 401) {
        navigate("/login");
      } else {
        throw new Error("Failed to update endorsement");
      }
    } catch (error) {
      console.error("Error updating endorsement: ", error);
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }
  return (
    <div className="article-container">
      <FaArrowCircleLeft
        className="single-go-back-icon"
        onClick={() => navigate(-1)}
      />
      <img
        src={`http://localhost:4000/${post.imagepath}`}
        alt={post.title}
        className="article-image"
      />
      <div className="article-author">
        {avatar ? (
          <img
            src={`http://localhost:4000/${avatar}`}
            alt={post.display_name}
            className="author-avatar"
          />
        ) : (
          <FaUserCircle className="default-avatar" />
        )}
        <span>{post.display_name}</span>
      </div>
      <time className="article-meta">
        {new Date(post.date).toLocaleDateString()}
      </time>
      <h1 className="article-title">{post.title}</h1>
      <div className="article-tags-categories">
        <div className="article-categories">
          Categories: {post.categories.join(", ")}
        </div>
        <div className="article-tags">Tags: {post.tags.join(", ")}</div>
      </div>
      <div className="endorsement-section">
        <FaHeart
          className={`endorse-icon ${isEndorsed === true ? "active" : ""}`}
          onClick={() => handleEndorsementChange(true)}
        />
        <FaHeartBroken
          className={`disendorse-icon ${isEndorsed === false ? "active" : ""}`}
          onClick={() => handleEndorsementChange(false)}
        />
        <span className="popular-point">{post.popular_point}</span>
      </div>
      <div className="article-content">{post.content}</div>
    </div>
  );
};

export default Article;
