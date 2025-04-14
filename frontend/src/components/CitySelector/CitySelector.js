import React, { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import "./CitySelector.css";

const CitySelector = ({ cities, selectedCity, onCityChange }) => {
  return (
    <div className="city-selector">
      <div className="city-selector-label">
        <FaLocationDot className="city-icon" />
        <label htmlFor="city">Miasto:</label>
      </div>
      <select id="city" value={selectedCity} onChange={onCityChange}>
        {cities.map((city) => (
          <option key={city.id} value={city.name}>
            {city.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CitySelector;
