import kinoverse from "../../images/kinoverse.png";
import React, { useState, useEffect } from "react";
import "./SeatsLayout.css";

function SeatsLayout({
  capacity,
  occupiedSeats,
  total,
  onSeatChange,
  selectedSeats,
  onConfirm,
}) {
  const rows = Math.ceil(capacity / 10);
  const columns = 10;

  const [myReservedSeats, setMyReservedSeats] = useState([]);

  useEffect(() => {
    const savedSelectedSeats = localStorage.getItem("selectedSeats");
    if (savedSelectedSeats && JSON.parse(savedSelectedSeats).length > 0) {
      const parsedSeats = JSON.parse(savedSelectedSeats);

      setMyReservedSeats(parsedSeats);

      if (selectedSeats.length === 0) {
        onSeatChange(parsedSeats);
      }
    }
  }, []);

  const isSeatOccupiedByOthers = (row, number) => {
    const isOccupied =
      Array.isArray(occupiedSeats) &&
      occupiedSeats.some((seat) => seat.row === row && seat.number === number);

    const isMyReserved = myReservedSeats.some(
      (seat) => seat.row === row && seat.number === number
    );

    return isOccupied && !isMyReserved;
  };

  const isSeatSelected = (row, number) => {
    return selectedSeats.some(
      (seat) => seat.row === row && seat.number === number
    );
  };

  const isSeatMyReserved = (row, number) => {
    return myReservedSeats.some(
      (seat) => seat.row === row && seat.number === number
    );
  };

  const handleSeatClick = (row, number) => {
    if (isSeatOccupiedByOthers(row, number)) return;

    let updatedSeats;
    if (isSeatSelected(row, number)) {
      updatedSeats = selectedSeats.filter(
        (seat) => !(seat.row === row && seat.number === number)
      );
    } else {
      if (selectedSeats.length >= total) return;
      updatedSeats = [...selectedSeats, { row, number }];
    }

    onSeatChange(updatedSeats);
    localStorage.setItem("selectedSeats", JSON.stringify(updatedSeats));
  };

  const generateSeats = () => {
    const seats = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      const rowLetter = alphabet[rowIndex];
      const rowSeats = [];

      for (let seatIndex = 1; seatIndex <= columns; seatIndex++) {
        const isOccupiedByOthers = isSeatOccupiedByOthers(rowLetter, seatIndex);
        const isMyReserved = isSeatMyReserved(rowLetter, seatIndex);
        const isSelected = isSeatSelected(rowLetter, seatIndex);

        if (seatIndex === 3 || seatIndex === 9) {
          rowSeats.push(
            <div
              key={`spacer-${rowLetter}-${seatIndex}`}
              className="seat-spacer"
            ></div>
          );
        }

        let seatClass;
        if (isOccupiedByOthers) {
          seatClass = "occupied";
        } else if (isSelected) {
          seatClass = "selected";
        } else {
          seatClass = "available";
        }

        rowSeats.push(
          <div
            key={`${rowLetter}-${seatIndex}`}
            className={`seat-container ${isOccupiedByOthers ? "no-hover" : ""}`}
            onClick={() =>
              !isOccupiedByOthers && handleSeatClick(rowLetter, seatIndex)
            }
          >
            <div className={`seat ${seatClass}`}>{seatIndex}</div>
          </div>
        );
      }

      seats.push(
        <div key={rowLetter} className="seat-row">
          <span className="row-label">{rowLetter}</span>
          <div className="seats-in-row">{rowSeats}</div>
        </div>
      );
    }

    return seats;
  };

  return (
    <div className="seating-layout">
      <div className="seating-area">
        <div className="screen">Ekran</div>
        <div className="seats">{generateSeats()}</div>
        <div className="selection-info">
          <p>
            Wybrano {selectedSeats.length} z {total} miejsc
          </p>
          <div className="seat-legend">
            <div className="legend-item">
              <div className="seat-example available"></div>
              <span>Dostępne</span>
            </div>
            <div className="legend-item">
              <div className="seat-example selected"></div>
              <span>Wybrane</span>
            </div>
            <div className="legend-item">
              <div className="seat-example occupied"></div>
              <span>Zajęte</span>
            </div>
          </div>
        </div>
      </div>
      <div className="right-side-container">
        <div className="image-container">
          <img
            src={kinoverse}
            alt="Kinoverse logo"
            style={{ width: "250px", height: "auto" }}
          />
        </div>
        <div className="selection-button-container">
          <button
            className={`continue-button ${
              selectedSeats.length === total ? "active" : "disabled"
            }`}
            disabled={selectedSeats.length !== total}
            onClick={onConfirm}
          >
            POTWIERDŹ WYBÓR MIEJSC
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeatsLayout;
