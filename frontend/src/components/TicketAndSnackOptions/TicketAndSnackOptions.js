import React from "react";
import "./TicketAndSnackOptions.css";

function TicketAndSnackSelector({
  items = [],
  quantities = {},
  setQuantities,
  onConfirm,
  buttonText = "Potwierdź wybór",
  maxTotal = Infinity,
  button = true, // domyślnie brak limitu
}) {
  const total = Object.values(quantities).reduce((acc, val) => acc + val, 0);
  const isValid = total > 0 && total <= maxTotal;

  const updateQuantity = (name, change) => {
    setQuantities((prev) => {
      const currentTotal = Object.values(prev).reduce(
        (acc, val) => acc + val,
        0
      );
      const currentValue = prev[name] || 0;
      const newVal = currentValue + change;

      if (newVal < 0) return prev;
      if (change > 0 && currentTotal >= maxTotal) return prev;

      return { ...prev, [name]: newVal };
    });
  };

  return (
    <div className="ticket-options">
      {items.map((item) => (
        <div key={item.id} className="ticket-and-price">
          <div className="ticket-option">
            <span>{item.name}</span>
            <button onClick={() => updateQuantity(item.name, -1)}>-</button>
            <span>{quantities[item.name] || 0}</span>
            <button onClick={() => updateQuantity(item.name, 1)}>+</button>
          </div>
          <span className="price">{item.price} zł</span>
        </div>
      ))}

      {button && (
        <button
          className="choose-seats-btn"
          onClick={onConfirm}
          disabled={!isValid}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

export default TicketAndSnackSelector;
