import React, { useState, useEffect } from "react";
import DefaultHeader from "../../components/Headers/DeaultHeader";
import CalendarPicker from "../../components/CalendarPicker/CalendarPicker";
import MyShowingsDetails from "../../components/MyShowingsDetails/MyShowingsDetails";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import "./MyShowingsPage.css";
import "../../App.css";

function MyShowingsPage() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 30))
  );
  const [showings, setShowings] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatDateLocal = (date) => {
    return date.toLocaleDateString("sv-SE"); // "YYYY-MM-DD" format
  };

  const getAuth = () => {
    try {
      const auth = JSON.parse(localStorage.getItem("authData"));
      if (!auth?.token) return null;

      const tokenParts = auth.token.split(".");
      if (tokenParts.length !== 3) return null;

      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp < currentTime) return null;

      return auth;
    } catch {
      return null;
    }
  };

  const auth = getAuth();
  const isUser = auth?.role === "USER";
  const email = (isUser ? auth?.mail : "") || "";
  const token = auth?.token;

  useEffect(() => {
    const fetchShowings = async () => {
      if (!email || !startDate || !endDate || !token) return;

      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/my_showings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: email,
            start_date: formatDateLocal(startDate),
            end_date: formatDateLocal(endDate),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setShowings(data);
        } else {
          setShowings([]);
        }
      } catch (error) {
        console.error("Błąd przy pobieraniu pokazów:", error);
      }
      setLoading(false);
    };

    fetchShowings();
  }, [email, startDate, endDate, token]);

  const handleDateChange = ([newStart, newEnd]) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <DefaultHeader />
      <div className="my-showings-panel">
        <CalendarPicker
          initialStartDate={startDate}
          initialEndDate={endDate}
          onDateChange={handleDateChange}
          primaryColor="#191C49"
          secondaryColor="#414696"
          backgroundColor="#ffffff"
        />
      </div>
      <div className="my-showings-list">
        {loading ? (
          <div className="spinner">
            <AiOutlineLoading3Quarters className="loading-icon" />
          </div>
        ) : (
          showings.map((showing, index) => (
            <MyShowingsDetails key={index} showing={showing} />
          ))
        )}
      </div>
    </div>
  );
}

export default MyShowingsPage;
