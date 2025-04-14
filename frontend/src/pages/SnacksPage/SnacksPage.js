import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DefaultHeader from "../../components/Headers/DeaultHeader";
import GoBackButton from "../../components/GoBackButton/GoBackButton";
import TicketAndSnackOptions from "../../components/TicketAndSnackOptions/TicketAndSnackOptions";
import { LuPopcorn } from "react-icons/lu";
import kinoverse from "../../images/kinoverse.png";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useReservationTimer, formatTime } from "../../utils/timerUtils";
import "./SnacksPage.css";
import "../../App.css";

function SnacksPage() {
  const [snacks, setSnacks] = useState({ jedzenie: [], picie: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackQuantities, setSnackQuantities] = useState(() => {
    const savedQuantities = localStorage.getItem("snackQuantities");
    return savedQuantities ? JSON.parse(savedQuantities) : {};
  });
  const showing_id = localStorage.getItem("showingId");
  const ticketQuantities = localStorage.getItem("ticketQuantities");
  const selectedSeats = localStorage.getItem("selectedSeats");
  const orderId = localStorage.getItem("orderId");
  const orderCreatedAt = localStorage.getItem("orderCreatedAt");
  const type = localStorage.getItem("showingType");
  const navigate = useNavigate();

  const { timeLeft, formattedTime } = useReservationTimer();

  useEffect(() => {
    if (
      !showing_id ||
      !ticketQuantities ||
      !selectedSeats ||
      !orderId ||
      !orderCreatedAt
    ) {
      navigate("/error");
      return;
    }
    const fetchSnacks = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/snacks");
        if (!response.ok) {
          throw new Error("Błąd podczas pobierania przekąsek");
        }
        const data = await response.json();
        setSnacks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSnacks();
  }, []);

  const handleConfirm = async () => {
    console.log("Zamówione przekąski i napoje:", snackQuantities);

    const filteredQuantities = Object.fromEntries(
      Object.entries(snackQuantities).filter(([_, qty]) => qty > 0)
    );

    localStorage.setItem("snackQuantities", JSON.stringify(filteredQuantities));
    navigate("/home/payment");
  };

  const allSnacks = [...snacks.jedzenie, ...snacks.picie];

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <DefaultHeader />
      <GoBackButton path="/home/seats" text="Przekąski" icon={LuPopcorn} />

      {loading ? (
        <div className="spinner">
          <AiOutlineLoading3Quarters className="loading-icon" />
        </div>
      ) : (
        <div>
          <div className="snacks-container">
            <div className="snacks-options-container">
              <TicketAndSnackOptions
                items={allSnacks}
                quantities={snackQuantities}
                setQuantities={setSnackQuantities}
                button={false}
                maxTotal={50}
              />
            </div>

            <div className="image-and-button-container">
              <div className="image-container">
                <div className="snacks-timer-container">
                  Pozostały czas rezerwacji:{" "}
                  <span className="snacks-timer">{formattedTime}</span>
                </div>
                <img
                  src={kinoverse}
                  alt="Kinoverse logo"
                  style={{ width: "330px", height: "auto" }}
                />
              </div>
              <button
                className={"snacks-continue-button"}
                onClick={handleConfirm}
              >
                PRZEJDŹ DO PŁATNOŚCI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SnacksPage;
