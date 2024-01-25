import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowCircleLeft } from "react-icons/fa";
import Modal from "./Modal";
import "../style/editPost.css";

const EditPost = () => {
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

  const { postId } = useParams(); // This gets the postId from the URL
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch post data
        const postResponse = await fetch(
          `http://localhost:4000/posts/${postId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!postResponse.ok) {
          throw new Error("Failed to fetch post");
        }
        const postData = await postResponse.json();
        setFormData({
          title: postData.title,
          content: postData.content,
          // image: postData.imagePath, // Assuming your post data has imagePath
        });

        // Fetch categories and tags
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

        // Set selected categories and tags
        setSelectedCategory(postData.categories[0]); // Adjust based on your response structure
        setSelectedTags(postData.tags); // Adjust based on your response structure
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, [postId]);

  // Handlers for category and tag management
  const addCategory = (category) => {
    setSelectedCategory(category);
    setShowCategoryPopup(false);
  };

  const addTag = (tag) => {
    if (!selectedTags.includes(tags)) {
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleFileButtonClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset validation error
    setValidationError("");

    // Validation for category and tags
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

    // Append selected category and tags to the FormData
    // Append selected category and tags to the FormData
    if (selectedCategory) {
      data.append("categories", JSON.stringify([selectedCategory])); // Wrap in array and stringify
    }
    if (selectedTags.length > 0) {
      data.append("tags", JSON.stringify(selectedTags)); // Stringify the array
    }

    try {
      const response = await fetch(`http://localhost:4000/posts/${postId}`, {
        method: "PUT",
        body: data,
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      navigate("/user"); // Redirect to the user page or wherever appropriate
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="edit-post-container">
      <FaArrowCircleLeft
        className="single-go-back-icon"
        onClick={handleGoBack}
      />
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          name="title"
          placeholder="Post Title(max 100 characters)"
          value={formData.title}
          onChange={handleInputChange}
          maxLength="100"
        />
        <textarea
          name="content"
          placeholder="Post Content(min 300 characters)"
          value={formData.content}
          onChange={handleInputChange}
          minLength="300"
        />
        {/* Category Section */}
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

        {/* Tag Section */}
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
        {/* Display validation error if it exists */}
        {validationError && (
          <div className="validation-error">{validationError}</div>
        )}
        <button type="submit" className="edit-post-submit">
          Update Post
        </button>
        {/* Category Modal */}
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

        {/* Tag Modal */}
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

export default EditPost;
