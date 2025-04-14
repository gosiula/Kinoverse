import React, { useState, useEffect } from "react";
import { IoCalendarSharp } from "react-icons/io5";
import DatePicker from "react-datepicker";
import { formatDate2 } from "../../utils/formatDate2";
import "react-datepicker/dist/react-datepicker.css";
import "./DaySelector.css";

const getDaysOfWeek = () => {
  const daysOfWeek = [
    "niedziela",
    "poniedziałek",
    "wtorek",
    "środa",
    "czwartek",
    "piątek",
    "sobota",
  ];
  const today = new Date();
  const todayIndex = today.getDay();

  return [...daysOfWeek.slice(todayIndex), ...daysOfWeek.slice(0, todayIndex)];
};

const DaySelector = ({ selectedDate, onDateChange }) => {
  const [days, setDays] = useState([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    setDays(getDaysOfWeek());
  }, []);

  const handleDateChange = (date) => {
    onDateChange(date);
    setIsCalendarOpen(false);
  };

  const isSelected = (day) => {
    const today = new Date();
    const dayIndex = getDaysOfWeek().indexOf(day);
    today.setDate(today.getDate() + dayIndex);

    const selected = new Date(selectedDate);
    return formatDate2(today) === formatDate2(selected);
  };

  const isAvailableInButtons = () => {
    if (!selectedDate) return true;

    const selectedDateObj = new Date(selectedDate);
    const formattedSelectedDate = formatDate2(selectedDateObj);

    const availableDays = days.map((day) => {
      const today = new Date();
      const dayIndex = getDaysOfWeek().indexOf(day);
      today.setDate(today.getDate() + dayIndex);
      return formatDate2(today);
    });

    return availableDays.includes(formattedSelectedDate);
  };

  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);

  return (
    <div className="day-selector">
      {days.map((day, index) => (
        <button
          key={index}
          onClick={() => {
            const today = new Date();
            const dayIndex = getDaysOfWeek().indexOf(day);
            today.setDate(today.getDate() + dayIndex);
            handleDateChange(today);
          }}
          className={`day-button ${isSelected(day) ? "selected" : ""}`}
        >
          {day === days[0]
            ? "DZIŚ"
            : day === days[1]
            ? "JUTRO"
            : day === "poniedziałek"
            ? "PON."
            : day === "wtorek"
            ? "WT."
            : day === "środa"
            ? "ŚR."
            : day === "czwartek"
            ? "CZW."
            : day === "piątek"
            ? "PT."
            : day === "sobota"
            ? "SOB."
            : "ND."}
        </button>
      ))}

      <button
        onClick={toggleCalendar}
        className={`calendar-button ${
          isAvailableInButtons() ? "" : "unavailable"
        } ${selectedDate ? "selected-calendar" : ""}`}
      >
        <IoCalendarSharp size={24} />
      </button>

      {isCalendarOpen && (
        <div className="calendar-popup">
          <DatePicker
            selected={selectedDate ? new Date(selectedDate) : null}
            onChange={handleDateChange}
            inline
            dateFormat="yyyy-MM-dd"
          />
        </div>
      )}
    </div>
  );
};

export default DaySelector;
