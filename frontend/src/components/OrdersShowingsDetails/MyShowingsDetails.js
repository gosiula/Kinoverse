import React from "react";
import { formatDate3 } from "../../utils/formatDate3";
import ticketImage from "../../images/ticket_normal.png";
import ticketImageSchool from "../../images/ticket_school.png";
import "./OrdersShowingsDetails.css";

const MyShowingsDetails = ({ showing }) => {
  return (
    <div className="orders-showings-details-wrapper">
      <img
        src={
          showing?.showing_type === "school" ? ticketImageSchool : ticketImage
        }
        alt="Ticket"
        className="ticket-background"
      />{" "}
      <div className="showings-details-content">
        <div className="left-section">
          <p className="orders-showings-title">{showing?.film_name}</p>
          <p>
            <strong>Data seansu:</strong>{" "}
            {formatDate3(showing?.showing_datetime).split(" ")[0]}
          </p>
          <p>
            <strong>Godzina seansu:</strong>{" "}
            {(() => {
              const timeStr = formatDate3(showing?.showing_datetime).split(
                " "
              )[1];
              const [hours, minutes] = timeStr.split(":").map(Number);
              const date = new Date();
              date.setHours(hours);
              date.setMinutes(minutes);
              date.setHours(date.getHours() - 2);
              const newHours = String(date.getHours()).padStart(2, "0");
              const newMinutes = String(date.getMinutes()).padStart(2, "0");
              return `${newHours}:${newMinutes}`;
            })()}
          </p>

          <p>
            <strong>Kino:</strong> {showing?.cinema_name}
          </p>
          <p>
            <strong>Adres:</strong> {showing?.cinema_address}
          </p>
          <p>
            <strong>Język:</strong> {showing?.language}
          </p>
          {showing?.showing_type !== "school" && (
            <p>
              <strong>Miejsca:</strong> {showing?.seat_locations?.join(", ")}
            </p>
          )}
          {showing?.showing_type === "school" && (
            <p>
              <strong>Miejsca:</strong> Rezerwacja całej sali
            </p>
          )}
          <p>
            <strong>Cena:</strong> {showing?.total_amount} zł
          </p>
        </div>

        <div className="divider" />

        <div className="right-section">
          <div className="snacks-and-tickets-container">
            <p>
              <strong>Bilety:</strong>
            </p>
            <div>
              {showing?.ticket_summary?.normal > 0 && (
                <p>{showing.ticket_summary.normal} x Normalny</p>
              )}
              {showing?.ticket_summary?.reduced > 0 && (
                <p>{showing.ticket_summary.reduced} x Ulgowy</p>
              )}
              {showing?.ticket_summary?.school > 0 && (
                <p>{showing.room_capacity} x Szkolny</p>
              )}
              {showing?.ticket_summary?.senior > 0 && (
                <p>{showing.ticket_summary.senior} x Senior</p>
              )}
            </div>
          </div>

          <hr />

          <div className="snacks-and-tickets-container">
            <p>
              <strong>Przekąski: </strong>
            </p>
            <div>
              {showing?.snack_summary?.split(", ").map((item, idx) => (
                <p key={idx}>{item}</p>
              ))}
              {!showing?.snack_summary && <p>Brak przekąsek</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyShowingsDetails;
