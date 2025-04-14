import React from "react";
import { useNavigate } from "react-router-dom";
import Confirmation from "../../components/Confirmation/Confirmation";
import KinoverseLogo from "../../components/KinoverseLogo/KinoverseLogo";
import "./Login.css";

function ConfirmRegisterPage() {
  const navigate = useNavigate();

  const handleConfirmRegister = async () => {
    const email = localStorage.getItem("register-email");
    const password = localStorage.getItem("register-password");
    const confirmPassword = localStorage.getItem("register-password2");
    const name = localStorage.getItem("register-name");
    const surname = localStorage.getItem("register-surname");

    if (password !== confirmPassword) {
      alert("Hasła muszą być takie same.");
      return;
    }

    const userData = {
      email: email,
      password: password,
      confirm_password: confirmPassword,
      name: name,
      surname: surname,
    };

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("Odpowiedź z backendu:", data);

      if (response.ok) {
        navigate("/login/sign_up/success");

        localStorage.removeItem("register-email");
        localStorage.removeItem("register-password");
        localStorage.removeItem("register-password2");
        localStorage.removeItem("register-name");
        localStorage.removeItem("register-surname");
      } else {
        alert(data.error || "Błąd rejestracji. Spróbuj ponownie.");
      }
    } catch (error) {
      console.error("Błąd połączenia z serwerem:", error);
      alert("Błąd połączenia z serwerem.");
    }
  };

  const handleCancelRegister = () => {
    navigate("/login/sign_up");
  };

  return (
    <div className="app-background-gradient">
      <header>
        <KinoverseLogo />
        <Confirmation
          onConfirm={handleConfirmRegister}
          onCancel={handleCancelRegister}
          title1={`CZY NA PEWNO?`}
          title2={`CHCESZ UTWORZYĆ KONTO?`}
          color={"#ffffff"}
          text="UTWÓRZ KONTO"
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "40px",
          }}
        >
          <button className="login-button" onClick={handleCancelRegister}>
            POWRÓT
          </button>
        </div>
      </header>
    </div>
  );
}

export default ConfirmRegisterPage;
