import React from "react";
import { useNavigate } from "react-router-dom";
import DefaultHeader from "../../components/Headers/DeaultHeader";
import Confirmation from "../../components/Confirmation/Confirmation";
import "./LogoutPage.css";
import "../../App.css";

function LogoutPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authData");
    navigate("/home");
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <DefaultHeader />
      <div className="logout-confirmation-wrapper">
        <Confirmation
          onConfirm={handleLogout}
          title1="CZY NA PEWNO"
          title2="CHCESZ SIĘ WYLOGOWAĆ?"
          color="#0F1027"
          text="WYLOGUJ SIĘ"
        />
      </div>
    </div>
  );
}

export default LogoutPage;
