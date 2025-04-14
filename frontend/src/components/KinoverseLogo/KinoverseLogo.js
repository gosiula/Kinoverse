import React from "react";
import { GiFilmProjector } from "react-icons/gi";
import "./KinoverseLogo.css";

const KinoverseLogo = () => {
  return (
    <div className="login-logo-container">
      <div className="login-kinoverse-logo">
        <span className="login-kinoverse-kino">Kino</span>
        <span className="login-kinoverse-verse">verse</span>
        <GiFilmProjector className="login-kinoverse-icon" />
      </div>
    </div>
  );
};

export default KinoverseLogo;
