import React from "react";
import "./MainWhiteBox.css";

const MainWhiteBox = ({ title, children, height }) => (
  <div className="main-white-box" style={{ height: `${height}vh` }}>
    <p className="big-text">{title}</p>
    {children}
  </div>
);

export default MainWhiteBox;
