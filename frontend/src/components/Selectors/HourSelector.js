import React from "react";
import { TbClockHour4 } from "react-icons/tb";
import "./Selector.css";

const HourSelector = ({ hours, selectedHour, onHourChange }) => {
  return (
    <div className="selector hour-selector">
      <div className="selector-label">
        <TbClockHour4 className="selector-icon" style={{ marginLeft: "0px" }} />
        <label htmlFor="hour">Godzina:</label>
      </div>
      <select
        id="hour"
        value={selectedHour ? JSON.stringify(selectedHour) : ""}
        onChange={(e) => {
          try {
            const parsedHour = JSON.parse(e.target.value);
            onHourChange(parsedHour);
          } catch (err) {
            console.error("Nie udało się sparsować godziny:", err);
          }
        }}
      >
        {hours.map((h) => (
          <option key={h.id} value={JSON.stringify(h)}>
            {h.hour} ({h.language})
          </option>
        ))}
      </select>
    </div>
  );
};

export default HourSelector;
