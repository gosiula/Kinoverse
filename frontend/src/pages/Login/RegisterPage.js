import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainWhiteBox from "../../components/MainWhiteBox/MainWhiteBox";
import KinoverseLogo from "../../components/KinoverseLogo/KinoverseLogo";
import "./Login.css";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("register-email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleRegister = async () => {
    if (!email || !password || !password2) {
      setError("E-mail i hasło nie mogą być puste.");
      return;
    }

    if (!password || !password2) {
      setError("Hasła nie są takie same.");
      return;
    }

    if (!email.includes("@")) {
      setError("Niepoprawny e-mail.");
      return;
    }

    localStorage.setItem("register-email", email);
    localStorage.setItem("register-password", password);
    localStorage.setItem("register-password2", password2);

    navigate("/login/sign_up/name_surname");
  };

  return (
    <div className="app-background-gradient">
      <header>
        <MainWhiteBox title={`UTWÓRZ NOWE KONTO`} height={68}>
          <div className="login-form">
            <label htmlFor="email" className="form-label">
              E-MAIL
            </label>
            <input
              type="text"
              id="email"
              className="input-field"
              placeholder="Wpisz adres e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="password" className="form-label">
              HASŁO
            </label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Wpisz hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="password" className="form-label">
              POWTÓRZ HASŁO
            </label>
            <input
              type="password"
              id="password2"
              className="input-field"
              placeholder="Powtórz hasło"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </div>
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
          <button className="login-button" onClick={handleRegister}>
            PRZEJDŹ DALEJ
          </button>
        </MainWhiteBox>
        <KinoverseLogo />
      </header>
    </div>
  );
}

export default RegisterPage;
