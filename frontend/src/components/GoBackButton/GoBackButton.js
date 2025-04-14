import React from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import "./GoBackButton.css";

function GoBackButton({ path, text, icon: Icon, clearStorageKeys = [] }) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    clearStorageKeys.forEach((key) => localStorage.removeItem(key));
    navigate(path);
  };

  return (
    <div className="go-back-header">
      <button className="go-back-button" onClick={handleGoBack}>
        <IoMdArrowRoundBack className="go-back-icon" />
      </button>
      <label>{text}</label>
      {Icon && <Icon className="go-back-second-icon" />}
    </div>
  );
}

export default GoBackButton;
