import React from "react";
import { FaArrowCircleLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../style/dev.css";

const Dev = () => {
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1);
  };
  return (
    <div className="dev-container">
      <FaArrowCircleLeft
        className="single-go-back-icon"
        id="dev-go-back-icon"
        onClick={handleGoBack}
      />
      <p>I'm sorry but this page is still in development (๑• . •๑)</p>
    </div>
  );
};

export default Dev;
