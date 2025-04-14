import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainWhiteBox from "../../components/MainWhiteBox/MainWhiteBox";
import KinoverseLogo from "../../components/KinoverseLogo/KinoverseLogo";
import "./Login.css";

function RegisterNamePage() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedName = localStorage.getItem("register-name");
    if (savedName) {
      setName(savedName);
    }
    const savedSurname = localStorage.getItem("register-surname");
    if (savedSurname) {
      setSurname(savedSurname);
    }
  }, []);

  const handleRegister = async () => {
    if (!name || !surname) {
      setError("Imię i nazwisko nie mogą być puste.");
      return;
    }

    localStorage.setItem("register-name", name);
    localStorage.setItem("register-surname", surname);

    navigate("/login/sign_up/confirm");
  };

  return (
    <div className="app-background-gradient">
      <header>
        <MainWhiteBox title={`UTWÓRZ NOWE KONTO`} height={68}>
          <div className="login-form">
            <label htmlFor="name" className="form-label">
              IMIĘ
            </label>
            <input
              type="text"
              id="name"
              className="input-field"
              placeholder="Wpisz imię"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="surname" className="form-label">
              NAZWISKO
            </label>
            <input
              type="text"
              id="surname"
              className="input-field"
              placeholder="Wpisz nazwisko"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
          </div>
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
          <button className="login-button" onClick={handleRegister}>
            UTWÓRZ KONTO
          </button>
        </MainWhiteBox>
        <KinoverseLogo />
      </header>
    </div>
  );
}

export default RegisterNamePage;
