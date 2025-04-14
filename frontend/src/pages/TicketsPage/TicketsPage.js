import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DefaultHeader from "../../components/Headers/DeaultHeader";
import { IoTicketSharp } from "react-icons/io5";
import TicketAndSnackOptions from "../../components/TicketAndSnackOptions/TicketAndSnackOptions";
import GoBackButton from "../../components/GoBackButton/GoBackButton";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { formatDate3 } from "../../utils/formatDate3";
import "./TicketsPage.css";
import "../../App.css";

function TicketsPage() {
  const navigate = useNavigate();
  const showing_id = localStorage.getItem("showingId");

  const type = localStorage.getItem("showingType");

  const [loading, setLoading] = useState(true);
  const [showingDetails, setShowingDetails] = useState(null);
  const showingType = localStorage.getItem("showingType");

  const [ticketQuantities, setTicketQuantities] = useState(() => {
    const savedQuantities = localStorage.getItem("ticketQuantities");
    try {
      return savedQuantities ? JSON.parse(savedQuantities) : {};
    } catch (error) {
      console.error("Error parsing ticketQuantities from localStorage:", error);
      return {};
    }
  });

  const ticketTypes = [
    {
      id: 1,
      name: "Normalny",
      price: parseFloat(showingDetails?.prices?.normal ?? 0),
    },
    {
      id: 2,
      name: "Ulgowy",
      price: parseFloat(showingDetails?.prices?.child ?? 0),
    },
    {
      id: 3,
      name: "Senior",
      price: parseFloat(showingDetails?.prices?.senior ?? 0),
    },
  ];

  const maxTickets = showingDetails?.empty_seats ?? 0;

  const handleNavigate = () => {
    const total = Object.values(ticketQuantities).reduce(
      (sum, qty) => sum + qty,
      0
    );

    if (total > 0 && total <= showingDetails?.empty_seats) {
      localStorage.setItem(
        "ticketQuantities",
        JSON.stringify(ticketQuantities)
      );
      localStorage.setItem("capacity", showingDetails?.capacity);
      navigate("/home/seats");
    }
  };

  useEffect(() => {
    if (!showing_id || !showingType) {
      navigate("/error");
      return;
    }
    async function fetchShowingDetails() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/showing_details/${showing_id}`
        );
        if (response.ok) {
          const data = await response.json();
          setShowingDetails(data);
          setLoading(false);
          console.log(data);
        } else {
          console.error("Błąd przy pobieraniu szczegółów seansu");
          setLoading(false);
        }
      } catch (error) {
        console.error("Błąd przy pobieraniu danych:", error);
        setLoading(false);
      }
    }

    if (showing_id) {
      fetchShowingDetails();
    }
  }, [showing_id]);

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <DefaultHeader />
      <GoBackButton
        path={type == "schools" ? "/schools" : "/home"}
        text="Wybór biletów"
        icon={IoTicketSharp}
        clearLocalKeys={["showingId"]}
      />

      {loading ? (
        <div className="spinner">
          <AiOutlineLoading3Quarters className="loading-icon" />
        </div>
      ) : (
        <div className="showing-details-ticket-page">
          <div className="showing-details-info">
            <h2>{showingDetails?.film_name}</h2>
            <p>
              <strong>Kino:</strong> {showingDetails?.cinema_name}
            </p>
            <p>
              <strong>Adres kina:</strong> {showingDetails?.cinema_address}
            </p>
            <p>
              <strong>Sala:</strong> {showingDetails?.screening_room_name}
            </p>
            {type == "schools" && (
              <p>
                <strong>Wielkość sali:</strong> {showingDetails?.capacity}{" "}
                miejsc
              </p>
            )}
            <p>
              <strong>Data seansu:</strong>{" "}
              {showingDetails?.showing_time &&
                formatDate3(showingDetails.showing_time).split(" ")[0]}
            </p>
            <p>
              <strong>Godzina seansu:</strong>{" "}
              {showingDetails?.showing_time &&
                formatDate3(showingDetails.showing_time).split(" ")[1]}
            </p>
            <p>
              <strong>Język seansu:</strong> {showingDetails?.showing_language}
            </p>
            {type == "schools" && (
              <p>
                <strong>Cena:</strong> {showingDetails?.price} zł
              </p>
            )}
          </div>

          {showingDetails && type == "normal" && (
            <div className="ticket-options-container">
              <TicketAndSnackOptions
                items={ticketTypes}
                quantities={ticketQuantities}
                setQuantities={setTicketQuantities}
                onConfirm={handleNavigate}
                buttonText="POTWIERDŹ WYBÓR BILETÓW"
                maxTotal={maxTickets}
              />
            </div>
          )}
          {showingDetails && type == "schools" && (
            <button
              className="confirm-tickets-btn"
              onClick={() => navigate("/schools/snacks")}
            >
              POTWIERDŹ WYBÓR SEANSU
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default TicketsPage;
