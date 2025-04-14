import React from "react";
import { useNavigate } from "react-router-dom";
import MainWhiteBox from "../../components/MainWhiteBox/MainWhiteBox";
import KinoverseLogo from "../../components/KinoverseLogo/KinoverseLogo";
import "./Login.css";

function MainLoginPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login/sign_in");
  };

  const handleRegisterClick = () => {
    navigate("/login/sign_up");
  };

  return (
    <div className="app-background-gradient">
      <header>
        <MainWhiteBox
          title={
            <>
              ZALOGUJ SIĘ LUB
              <br />
              UTWÓRZ NOWE KONTO
            </>
          }
          height={55}
        >
          <div
            className="login-buttons-container"
            style={{ marginTop: "50px" }}
          >
            <button className="login-button" onClick={handleLoginClick}>
              ZALOGUJ SIĘ
            </button>
            <button className="login-button" onClick={handleRegisterClick}>
              ZAREJESTRUJ SIĘ
            </button>
          </div>
        </MainWhiteBox>
        <KinoverseLogo />
      </header>
    </div>
  );
}

export default MainLoginPage;
