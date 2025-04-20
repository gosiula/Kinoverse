import React from "react";
import { useNavigate } from "react-router-dom";
import ticketImage from "../../images/ticket_normal.png";
import ticketImageSchool from "../../images/ticket_school.png";
import "./OrdersShowingsDetails.css";

const OrdersDetails = ({
  order,
  editPath,
  deletePath,
  showingType,
  showing_date,
  showing_hour,
}) => {
  const navigate = useNavigate();
  const now = new Date();
  const showingDateTime = new Date(`${showing_date}T${showing_hour}`);
  const isPast = now > showingDateTime;
  console.log(showingDateTime);
  console.log(now);

  const handleEdit = () => {
    localStorage.setItem("orderToEdit", order?.order_id);
    navigate(`${editPath}`);
  };

  const handleDelete = () => {
    localStorage.setItem("orderToDelete", order?.order_id);
    navigate(`${deletePath}`);
  };

  const snackItems = order?.snack_summary
    ? order.snack_summary.split(", ").filter((item) => item.trim() !== "")
    : [];
  console.log(isPast);
  return (
    <div className="orders-showings-details-wrapper">
      <div className="ticket-container">
        <img
          src={showingType === "school" ? ticketImageSchool : ticketImage}
          alt="Ticket"
          className="ticket-background"
        />
        <div className="ticket-content-container">
          <div className="orders-details-content">
            <div className="left-section">
              {order?.occupied_seats?.length > 0 &&
                showingType === "normal" && (
                  <p className="orders-showings-title">
                    {order.occupied_seats.join(", ")}
                  </p>
                )}
              {order?.occupied_seats?.length > 0 &&
                showingType === "school" && (
                  <p className="orders-showings-title">Rezerwacja całej sali</p>
                )}
              <p>
                <strong>Sala: </strong> {order?.screening_room_name}
              </p>
              <p>
                <strong>Mail: </strong> {order?.mail || "Brak danych."}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {order?.payed ? "Opłacone" : "Nieopłacone"}
              </p>

              <p>
                <strong>Cena: </strong> {order?.total_price} zł
              </p>
              <div className="order-button-wrapper">
                <button
                  className={`edit-button ${isPast ? "disabled" : ""}`}
                  onClick={handleEdit}
                  disabled={isPast}
                >
                  Modyfikuj
                </button>
                <button
                  className={`delete-button ${isPast ? "disabled" : ""}`}
                  onClick={handleDelete}
                  disabled={isPast}
                >
                  Usuń
                </button>
              </div>
            </div>

            <div className="divider" />

            <div className="right-section">
              <div className="snacks-and-tickets-container">
                <p>
                  <strong>Bilety:</strong>
                </p>
                <div>
                  {order?.ticket_summary?.normal > 0 && (
                    <p>{order.ticket_summary.normal} x Normalny</p>
                  )}
                  {order?.ticket_summary?.reduced > 0 && (
                    <p>{order.ticket_summary.reduced} x Ulgowy</p>
                  )}
                  {order?.ticket_summary?.school > 0 && (
                    <p>{order.ticket_summary.school} x Szkolny</p>
                  )}
                  {order?.ticket_summary?.senior > 0 && (
                    <p>{order.ticket_summary.senior} x Senior</p>
                  )}
                </div>
              </div>

              <hr />
              <div className="snacks-and-tickets-container">
                <p>
                  <strong>Przekąski: </strong>
                </p>
                <div>
                  {order?.snacks ? (
                    order.snacks
                      .split(", ")
                      .map((snack, index) => <p key={index}>{snack}</p>)
                  ) : (
                    <p>Brak przekąsek.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersDetails;
