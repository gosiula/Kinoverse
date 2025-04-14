import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainWhiteBox from "../../components/MainWhiteBox/MainWhiteBox";
import KinoverseLogo from "../../components/KinoverseLogo/KinoverseLogo";
import "./Login.css";

function LoginPage() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const auth = JSON.parse(localStorage.getItem("authData"));

        if (auth?.token) {
          const tokenParts = auth.token.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1])); // dekodowanie payloadu JWT
            const currentTime = Math.floor(Date.now() / 1000); // czas w sekundach
            console.log(payload);
            console.log(currentTime);

            if (payload.exp < currentTime) {
              // Token wygasł
              localStorage.removeItem("authData");
              return;
            }
          } else {
            // Token niepoprawny
            localStorage.removeItem("authData");
            return;
          }
        }

        if (auth?.role) {
          if (auth.role === "ADMIN") {
            navigate("/home");
          } else if (auth.role === "EMPLOYEE") {
            navigate("/home");
          } else if (auth.role === "USER") {
            navigate("/home");
          }
        }
      } catch (error) {
        console.error("Error during auth check", error);
        localStorage.removeItem("authData"); // Na wszelki wypadek
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      console.log(mail);
      if (!mail || !password) {
        setError("E-mail and password cannot be empty.");
        return;
      }
      console.log(password);

      if (!mail.includes("@")) {
        setError("Invalid e-mail.");
        return;
      }

      const body = {
        email: mail,
        password: password,
      };

      console.log(body);

      const resp = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log(resp);

      if (!resp.ok) {
        setError("Incorrect e-mail or password.");
        return;
      }

      localStorage.removeItem("authData");
      const json = await resp.json();
      localStorage.setItem("authData", JSON.stringify(json));

      const authData = JSON.parse(localStorage.getItem("authData"));
      if (authData && authData.role) {
        if (authData.role === "ADMIN") {
          navigate("/home");
        } else if (authData.role === "EMPLOYEE") {
          navigate("/home");
        } else if (authData.role === "USER") {
          navigate("/home");
        } else {
          setError("Incorrect data.");
        }
      } else {
        setError("Incorrect data.");
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      setError("An error occurred during sign-in.");
    }
  };

  return (
    <div className="app-background-gradient">
      <header>
        <MainWhiteBox title={`ZALOGUJ SIĘ DO APLIKACJI`} height={55}>
          <div className="login-form">
            <label htmlFor="mail" className="form-label">
              E-MAIL
            </label>
            <input
              type="text"
              id="mail"
              className="input-field"
              placeholder="Wpisz adres e-mail"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
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
          </div>
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
          <button className="login-button" onClick={handleLogin}>
            ZALOGUJ SIĘ
          </button>
        </MainWhiteBox>
        <KinoverseLogo />
      </header>
    </div>
  );
}

export default LoginPage;
