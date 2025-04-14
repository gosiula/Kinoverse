import React from "react";
import "./Confirmation.css";

const Confirmation = ({ onConfirm, title1, title2, color, text }) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <div className="confirmation-container">
      <p className="confirmation-text" style={{ color }}>
        {title1}
      </p>
      <p className="confirmation-text" style={{ color }}>
        {title2}
      </p>
      <div className="button-container">
        <button className="confirm-button" onClick={handleConfirm}>
          {text}
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
