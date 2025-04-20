import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DefaultHeader from "../../components/Headers/DeaultHeader";
import CitySelector from "../../components/Selectors/CitySelector";
import DaySelector from "../../components/DaySelector/DaySelector";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import ShowingDetails from "../../components/ShowingDetails/ShowingDetails";
import { formatDate2 } from "../../utils/formatDate2";
import "./SchoolPage.css";
import "../../App.css";

function SchoolPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem("selectedCitySchool") || "Warszawa"
  );
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);

  const getInitialDate = () => {
    const storedDate = localStorage.getItem("selectedDateSchool");
    if (storedDate) return storedDate;
    const today = new Date();
    return formatDate2(today);
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [showings, setShowings] = useState([]);

  useEffect(() => {
    async function fetchCities() {
      try {
        const response = await fetch("http://localhost:5000/api/cities");
        if (response.ok) {
          const data = await response.json();
          setCities(data);

          if (data.length > 0) {
            const storedCity = localStorage.getItem("selectedCitySchool");
            const initialCity = storedCity || data[0].name;
            setSelectedCity(initialCity);
            const selected = data.find((c) => c.name === initialCity);
            if (selected) {
              setSelectedCinemaId(selected.id);
            }
          }
        } else {
          console.error("Nie udało się pobrać miast");
        }
      } catch (error) {
        console.error("Błąd przy pobieraniu miast:", error);
      }
    }

    fetchCities();
  }, []);

  const handleCityChange = (event) => {
    const cityName = event.target.value;
    setSelectedCity(cityName);
    localStorage.setItem("selectedCitySchool", cityName);

    const selected = cities.find((c) => c.name === cityName);
    if (selected) {
      setSelectedCinemaId(selected.id);
    }
  };

  useEffect(() => {
    const fetchShowings = async () => {
      if (!selectedDate || !selectedCinemaId) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/showings?date=${selectedDate}&type=school&cinema_id=${selectedCinemaId}`
        );

        const responseText = await response.text();
        console.log("Odpowiedź serwera:", responseText);

        if (response.ok) {
          const data = JSON.parse(responseText);
          setShowings(data);
          console.log("Pokazy filmowe:", data);
        } else {
          setShowings([]);
          setLoading(false);
        }
        setLoading(false);
      } catch (error) {
        console.error("Błąd przy pobieraniu seansów:", error);
        setLoading(false);
      }
    };

    fetchShowings();
  }, [selectedDate, selectedCinemaId]);

  const handleClick = (showingId) => {
    if (showingId) {
      localStorage.setItem("showingId", showingId);
      localStorage.setItem("showingType", "schools");
      navigate("/schools/tickets");
    } else {
      console.error("Nie znaleziono ID seansu");
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <DefaultHeader />
      <CitySelector
        cities={cities}
        selectedCity={selectedCity}
        onCityChange={handleCityChange}
      />
      <DaySelector
        selectedDate={selectedDate}
        onDateChange={(date) => {
          const formatted = formatDate2(date);
          setSelectedDate(formatted);
          localStorage.setItem("selectedDateSchool", formatted);
        }}
      />

      {loading ? (
        <div className="spinner">
          <AiOutlineLoading3Quarters className="loading-icon" />
        </div>
      ) : (
        <div className="showings-list">
          {showings.length > 0 ? (
            <div>
              {showings.map((showingData, index) => {
                console.log("Showing Data:", showingData);
                return (
                  <ShowingDetails
                    key={index}
                    showing={showingData}
                    onClick={handleClick}
                    isPast={new Date(showingData.date) < new Date()}
                  />
                );
              })}
            </div>
          ) : (
            <p>Brak dostępnych seansów.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default SchoolPage;
