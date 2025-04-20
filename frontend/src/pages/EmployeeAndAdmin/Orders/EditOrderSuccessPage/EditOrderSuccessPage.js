import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DefaultHeader from "../../../../components/Headers/DeaultHeader";
import Confirmation from "../../../../components/Confirmation/Confirmation";
import "./EditOrderSuccessPage.css";
import "../../../../App.css";

function EditOrderSuccessPage() {
  const navigate = useNavigate();

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
  const isEmployee = auth?.role === "EMPLOYEE";
  const isAdmin = auth?.role === "ADMIN";

  const onConfirm = () => {
    if (isEmployee) {
      navigate("/employee/orders");
    } else if (isAdmin) {
      navigate("/admin/orders");
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <DefaultHeader />
      <Confirmation
        onConfirm={onConfirm}
        title1="SUKCES!"
        title2="UDAŁO SIĘ ZMODYFIKOWAĆ ZAMÓWIENIE!"
        color="#191C49"
        text="POWRÓT DO STRONY GŁÓWNEJ"
      />
    </div>
  );
}

export default EditOrderSuccessPage;
