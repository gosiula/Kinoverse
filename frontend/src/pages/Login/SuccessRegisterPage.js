import React from "react";
import Confirmation from "../../components/Confirmation/Confirmation";
import KinoverseLogo from "../../components/KinoverseLogo/KinoverseLogo";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function SuccessRegisterPage() {
  const navigate = useNavigate();
  const handleConfirmRegister = async () => {
    navigate("/login");
    localStorage.removeItem("register-email");
    localStorage.removeItem("register-password");
    localStorage.removeItem("register-password2");
    localStorage.removeItem("register-name");
    localStorage.removeItem("register-surname");
  };

  const handleCancelRegister = async () => {
    navigate("/login/sign_up");
  };

  return (
    <div className="app-background-gradient">
      <header>
        <KinoverseLogo />
        <Confirmation
          onConfirm={handleConfirmRegister}
          onCancel={handleCancelRegister}
          title1={`SUKCES!`}
          title2={`UDAŁO SIĘ UTWORZYĆ KONTO!`}
          color={"#ffffff"}
          text="PRZEJDŹ DO STRONY LOGOWANIA"
        />
      </header>
    </div>
  );
}

export default SuccessRegisterPage;
