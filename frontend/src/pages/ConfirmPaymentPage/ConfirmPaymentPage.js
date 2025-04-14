import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DefaultHeader from "../../components/Headers/DeaultHeader";
import GoBackButton from "../../components/GoBackButton/GoBackButton";
import { FaRegCheckCircle } from "react-icons/fa";
import Confirmation from "../../components/Confirmation/Confirmation";
import "./ConfirmPaymentPage.css";
import "../../App.css";

function ConfirmPaymentPage() {
  const navigate = useNavigate();
  const orderId = localStorage.getItem("orderId");
  const email = localStorage.getItem("email");
  const [orderDetails, setOrderDetails] = useState(null);
  const showing_id = localStorage.getItem("showingId");
  const ticketQuantities = localStorage.getItem("ticketQuantities");
  const selectedSeats = localStorage.getItem("selectedSeats");
  const orderCreatedAt = localStorage.getItem("orderCreatedAt");
  const type = localStorage.getItem("showingType");

  useEffect(() => {
    if (
      (type == "school" && !showing_id) ||
      (type == "normal" &&
        (!ticketQuantities ||
          !selectedSeats ||
          !orderId ||
          !orderCreatedAt ||
          !email))
    ) {
      navigate("/error");
    }
  }, [orderId, navigate]);

  const handlePayment = async () => {
    const snackQuantities = JSON.parse(
      localStorage.getItem("snackQuantities") || "{}"
    );

    const orderId = localStorage.getItem("orderId") || null;

    if (!orderId && type == "normal") {
      alert("Brak ID zamówienia!");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/finalize_order_with_snacks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderId,
            showingId: showing_id,
            mail: email,
            snack_quantities: snackQuantities,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem("showingId");
        localStorage.removeItem("ticketQuantities");
        localStorage.removeItem("capacity");
        localStorage.removeItem("selectedSeats");
        localStorage.removeItem("orderId");
        localStorage.removeItem("snackQuantities");
        localStorage.removeItem("email");
        localStorage.removeItem("orderCreatedAt");
        localStorage.removeItem("showingType");
        if (type == "schools") {
          navigate("/schools/success");
        } else {
          navigate("/home/success");
        }
      } else {
        console.error("Błąd:", data.error);
        alert("Wystąpił błąd podczas finalizacji zamówienia.");
      }
    } catch (error) {
      console.error("Błąd połączenia:", error);
      alert("Nie udało się połączyć z serwerem.");
    }
  };

  console.log(orderDetails);
  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <DefaultHeader />
      <GoBackButton
        path={type == "schools" ? "/schools/payment" : "/home/payment"}
        text="Potwierdzenie zamówienia"
        icon={FaRegCheckCircle}
      />
      <Confirmation
        onConfirm={handlePayment}
        title1="JESTEŚ PEWIEN, ŻE CHCESZ"
        title2="ZREALIZOWAĆ ZAMÓWIENIE?"
        color="#191C49"
        text="POTWIERDŹ"
      />
    </div>
  );
}

export default ConfirmPaymentPage;
