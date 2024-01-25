// Modal.js
import React from "react";
import "../style/modal.css"; // Make sure to create a CSS file for styling

const Modal = ({ title, children, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h4>{title}</h4>
          <button onClick={onClose} className="close-button">
            X
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
