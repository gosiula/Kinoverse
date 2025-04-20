import React from "react";
import { PiFilmSlate } from "react-icons/pi";
import "./Selector.css";

const ShowingsSelector = ({ showings, selectedShowing, onShowingChange }) => {
  return (
    <div className="selector showing-selector">
      <div className="selector-label">
        <PiFilmSlate className="selector-icon" />
        <label htmlFor="showing">Film:</label>
      </div>
      <select id="showing" value={selectedShowing} onChange={onShowingChange}>
        {showings.map((showing) => (
          <option key={showing.id} value={showing.name}>
            {showing.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ShowingsSelector;
