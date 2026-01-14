import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DefaultHeader from "../../../../components/Headers/DeaultHeader";
import GoBackButton from "../../../../components/GoBackButton/GoBackButton";
import { MdPublishedWithChanges } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import TicketAndSnackOptions from "../../../../components/TicketAndSnackOptions/TicketAndSnackOptions";
import "./EditOrderPage.css";
import "../../../../App.css";

function EditOrderPage() {
  const navigate = useNavigate();
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [loadingShowing, setLoadingShowing] = useState(true);
  const [loadingSnacks, setLoadingSnacks] = useState(true);

  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showingDetails, setShowingDetails] = useState(null);

  const [ticketQuantities, setTicketQuantities] = useState({});
  const [snackQuantities, setSnackQuantities] = useState({});

  const [snacks, setSnacks] = useState({ jedzenie: [], picie: [] });
  const [orderedSnacks, setOrderedSnacks] = useState([]);

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
  const orderId = localStorage.getItem("orderToEdit");

  useEffect(() => {
    const noAuthOrUser = !auth || auth?.role === "USER";

    if (!orderId || noAuthOrUser) {
      navigate("/error", { replace: true });
      return;
    }
  }, [orderId, auth, navigate]);

  const mapSeatsToStorageFormat = (seats) => {
    return seats.map((seat) => ({
      row: seat.seat.row,
      number: seat.seat.number,
    }));
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || (!isEmployee && !isAdmin)) {
        navigate("/error");
        return;
      }

      setLoadingOrder(true);
      try {
        const cachedEmail = localStorage.getItem("editMail");
        const cachedIsPaid = localStorage.getItem("editIsPaid");
        const cachedTickets = localStorage.getItem("editTickets");
        const cachedSnacks = localStorage.getItem("editSnacks");

        const response = await fetch(
          `http://localhost:5000/api/order_summary/${orderId}`
        );
        if (!response.ok) throw new Error("Nie udało się pobrać zamówienia");

        const data = await response.json();
        setOrderDetails(data);

        const seats = mapSeatsToStorageFormat(data.tickets);
        localStorage.setItem("editSeats", JSON.stringify(seats));
        localStorage.setItem("selectedSeats", JSON.stringify(seats));

        if (cachedEmail) {
          setEmail(cachedEmail);
          setIsEmailValid(cachedEmail.includes("@") && cachedEmail.length > 0);
        } else {
          setEmail(data?.order?.mail || "");
          setIsEmailValid((data?.order?.mail || "").includes("@"));
        }

        if (cachedIsPaid !== null) {
          setIsPaid(cachedIsPaid === "true");
        } else {
          setIsPaid(!!data?.order?.payed);
        }

        setOrderedSnacks(data.ordered_snacks || []);

        let ticketQ = {};
        if (cachedTickets) {
          try {
            ticketQ = JSON.parse(cachedTickets);
            if (!ticketQ || typeof ticketQ !== "object") {
              ticketQ = {};
            }
          } catch (e) {
            console.error("Error parsing cached tickets:", e);
            ticketQ = {};
          }
        } else {
          data.tickets?.forEach((ticket) => {
            if (ticket.type) {
              const typeName = mapTicketTypeToName(ticket.type);
              ticketQ[typeName] = (ticketQ[typeName] || 0) + 1;
            }
          });
          localStorage.setItem("editTickets", JSON.stringify(ticketQ));
        }
        setTicketQuantities(ticketQ);
        console.log("ADJKJFKDJKFJLK");
        console.log(ticketQ);

        let snackQ = {};
        if (cachedSnacks) {
          try {
            snackQ = JSON.parse(cachedSnacks);
            if (!snackQ || typeof snackQ !== "object") {
              snackQ = {};
            }
          } catch (e) {
            console.error("Error parsing cached snacks:", e);
            snackQ = {};
          }
        } else {
          data.ordered_snacks?.forEach((snack) => {
            snackQ[snack.name] = snack.quantity || 1;
          });
          localStorage.setItem("editSnacks", JSON.stringify(snackQ));
        }
        setSnackQuantities(snackQ);

        const showingId = data?.order?.showing_id;
        localStorage.setItem("editShowingId", showingId);
        localStorage.setItem("editCapacity", data?.order?.capacity);
        if (showingId) {
          fetchShowingDetails(showingId);
        } else {
          throw new Error("Brak showing_id w zamówieniu.");
        }
      } catch (err) {
        console.error("Błąd przy pobieraniu zamówienia:", err);
        navigate("/error");
      } finally {
        setLoadingOrder(false);
      }
    };

    const fetchShowingDetails = async (showingId) => {
      setLoadingShowing(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/showing_details/${showingId}`
        );
        if (!response.ok)
          throw new Error("Nie udało się pobrać szczegółów seansu");
        const data = await response.json();
        setShowingDetails(data);
      } catch (err) {
        console.error("Błąd przy pobieraniu seansu:", err);
      } finally {
        setLoadingShowing(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    if (Object.keys(ticketQuantities).length > 0) {
      localStorage.setItem("editTickets", JSON.stringify(ticketQuantities));
    }
  }, [ticketQuantities]);

  useEffect(() => {
    if (Object.keys(snackQuantities).length > 0) {
      localStorage.setItem("editSnacks", JSON.stringify(snackQuantities));
    }
  }, [snackQuantities]);

  useEffect(() => {
    const fetchSnacks = async () => {
      setLoadingSnacks(true);
      try {
        const response = await fetch("http://localhost:5000/api/snacks");
        if (!response.ok) throw new Error("Błąd przy pobieraniu przekąsek");

        const data = await response.json();
        setSnacks(data);

        if (orderedSnacks.length > 0 && (!data.jedzenie || !data.picie)) {
          console.log("Using ordered snacks as available snacks");
          const organizedSnacks = { jedzenie: [], picie: [] };
          orderedSnacks.forEach((snack) => {
            if (snack.type === "jedzenie") {
              organizedSnacks.jedzenie.push(snack);
            } else if (snack.type === "picie") {
              organizedSnacks.picie.push(snack);
            }
          });
          setSnacks(organizedSnacks);
        }
      } catch (err) {
        console.error("Error fetching snacks:", err.message);
        if (orderedSnacks.length > 0) {
          console.log("Using ordered snacks as available snacks after error");
          const organizedSnacks = { jedzenie: [], picie: [] };
          orderedSnacks.forEach((snack) => {
            if (snack.type === "jedzenie") {
              organizedSnacks.jedzenie.push(snack);
            } else if (snack.type === "picie") {
              organizedSnacks.picie.push(snack);
            }
          });
          setSnacks(organizedSnacks);
        }
      } finally {
        setLoadingSnacks(false);
      }
    };

    fetchSnacks();
  }, [orderedSnacks]);

  const mapTicketTypeToName = (type) => {
    const mapping = {
      normal: "Normalny",
      reduced: "Ulgowy",
      senior: "Senior",
    };
    return mapping[type] || type;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(value.includes("@") && value.length > 0);
    localStorage.setItem("editMail", value);
  };

  const handlePaidChange = (e) => {
    const value = e.target.checked;
    setIsPaid(value);
    localStorage.setItem("editIsPaid", value.toString());
  };

  const handleTicketQuantitiesChange = (newQuantities) => {
    setTicketQuantities(newQuantities);
    console.log(newQuantities);
  };

  const handleSnackQuantitiesChange = (newQuantities) => {
    setSnackQuantities(newQuantities);
  };

  const ticketTypes = [
    {
      id: 1,
      name: "Normalny",
      price: parseFloat(showingDetails?.prices?.normal ?? 0),
    },
    {
      id: 2,
      name: "Ulgowy",
      price: parseFloat(showingDetails?.prices?.reduced ?? 0),
    },
    {
      id: 3,
      name: "Senior",
      price: parseFloat(showingDetails?.prices?.senior ?? 0),
    },
  ];

  const maxTickets = showingDetails?.empty_seats ?? 0;

  const allSnacks = [...(snacks.jedzenie || []), ...(snacks.picie || [])];

  const handleSaveOrder = () => {
    // Pobierz liczbę wybranych miejsc z localStorage
    const selectedSeats =
      JSON.parse(localStorage.getItem("selectedSeats")) || [];
    const maxTickets = selectedSeats.length; // Liczba wybranych miejsc

    // Oblicz łączną liczbę zamówionych biletów
    const totalTickets = Object.values(ticketQuantities).reduce(
      (sum, quantity) => sum + quantity,
      0
    );

    // Sprawdź, czy liczba zamówionych biletów nie przekracza liczby wybranych miejsc
    if (totalTickets > maxTickets) {
      alert("Liczba zamówionych biletów przekracza liczbę wybranych miejsc.");
      return; // Zablokuj zapis zamówienia
    }

    console.log("Zapisano!");
    console.log("Email:", email);
    console.log("Opłacone:", isPaid);
    console.log("Bilety:", ticketQuantities);
    console.log("Przekąski:", snackQuantities);

    const savedTickets = JSON.parse(localStorage.getItem("editTickets"));
    const savedSeats = JSON.parse(localStorage.getItem("editSeats"));
    const savedEmail = localStorage.getItem("editMail") || email;
    const savedSnackQuantities = JSON.parse(localStorage.getItem("editSnacks"));
    const savedTicketQuantities = JSON.parse(
      localStorage.getItem("editTickets")
    );

    const orderId = localStorage.getItem("orderToEdit");
    const showing_id = localStorage.getItem("editShowingId");

    finalizeOrderWithSnacks({
      orderId: orderId,
      showingId: showing_id,
      mail: savedEmail,
      snackQuantities: savedSnackQuantities,
      ticketQuantities: savedTicketQuantities,
    });
  };

  const finalizeOrderWithSnacks = async (orderData) => {
    try {
      const token = JSON.parse(localStorage.getItem("authData"))?.token;
      if (!token) {
        return;
      }

      const mappedTicketQuantities = {};
      if (orderData.ticketQuantities["Normalny"])
        mappedTicketQuantities["normal"] =
          orderData.ticketQuantities["Normalny"];
      if (orderData.ticketQuantities["Ulgowy"])
        mappedTicketQuantities["reduced"] =
          orderData.ticketQuantities["Ulgowy"];
      if (orderData.ticketQuantities["Senior"])
        mappedTicketQuantities["senior"] = orderData.ticketQuantities["Senior"];

      const filteredSnacks = {};
      for (const [snack, quantity] of Object.entries(
        orderData.snackQuantities || {}
      )) {
        if (quantity > 0) {
          filteredSnacks[snack] = quantity;
        }
      }

      const response = await fetch(
        "http://localhost:5000/api/employee_admin_modify_order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: orderData.orderId,
            showingId: orderData.showingId,
            mail: orderData.mail,
            snack_quantities: filteredSnacks,
            ticket_quantities: mappedTicketQuantities,
          }),
        }
      );

      const result = await response.json();
      console.log("Wynik:", result);

      if (response.ok) {
        localStorage.removeItem("editShowingId");
        localStorage.removeItem("editCapacity");
        localStorage.removeItem("editMail");
        localStorage.removeItem("editIsPaid");
        localStorage.removeItem("editTickets");
        localStorage.removeItem("editSeats");
        localStorage.removeItem("editSnacks");
        if (isEmployee) {
          navigate("/employee/orders/edit/success");
        } else if (isAdmin) {
          navigate("/admin/orders/edit/success");
        }
      } else {
        alert("Błąd: " + result.error);
      }
    } catch (error) {
      console.error("Błąd:", error);
      alert("Błąd: " + error);
    }
  };

  console.log(orderDetails);

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <DefaultHeader />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem",
        }}
      >
        <GoBackButton
          path={
            isEmployee
              ? "/employee/orders"
              : isAdmin
              ? "/admin/orders"
              : "/home"
          }
          text="Modyfikacja zamówienia"
          icon={MdPublishedWithChanges}
          clearLocalKeys={[
            "editMail",
            "editIsPaid",
            "editTickets",
            "editSnacks",
            "editSeats",
            "selectedSeats",
            "editShowingId",
            "editCapacity",
          ]}
        />
        <button className="save-order-button" onClick={handleSaveOrder}>
          ZAPISZ
        </button>
      </div>
      {loadingOrder || loadingShowing || loadingSnacks ? (
        <div className="spinner">
          <AiOutlineLoading3Quarters className="loading-icon" />
        </div>
      ) : (
        <div className="edit-order-content">
          <div className="order-form-container">
            <div className="left-column">
              <div className="email-section">
                <label htmlFor="email" className="edit-email-label">
                  <strong>Adres e-mail:</strong>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Wpisz e-mail"
                  className="edit-email-input"
                  value={email}
                  onChange={handleEmailChange}
                />
              </div>

              <div className="edit-paid-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={handlePaidChange}
                  />
                  Zamówienie opłacone
                </label>
              </div>

              {showingDetails && orderDetails?.order?.type === "normal" && (
                <div className="ticket-options-container">
                  <h3>Bilety</h3>
                  <TicketAndSnackOptions
                    items={ticketTypes}
                    quantities={ticketQuantities}
                    setQuantities={handleTicketQuantitiesChange}
                    onConfirm={() => {
                      if (isEmployee) {
                        navigate("/employee/orders/edit_seats");
                      } else if (isAdmin) {
                        navigate("/admin/orders/edit_seats");
                      }
                    }}
                    buttonText="ZMIEŃ WYBÓR MIEJSC"
                    maxTotal={maxTickets}
                  />
                </div>
              )}
            </div>

            <div className="right-column">
              <h3>Przekąski</h3>
              {allSnacks.length > 0 ? (
                <TicketAndSnackOptions
                  items={allSnacks}
                  quantities={snackQuantities}
                  setQuantities={handleSnackQuantitiesChange}
                  button={false}
                  maxTotal={50}
                />
              ) : (
                <p>Brak dostępnych przekąsek</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditOrderPage;
