import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CalendarPicker.css";
import { LuCalendarCheck } from "react-icons/lu";
import { formatDate } from "../../utils/formatDate";

const CalendarPicker = ({
  initialStartDate,
  initialEndDate,
  onDateChange,
  primaryColor,
  secondaryColor,
  backgroundColor,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dates, setDates] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", primaryColor);
    document.documentElement.style.setProperty(
      "--secondary-color",
      secondaryColor
    );
    document.documentElement.style.setProperty(
      "--background-color",
      backgroundColor
    );
  }, [primaryColor, secondaryColor, backgroundColor]);

  const toggleDatePicker = () => setIsDatePickerOpen((prev) => !prev);

  const handleDateSelection = (selectedDates) => {
    const [startDate, endDate] = selectedDates;

    setDates({ startDate, endDate });
    onDateChange(selectedDates);

    if (startDate && endDate) {
      setIsDatePickerOpen(false);
    }
  };

  return (
    <div>
      <div className="date-picker-bar" onClick={toggleDatePicker}>
        <div className="calendar-header">
          <div className="date-text">
            {dates.startDate ? formatDate(dates.startDate) : ""} -{" "}
            {dates.endDate ? formatDate(dates.endDate) : ""}
            <LuCalendarCheck className="calendar-icon" />
          </div>
        </div>
      </div>
      {isDatePickerOpen && (
        <div className="date-picker-container">
          <DatePicker
            selectsRange
            startDate={dates.startDate}
            endDate={dates.endDate}
            onChange={handleDateSelection}
            inline
            dateFormat="yyyy-MM-dd"
          />
        </div>
      )}
    </div>
  );
};

export default CalendarPicker;
