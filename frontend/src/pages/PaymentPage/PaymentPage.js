import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DefaultHeader from "../../components/Headers/DeaultHeader";
import GoBackButton from "../../components/GoBackButton/GoBackButton";
import { BiHappyBeaming } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useReservationTimer, formatTime } from "../../utils/timerUtils";
import { formatDate3 } from "../../utils/formatDate3";
import "./PaymentPage.css";
import "../../App.css";

function PaymentPage() {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

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
  const storedEmail =
    localStorage.getItem("email") || (isUser ? auth?.mail : "") || "";

  const [email, setEmail] = useState(storedEmail);
  const [isEmailValid, setIsEmailValid] = useState(
    storedEmail?.includes("@") && storedEmail.length > 0
  );
  const showing_id = localStorage.getItem("showingId");
  const ticketQuantities = localStorage.getItem("ticketQuantities");
  const selectedSeats = localStorage.getItem("selectedSeats");
  const orderId = localStorage.getItem("orderId");
  const orderCreatedAt = localStorage.getItem("orderCreatedAt");

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
    const fetchOrderDetails = async () => {
      const response = await fetch(
        `http://localhost:5000/api/order_summary/${orderId}`
      );
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      } else {
        console.error("Nie udało się pobrać szczegółów zamówienia");
      }
      setLoading(false);
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(value.includes("@") && value.length > 0);
  };

  const handlePayment = async () => {
    localStorage.setItem("email", email);
    navigate("/home/confirm_payment");
  };

  console.log(orderDetails);

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <DefaultHeader />
      <GoBackButton
        path="/home/snacks"
        text="Finalizacja zamówienia"
        icon={BiHappyBeaming}
      />
      {loading ? (
        <div className="spinner">
          <AiOutlineLoading3Quarters className="loading-icon" />
        </div>
      ) : (
        <div className="order-summary-page">
          <div className="order-summary-container">
            <div className="order-summary-info">
              <h2>{orderDetails?.order?.film_name}</h2>
              <p>
                <strong>Kino:</strong> {orderDetails?.order?.cinema?.name}
              </p>
              <p>
                <strong>Adres kina:</strong>{" "}
                {orderDetails?.order?.cinema?.address}
              </p>
              <p>
                <strong>Sala:</strong>{" "}
                {orderDetails?.order?.screening_room_name}
              </p>
              <p>
                <strong>Data seansu:</strong>{" "}
                {orderDetails?.order?.showing_datetime &&
                  formatDate3(orderDetails.order.showing_datetime).split(
                    " "
                  )[0]}
              </p>
              <p>
                <strong>Godzina seansu:</strong>{" "}
                {orderDetails?.order?.showing_datetime &&
                  formatDate3(orderDetails.order.showing_datetime).split(
                    " "
                  )[1]}
              </p>
              <p>
                <strong>Język seansu:</strong> {orderDetails?.order?.language}
              </p>
            </div>

            <div className="order-summary-extras">
              {orderDetails?.tickets?.length > 0 && (
                <div className="tickets-and-snacks-info">
                  <strong>Bilety:</strong>
                  <ul>
                    {(() => {
                      const ticketCounts = {};

                      orderDetails.tickets.forEach((ticket) => {
                        if (!ticketCounts[ticket.type]) {
                          ticketCounts[ticket.type] = 0;
                        }
                        ticketCounts[ticket.type]++;
                      });

                      const translatedTypes = {
                        normal: "Normalny",
                        reduced: "Ulgowy",
                        senior: "Senior",
                      };

                      return Object.entries(ticketCounts).map(
                        ([type, count], index) => (
                          <li key={index}>
                            {translatedTypes[type] || type} – {count} szt.
                          </li>
                        )
                      );
                    })()}
                  </ul>
                </div>
              )}

              {localStorage.getItem("snackQuantities") &&
              orderDetails?.snacks?.length > 0 ? (
                <div className="tickets-and-snacks-info">
                  <strong>Przekąski:</strong>
                  <ul>
                    {(() => {
                      const storedSnacks = JSON.parse(
                        localStorage.getItem("snackQuantities") || "{}"
                      );
                      const snackList = orderDetails.snacks.filter(
                        (snack) => storedSnacks[snack.name]
                      );
                      return snackList.length > 0 ? (
                        snackList.map((snack, index) => (
                          <li key={index}>
                            {snack.name} – {storedSnacks[snack.name]} szt.
                          </li>
                        ))
                      ) : (
                        <li>Brak przekąsek w zamówieniu</li>
                      );
                    })()}
                  </ul>
                </div>
              ) : (
                <div className="tickets-and-snacks-info">
                  <strong>Przekąski:</strong>
                  <p>Brak przekąsek w zamówieniu.</p>
                </div>
              )}

              <p>
                Kwota do zapłaty:{" "}
                {(() => {
                  if (!orderDetails) return "Ładowanie...";

                  const storedSnacks = JSON.parse(
                    localStorage.getItem("snackQuantities") || "{}"
                  );
                  const snackPrices = orderDetails.snacks || [];

                  const hasLocalSnacks = Object.keys(storedSnacks).length > 0;

                  if (!hasLocalSnacks) {
                    return `${orderDetails.summary?.order_total || 0} zł`;
                  }

                  let snackTotal = 0;
                  for (const [name, quantity] of Object.entries(storedSnacks)) {
                    const snack = snackPrices.find((s) => s.name === name);
                    if (snack) {
                      snackTotal += snack.price * quantity;
                    }
                  }

                  const ticketTotal = orderDetails.summary?.tickets_total || 0;
                  const fullTotal = ticketTotal + snackTotal;

                  return `${fullTotal} zł`;
                })()}
              </p>
            </div>
          </div>
          <div className="email-pay-container">
            <div className="payment-timer-container">
              Pozostały czas rezerwacji:{" "}
              <span className="payment-timer">{formattedTime}</span>
            </div>
            <label htmlFor="email" className="email-label">
              <strong>Adres e-mail:</strong>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Wpisz swój e-mail"
              className="email-input"
              value={email}
              onChange={handleEmailChange}
            />

            <button
              className={`pay-button ${isEmailValid ? "" : "disabled"}`}
              disabled={!isEmailValid}
              onClick={handlePayment}
            >
              ZAPŁAĆ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentPage;
