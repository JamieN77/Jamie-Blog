import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowCircleLeft } from "react-icons/fa";
import Modal from "./Modal";
import "../style/createPost.css";

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: null,
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [showTagPopup, setShowTagPopup] = useState(false);
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      try {
        const categoriesResponse = await fetch(
          "http://localhost:4000/categories"
        );
        const tagsResponse = await fetch("http://localhost:4000/tags");

        if (!categoriesResponse.ok || !tagsResponse.ok) {
          throw new Error("Failed to fetch categories or tags");
        }

        const categoriesData = await categoriesResponse.json();
        const tagsData = await tagsResponse.json();
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchCategoriesAndTags();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleFileButtonClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const addCategory = (category) => {
    setSelectedCategory(category);
    setShowCategoryPopup(false);
  };

  const addTag = (tag) => {
    // Check if the tag is already selected
    if (!selectedTags.includes(tag)) {
      if (selectedTags.length < 2) {
        setSelectedTags([...selectedTags, tag]);
        setShowTagPopup(false);
      }
    }
  };

  const removeCategory = () => {
    setSelectedCategory(null);
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!selectedCategory) {
      setValidationError("Please choose 1 category.");
      return;
    }
    if (selectedTags.length === 0 || selectedTags.length > 2) {
      setValidationError("Please choose at least 1 and at most 2 tags.");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    if (formData.image) {
      data.append("image", formData.image);
    }

    data.append("categories", JSON.stringify([selectedCategory]));
    data.append("tags", JSON.stringify(selectedTags));

    try {
      const response = await fetch("http://localhost:4000/posts", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      navigate("/user");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="create-post-container">
      <FaArrowCircleLeft
        className="single-go-back-icon"
        onClick={handleGoBack}
      />
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          name="title"
          placeholder="Post Title (max 100 characters)"
          value={formData.title}
          onChange={handleInputChange}
          maxLength="100"
        />
        <textarea
          name="content"
          placeholder="Post Content (min 300 characters)"
          value={formData.content}
          onChange={handleInputChange}
          minLength="300"
        />
        <div className="file-upload-wrapper">
          <input
            type="file"
            name="image"
            id="fileInput"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={handleFileButtonClick}
            className="file-upload-button"
          >
            Upload Image
          </button>
          {formData.image && <span>{formData.image.name}</span>}
        </div>

        <div className="category-section">
          <h4>Category</h4>
          {selectedCategory && (
            <div className="category-item">
              {selectedCategory}
              <button type="button" onClick={removeCategory}>
                X
              </button>
            </div>
          )}
          <button type="button" onClick={() => setShowCategoryPopup(true)}>
            Add Category
          </button>
        </div>

        <div className="tag-section">
          <h4>Tags</h4>
          {selectedTags.map((tag) => (
            <div key={tag} className="tag-item">
              {tag}
              <button type="button" onClick={() => removeTag(tag)}>
                X
              </button>
            </div>
          ))}
          {selectedTags.length < 2 && (
            <button type="button" onClick={() => setShowTagPopup(true)}>
              Add Tag
            </button>
          )}
        </div>

        {validationError && (
          <div className="validation-error">{validationError}</div>
        )}

        <button type="submit" className="create-post-submit">
          Create Post!
        </button>

        {showCategoryPopup && (
          <Modal
            title="Select Category"
            onClose={() => setShowCategoryPopup(false)}
          >
            {categories.map((category) => (
              <div key={category.id} onClick={() => addCategory(category.name)}>
                {category.name}
              </div>
            ))}
          </Modal>
        )}

        {showTagPopup && (
          <Modal title="Select Tags" onClose={() => setShowTagPopup(false)}>
            {tags.map((tag) => (
              <div key={tag.id} onClick={() => addTag(tag.name)}>
                {tag.name}
              </div>
            ))}
          </Modal>
        )}
      </form>
    </div>
  );
};

export default CreatePost;
