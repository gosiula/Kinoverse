import React from "react";
import "./ShowingDetails.css";

const ShowingDetails = ({ showing, onClick }) => {
  return (
    <div className={"showing-details"}>
      <div className="showing-header">
        {showing?.photo && (
          <img
            src={`data:image/jpeg;base64,${showing.photo}`}
            alt={showing?.name}
            className="showing-image"
          />
        )}
        <div>
          <p className={"showing-title"}>{showing?.name}</p>
          <p className="showing-description">{showing?.description}</p>

          <div className="showing-times">
            {showing?.showings?.map((showingTime, index) => {
              const fullDateTime = new Date(`${showing.date}T${showingTime.hour}`);
              const isPast = fullDateTime < new Date();

              const isSoldOut =
                showingTime?.sold_out === true || showingTime?.empty_seats === 0;

              const isDisabled = isPast || isSoldOut;

              return (
                <button
                  key={index}
                  className={`showing-time-button ${
                    isDisabled ? "disabled-button" : ""
                  } ${isSoldOut ? "disabled-button" : ""}`}
                  onClick={(e) => {
                    if (isDisabled) return;
                    e.stopPropagation();
                    onClick(showingTime.id);
                  }}
                  disabled={isDisabled}
                  title={
                    isSoldOut
                      ? "Wyprzedane"
                      : showingTime?.empty_seats != null
                      ? `${showingTime.empty_seats} wolnych miejsc`
                      : ""
                  }
                >
                  <div
                    className={`showing-time-hour ${
                      isSoldOut ? "sold-out-hour" : ""
                    }`}
                  >
                    {showingTime.hour}
                  </div>
                  {isSoldOut && (
                    <div className="soldout-text">Wyprzedane</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowingDetails;
