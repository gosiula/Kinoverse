import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultHeader from "../../../../components/Headers/DeaultHeader";
import GoBackButton from "../../../../components/GoBackButton/GoBackButton";
import SeatsLayout from "../../../../components/SeatsLayout/SeatsLayout";
import { MdPublishedWithChanges } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import "./EditSeatsPage.css";
import "../../../../App.css";

function EditSeatsPage() {
  const navigate = useNavigate();

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
  const isEmployee = auth?.role === "EMPLOYEE";
  const isAdmin = auth?.role === "ADMIN";

  const showing_id = localStorage.getItem("editShowingId");
  const capacity = parseInt(localStorage.getItem("editCapacity"), 10);

  const ticketQuantitiesString = localStorage.getItem("editTickets");
  const ticketQuantities = ticketQuantitiesString
    ? JSON.parse(ticketQuantitiesString)
    : {};

  const normal = ticketQuantities["Normalny"] || 0;
  const reduced = ticketQuantities["Ulgowy"] || 0;
  const senior = ticketQuantities["Senior"] || 0;

  const total = Object.values(ticketQuantities).reduce(
    (sum, count) => sum + count,
    0
  );

  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!showing_id || isNaN(capacity)) {
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

        const savedSeats = localStorage.getItem("editSeats");
        if (savedSeats) {
          try {
            const parsedSeats = JSON.parse(savedSeats);
            if (Array.isArray(parsedSeats)) {
              setSelectedSeats(parsedSeats);
            }
          } catch (e) {
            console.error("Error parsing saved seats:", e);
          }
        }
      } catch (err) {
        console.error("Error fetching occupied seats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOccupiedSeats();
  }, [showing_id, capacity, navigate]);

  const orderId = localStorage.getItem("orderToEdit") || "0";

  useEffect(() => {
    const noAuthOrUser = !auth || isUser;

    if (!orderId || noAuthOrUser) {
      navigate("/error");
    }
  }, [orderId, navigate]);

  const handleConfirm = async () => {
    if (selectedSeats.length !== total) {
      alert("Musisz wybrać dokładnie tyle miejsc, ile masz biletów");
      return;
    }

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
      const showingID = localStorage.getItem("editShowingId");

      if (!showingID || !selectedSeats.length || !Object.keys(types).length) {
        throw new Error("Brakujące dane: showingID, types lub seats");
      }

      console.log(orderId);
      console.log(parseInt(showingID, 10));
      console.log(types);
      console.log(selectedSeats);

      const response = await fetch(
        `http://localhost:5000/api/order_reserved/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            showingID: parseInt(showingID, 10),
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

      localStorage.setItem("editSeats", JSON.stringify(selectedSeats));
      localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
      onConfirm();
    } catch (error) {
      console.error("Błąd podczas aktualizacji:", error);
      alert("Błąd podczas aktualizacji: " + error.message);
    }
  };

  const onConfirm = () => {
    localStorage.removeItem("editShowingId");
    localStorage.removeItem("editCapacity");
    localStorage.removeItem("editMail");
    localStorage.removeItem("editIsPaid");
    localStorage.removeItem("editTickets");
    localStorage.removeItem("editSeats");
    localStorage.removeItem("editSnacks");
    if (isEmployee) {
      navigate("/employee/orders/edit");
    } else if (isAdmin) {
      navigate("/admin/orders/edit");
    }
  };

  const handleSeatSelection = (seats) => {
    setSelectedSeats(seats);
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <DefaultHeader />
      <GoBackButton
        path={
          isEmployee
            ? "/employee/orders/edit"
            : isAdmin
            ? "/home/orders/edit"
            : "/home"
        }
        text="Modyfikacja miejsc"
        icon={MdPublishedWithChanges}
      />
      {loading ? (
        <div className="spinner">
          <AiOutlineLoading3Quarters className="loading-icon" />
        </div>
      ) : (
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
      )}
    </div>
  );
}

export default EditSeatsPage;
