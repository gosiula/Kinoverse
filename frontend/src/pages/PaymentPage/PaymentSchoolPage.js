import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DefaultHeader from "../../components/Headers/DeaultHeader";
import GoBackButton from "../../components/GoBackButton/GoBackButton";
import { BiHappyBeaming } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { formatDate3 } from "../../utils/formatDate3";
import "./PaymentPage.css";
import "../../App.css";

function PaymentSchoolPage() {
  const navigate = useNavigate();
  const [showingDetails, setShowingDetails] = useState(null);
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
  const isEmployee = auth?.role === "EMPLOYEE";
  const isAdmin = auth?.role === "ADMIN";

  const storedEmail =
    localStorage.getItem("email") || (isUser ? auth?.mail : "") || "";

  const [email, setEmail] = useState(storedEmail);
  const [isEmailValid, setIsEmailValid] = useState(
    isAdmin ||
      isEmployee ||
      (storedEmail?.includes("@") && storedEmail.length > 0)
  );

  const showing_id = localStorage.getItem("showingId");
  const type = localStorage.getItem("showingType");

  useEffect(() => {
    if (!showing_id || !type) {
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

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(value.includes("@") && value.length > 0);
  };

  const handlePayment = async () => {
    localStorage.setItem("email", email);
    navigate("/schools/confirm_payment");
  };

  console.log(showingDetails);
  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <DefaultHeader />
      <GoBackButton
        path="/schools/snacks"
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
              <p>
                <strong>Wielkość sali:</strong> {showingDetails?.capacity}
              </p>
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
                <strong>Język seansu:</strong>{" "}
                {showingDetails?.showing_language}
              </p>
            </div>

            <div className="order-summary-extras">
              {showingDetails?.capacity && (
                <div className="tickets-and-snacks-info">
                  <strong>Bilety:</strong>
                  <ul>
                    <li>
                      cała sala kinowa - {showingDetails?.capacity} miejsc
                    </li>
                  </ul>
                </div>
              )}

              {localStorage.getItem("snackQuantities") &&
              showingDetails?.snacks?.length > 0 ? (
                <div className="tickets-and-snacks-info">
                  <strong>Przekąski:</strong>
                  <ul>
                    {(() => {
                      const storedSnacks = JSON.parse(
                        localStorage.getItem("snackQuantities") || "{}"
                      );
                      const snackList = showingDetails.snacks.filter(
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
                  if (!showingDetails) return "Ładowanie...";

                  const storedSnacks = JSON.parse(
                    localStorage.getItem("snackQuantities") || "{}"
                  );
                  const snackPrices = showingDetails.snacks || [];

                  const hasLocalSnacks = Object.keys(storedSnacks).length > 0;

                  if (!hasLocalSnacks) {
                    return `${showingDetails?.price || 0} zł`;
                  }

                  let snackTotal = 0;
                  for (const [name, quantity] of Object.entries(storedSnacks)) {
                    const snack = snackPrices.find((s) => s.name === name);
                    if (snack) {
                      snackTotal += snack.price * quantity;
                    }
                  }

                  const ticketTotal = Number(showingDetails?.price) || 0;
                  const fullTotal = ticketTotal + snackTotal;

                  return `${fullTotal} zł`;
                })()}
              </p>
            </div>
          </div>
          <div className="email-pay-container">
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

export default PaymentSchoolPage;
