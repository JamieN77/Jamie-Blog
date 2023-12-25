import React from "react";
import { Link } from "react-router-dom";

const Post = ({ post, onDelete }) => {
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`http://localhost:4000/posts/${post.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Error deleting post");
        }
        onDelete(post.id); // Notify the parent component that the post has been deleted
      } catch (error) {
        console.error("Error", error);
        alert("Could not delete the post.");
      }
    }
  };

  return (
    <div className="col-md-6 mb-4 post">
      <article className="card article-card article-card-sm h-100">
        <Link to={`/article/${post.id}`}>
          <div className="card-image">
            <div className="post-info">
              <span className="text-uppercase">{post.date}</span>
            </div>
            <img
              loading="lazy"
              decoding="async"
              src={`http://localhost:4000/${post.imagepath}`} // The name in db column is imagepath
              alt="Post Thumbnail"
              className="w-100"
            />
          </div>
        </Link>
        <div className="card-body px-0 pb-0">
          <h2>
            <Link
              className="post-title"
              to={`http://localhost:4000/article/${post.id}`}
            >
              {post.title}
            </Link>
          </h2>
          <p className="card-text">
            {post.content.length > 100
              ? post.content.substring(0, 100) + "..."
              : post.content}
          </p>
          <div className="edit-link">
            <a className="read-more-btn" href={`/edit/${post.id}`}>
              Edit
            </a>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleDelete(post.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default Post;
