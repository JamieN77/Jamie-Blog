import React, { useState, useEffect } from "react";
import Post from "./Post";

const PostList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:4000/posts");
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
  }, []);

  // Function to update the state when a post is deleted
  const handleDeletePost = (id) => {
    // Filter out the post that has been deleted
    const updatedPosts = posts.filter((post) => post.id !== id);
    setPosts(updatedPosts);
  };

  return (
    <div className="container">
      <div className="row">
        {posts.map((post) => (
          // Pass the handleDeletePost function to each Post component
          <Post key={post.id} post={post} onDelete={handleDeletePost} />
        ))}
      </div>
    </div>
  );
};

export default PostList;
