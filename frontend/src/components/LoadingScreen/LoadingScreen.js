import React from "react";
import { GiFilmProjector } from "react-icons/gi";
import kinoverse from "../../images/kinoverse.png";
import "./LoadingScreen.css";

function LoadingScreen() {
  return (
    <div className="app-background-gradient">
      <div>
        <div className="big-kinoverse-logo">
          <span className="big-kinoverse-kino">Kino</span>
          <span className="big-kinoverse-verse">verse</span>
          <GiFilmProjector className="big-kinoverse-icon" />
        </div>
        <img src={kinoverse} style={{ width: "350px", height: "auto" }} />
      </div>
    </div>
  );
}

export default LoadingScreen;
