import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DefaultHeader from "../../components/Headers/DeaultHeader";
import Confirmation from "../../components/Confirmation/Confirmation";
import "./SuccessPaymentPage.css";
import "../../App.css";

function SuccessPaymentPage() {
  const navigate = useNavigate();

  const handlePayment = async () => {
    navigate("/home");
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <DefaultHeader />
      <Confirmation
        onConfirm={handlePayment}
        title1="SUKCES!"
        title2="UDAŁO SIĘ DOKONAĆ REZERWACJI!"
        color="#191C49"
        text="POWRÓT DO STRONY GŁÓWNEJ"
      />
    </div>
  );
}

export default SuccessPaymentPage;
