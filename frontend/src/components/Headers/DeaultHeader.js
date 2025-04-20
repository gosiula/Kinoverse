import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MdLogin, MdLogout } from "react-icons/md";
import { ImFilm } from "react-icons/im";
import { GiFilmProjector } from "react-icons/gi";
import { FaSchool } from "react-icons/fa6";
import { MdAccountCircle } from "react-icons/md";
import { FaCartShopping } from "react-icons/fa6";
import "./Headers.css";

const UserHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getAuth = () => {
    try {
      const auth = JSON.parse(localStorage.getItem("authData"));
      if (!auth?.token) return null;

      const tokenParts = auth.token.split(".");
      if (tokenParts.length !== 3) return null;

      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp < currentTime) return null;

      return auth;
    } catch {
      return null;
    }
  };

  const auth = getAuth();
  const isLoggedIn = !!auth;
  const isUser = auth?.role === "USER";
  const isEmployee = auth?.role === "EMPLOYEE";
  const isAdmin = auth?.role === "ADMIN";

  const baseMenuItems = [
    {
      path: "/home",
      label: "REPERTUAR",
      icon: <ImFilm />,
    },
    {
      path: "/schools",
      label: "SZKOŁY",
      icon: <FaSchool />,
    },
  ];

  if (isLoggedIn && isUser) {
    baseMenuItems.push({
      path: "/user/my_showings",
      label: "MOJE SEANSE",
      icon: <MdAccountCircle />,
    });
  }
  if (isLoggedIn && (isEmployee || isAdmin)) {
    const ordersPath = isEmployee ? "/employee/orders" : "/admin/orders";

    baseMenuItems.push({
      path: ordersPath,
      label: "ZAMÓWIENIA",
      icon: <FaCartShopping />,
    });
  }

  const authButton = isLoggedIn
    ? {
        path: "/logout",
        label: "WYLOGUJ SIĘ",
        icon: <MdLogout />,
      }
    : {
        path: "/login",
        label: "LOGOWANIE",
        icon: <MdLogin />,
      };

  return (
    <div className="header">
      <div className="header-logo-container">
        <div className="kinoverse-logo">
          <span className="kinoverse-kino">Kino</span>
          <span className="kinoverse-verse">verse</span>
          <GiFilmProjector className="kinoverse-icon" />
        </div>
      </div>

      {baseMenuItems.map((item) => (
        <button
          key={item.path}
          className={`header-button ${
            location.pathname.startsWith(item.path)
              ? "header-current-button"
              : ""
          }`}
          onClick={() => {
            localStorage.removeItem("showingId");
            localStorage.removeItem("ticketQuantities");
            localStorage.removeItem("capacity");
            localStorage.removeItem("selectedSeats");
            localStorage.removeItem("orderId");
            localStorage.removeItem("snackQuantities");
            localStorage.removeItem("email");
            localStorage.removeItem("orderCreatedAt");
            localStorage.removeItem("showingType");
            localStorage.removeItem("editShowingId");
            localStorage.removeItem("editCapacity");
            localStorage.removeItem("editMail");
            localStorage.removeItem("editIsPaid");
            localStorage.removeItem("editTickets");
            localStorage.removeItem("editSeats");
            localStorage.removeItem("editSnacks");
            navigate(item.path);
          }}
        >
          <div className="header-icon">{item.icon}</div>
          {item.label}
        </button>
      ))}

      <button
        className={`header-button ${
          location.pathname.startsWith(authButton.path)
            ? "header-current-button"
            : ""
        }`}
        onClick={() => {
          if (authButton.action) {
            authButton.action();
          } else {
            navigate(authButton.path);
          }
        }}
      >
        <div className="header-icon">{authButton.icon}</div>
        {authButton.label}
      </button>
    </div>
  );
};

export default UserHeader;
