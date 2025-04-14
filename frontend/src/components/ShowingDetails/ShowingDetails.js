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
              const fullDateTime = new Date(
                `${showing.date}T${showingTime.hour}`
              );
              const isPast = fullDateTime < new Date();

              return (
                <button
                  key={index}
                  className={`showing-time-button ${
                    isPast ? "disabled-button" : ""
                  }`}
                  onClick={(e) => {
                    if (isPast) return;
                    e.stopPropagation();
                    onClick(showingTime.id);
                  }}
                  disabled={isPast}
                >
                  {showingTime.hour}
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
