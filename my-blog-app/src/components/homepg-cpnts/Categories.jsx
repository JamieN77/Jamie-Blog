import React, { useState, useEffect } from "react";

import { FaRedo } from "react-icons/fa";
import "../../style/homepg-cpnts-style/categories.css";

const Categories = ({ activeCategoryIds, setActiveCategoryIds }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const fetchCategories = async (excludeIds = []) => {
    setLoading(true);
    try {
      const excludeQuery = excludeIds.length
        ? `&exclude=${excludeIds.join(",")}`
        : "";
      const response = await fetch(
        `http://localhost:4000/categories/random?count=5${excludeQuery}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleRefresh = () => {
    const excludeIds = categories.map((c) => c.id);
    fetchCategories(excludeIds);
  };

  const toggleCategoryActive = (categoryId) => {
    // Remember the current scroll position
    const scrollPosition = window.scrollY;

    setActiveCategoryIds((prevActiveCategoryIds) => {
      // Update the active categories
      if (prevActiveCategoryIds.includes(categoryId)) {
        return prevActiveCategoryIds.filter((id) => id !== categoryId);
      } else {
        return [...prevActiveCategoryIds, categoryId];
      }
    });

    // Clear any existing timeout
    if (timeoutId) clearTimeout(timeoutId);

    // Set a new timeout to restore the scroll position
    const newTimeoutId = setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 100);

    setTimeoutId(newTimeoutId);
  };

  // useEffect to clear the timeout when the component unmounts
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return (
    <div className="aside-widget">
      <div className="widget-header">
        <h5 className="aside-widget-title">
          <span>Categories</span>
        </h5>
        <button
          onClick={handleRefresh}
          className="refresh-button"
          disabled={loading}
        >
          <FaRedo />
        </button>
      </div>
      <ul className="list-unstyled widget-list">
        {categories.map((category) => (
          <li key={category.id} className="category-list-item">
            <button
              className={`category-btn ${
                activeCategoryIds.includes(category.id) ? "active" : ""
              }`}
              onClick={() => toggleCategoryActive(category.id)}
            >
              <span className="category-name">{category.name}</span>
            </button>
            <small className="category-post-count">
              ({category.postCount})
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;
