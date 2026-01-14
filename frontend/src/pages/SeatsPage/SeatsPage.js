import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DefaultHeader from "../../components/Headers/DeaultHeader";
import GoBackButton from "../../components/GoBackButton/GoBackButton";
import SeatsLayout from "../../components/SeatsLayout/SeatsLayout";
import { MdEventSeat } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import "./SeatsPage.css";
import "../../App.css";

function SeatsPage() {
  const navigate = useNavigate();

  const ticketQuantitiesRaw = localStorage.getItem("ticketQuantities");
  const ticketQuantities = ticketQuantitiesRaw
    ? JSON.parse(ticketQuantitiesRaw)
    : {};

  const normal = ticketQuantities["Normalny"] || 0;
  const reduced = ticketQuantities["Ulgowy"] || 0;
  const senior = ticketQuantities["Senior"] || 0;

  const total = Object.values(ticketQuantities).reduce(
    (sum, count) => sum + count,
    0
  );

  const showing_id = localStorage.getItem("showingId");
  const capacity = parseInt(localStorage.getItem("capacity"), 10);

  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!showing_id || !capacity || !ticketQuantities) {
      navigate("/error");
      return;
    }

    const fetchOccupiedSeats = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/occupied_seats/${showing_id}`
        );
        if (!response.ok) {
          throw new Error("Błąd podczas pobierania zajętych miejsc");
        }
        const data = await response.json();
        setOccupiedSeats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOccupiedSeats();
  }, [showing_id]);

  const handleConfirm = async () => {
    if (selectedSeats.length !== total) return;

    const allTypes = {};
    let seatIndex = 0;
    for (let i = 0; i < normal; i++) allTypes[seatIndex++] = "normal";
    for (let i = 0; i < reduced; i++) allTypes[seatIndex++] = "reduced";
    for (let i = 0; i < senior; i++) allTypes[seatIndex++] = "senior";

    const types = {};
    selectedSeats.forEach((seat, index) => {
      types[index] = allTypes[index];
    });

    try {
      const orderId = localStorage.getItem("orderId") || "0";

      const response = await fetch(
        `http://localhost:5000/api/order_reserved/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            showingID: showing_id,
            types: types,
            seats: selectedSeats,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Nie udało się zaktualizować zamówienia");
      }

      const data = await response.json();

      console.log(response);

      if (data.id) {
        localStorage.setItem("orderId", data.id);
      }

      if (data.created_at) {
        localStorage.setItem("orderCreatedAt", data.created_at);
      }
      localStorage.removeItem("orderExpiresAtMs"); // reset starego timera dla nowego zamówienia
      navigate("/home/snacks");
    } catch (error) {
      console.error("Błąd podczas aktualizacji:", error);
      alert("Błąd podczas aktualizacji: " + error.message);
    }
  };

  useEffect(() => {
    const savedSelectedSeats = localStorage.getItem("selectedSeats");
    if (savedSelectedSeats) {
      setSelectedSeats(JSON.parse(savedSelectedSeats));
    }
  }, []);

  const handleSeatSelection = (seats) => {
    setSelectedSeats(seats);

    localStorage.setItem("selectedSeats", JSON.stringify(seats));
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <DefaultHeader />
      <GoBackButton
        path="/home/tickets"
        text="Rezerwacja miejsc"
        icon={MdEventSeat}
      />

      {loading ? (
        <div className="spinner">
          <AiOutlineLoading3Quarters className="loading-icon" />
        </div>
      ) : (
        <>
          <div className="seats-layout-container">
            <SeatsLayout
              capacity={capacity}
              occupiedSeats={occupiedSeats}
              total={total}
              onSeatChange={handleSeatSelection}
              selectedSeats={selectedSeats}
              onConfirm={handleConfirm}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default SeatsPage;
