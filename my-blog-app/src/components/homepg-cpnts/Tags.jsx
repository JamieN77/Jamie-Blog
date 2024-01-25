import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { FaRedo } from "react-icons/fa";
import "../../style/homepg-cpnts-style/tags.css";

const Tags = ({ activeTagIds, setActiveTagIds }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollPositionRef = useRef(null);

  const fetchTags = async (excludeIds = []) => {
    setLoading(true);
    try {
      const excludeQuery = excludeIds.length
        ? `&exclude=${excludeIds.join(",")}`
        : "";
      const response = await fetch(
        `http://localhost:4000/tags/random?count=9${excludeQuery}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleRefresh = () => {
    const excludeIds = tags.map((t) => t.id);
    fetchTags(excludeIds);
  };

  const toggleTagActive = (tagId) => {
    // Remember the current scroll position
    scrollPositionRef.current = window.scrollY;

    setActiveTagIds((prevActiveTagIds) => {
      // Update the active tags
      const updatedActiveTagIds = prevActiveTagIds.includes(tagId)
        ? prevActiveTagIds.filter((id) => id !== tagId)
        : [...prevActiveTagIds, tagId];

      console.log("Updated Active Tags:", updatedActiveTagIds);

      return updatedActiveTagIds;
    });
  };

  useLayoutEffect(() => {
    if (scrollPositionRef.current !== null) {
      // Set a timeout to restore the scroll position
      const timeout = setTimeout(() => {
        window.scrollTo(0, scrollPositionRef.current);
        scrollPositionRef.current = null; // Reset the scroll position in ref
      }, 100); // Delay of 100 milliseconds

      // Return a cleanup function to clear the timeout if the component unmounts
      return () => clearTimeout(timeout);
    }
  }, [activeTagIds]);

  return (
    <div className="aside-widget">
      <div className="widget-header">
        <h5 className="aside-widget-title">
          <span>Tags</span>
        </h5>
        <button
          onClick={handleRefresh}
          className="refresh-button"
          disabled={loading}
        >
          <FaRedo />
        </button>
      </div>
      <ul className="list-inline widget-list-inline">
        {tags.map((tag) => (
          <li key={tag.id} className="list-inline-item">
            <button
              className={`tag-btn ${
                activeTagIds.includes(tag.id) ? "active" : ""
              }`}
              onClick={() => toggleTagActive(tag.id)}
            >
              {tag.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tags;
