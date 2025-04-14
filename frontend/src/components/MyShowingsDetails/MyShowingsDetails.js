import React from "react";
import { formatDate3 } from "../../utils/formatDate3";
import ticketImage from "../../images/ticket_normal.png";
import ticketImageSchool from "../../images/ticket_school.png";
import "./MyShowingsDetails.css";

const MyShowingsDetails = ({ showing }) => {
  return (
    <div className="my-showings-details-wrapper">
      <img
        src={
          showing?.showing_type === "school" ? ticketImageSchool : ticketImage
        }
        alt="Ticket"
        className="ticket-background"
      />{" "}
      <div className="my-showings-details-content">
        <div className="left-section">
          <p className="my-showings-title">{showing?.film_name}</p>
          <p>
            <strong>Data seansu:</strong>{" "}
            {formatDate3(showing?.showing_datetime).split(" ")[0]}
          </p>
          <p>
            <strong>Godzina seansu:</strong>{" "}
            {formatDate3(showing?.showing_datetime).split(" ")[1]}
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
          <p>
            <strong>Miejsca:</strong> {showing?.language}
          </p>
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
                <p>{showing.ticket_summary.school} x Szkolny</p>
              )}
              {showing?.ticket_summary?.senior > 0 && (
                <p>{showing.ticket_summary.senior} x Senior</p>
              )}
            </div>
          </div>

          <hr />

          <div className="snacks-and-tickets-container">
            <p>
              <strong>Przekąski:</strong>
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
