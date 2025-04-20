import React from "react";
import { FaMasksTheater } from "react-icons/fa6";
import "./Selector.css";

const TypeSelector = ({ types, selectedType, onTypeChange }) => {
  return (
    <div className="selector" style={{ width: "30%" }}>
      <div className="selector-label">
        <FaMasksTheater
          className="selector-icon"
          style={{ marginLeft: "0px" }}
        />
        <label htmlFor="type">Typ seansu:</label>
      </div>
      <select id="type" value={selectedType} onChange={onTypeChange}>
        {types.map((type) => (
          <option key={type} value={type}>
            {type === "normal" ? "Zwykły" : "Szkolny"}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TypeSelector;
