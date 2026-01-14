import React from "react";
import { useNavigate } from "react-router-dom";
import DefaultHeader from "../../../../components/Headers/DeaultHeader";
import Confirmation from "../../../../components/Confirmation/Confirmation";
import "./DeleteOrderPage.css";
import "../../../../App.css";

function DeleteOrderSuccessPage() {
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
      <div className="logout-confirmation-wrapper">
        <Confirmation
          onConfirm={onConfirm}
          title1="SUKCES!"
          title2="ZAMÓWIENIE ZOSTAŁO USUNIĘTE!"
          color="#0F1027"
          text="POWRÓT DO STRONY GŁÓWNEJ"
        />
      </div>
    </div>
  );
}

export default DeleteOrderSuccessPage;
