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

  // Function to convert ISO date string to "MM/DD/YYYY HH:mm:ss" format
  let timeZoneOffset = -5 * 60;
  function formatDate(dateString, timeZoneOffset) {
    // Parse the date string into a Date object
    let date = new Date(dateString);

    // Adjust for the time zone (UTC-5)
    date.setMinutes(date.getMinutes() + timeZoneOffset);

    // Extract the components of the date
    let month = date.getUTCMonth() + 1; // getUTCMonth() returns 0-11
    let day = date.getUTCDate();
    let year = date.getUTCFullYear().toString(); // get last two digits of year
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes();
    let seconds = date.getUTCSeconds();
    let ampm = hours >= 12 ? "PM" : "AM";

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Pad the month, day, hours, minutes, and seconds with leading zeros if necessary
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    // Format the date string
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
  }

  return (
    <div className="col-md-6 mb-4 post">
      <article className="card article-card article-card-sm h-100">
        <Link to={`/article/${post.id}`}>
          <div className="card-image">
            <div className="post-info">
              <span className="text-uppercase">
                {formatDate(post.date, timeZoneOffset)}
              </span>
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
              className="post-title title-text"
              to={`http://localhost:4000/article/${post.id}`}
            >
              {post.title}
            </Link>
          </h2>
          <p className="card-text content-text">
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
