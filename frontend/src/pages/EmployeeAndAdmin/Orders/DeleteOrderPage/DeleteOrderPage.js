import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DefaultHeader from "../../../../components/Headers/DeaultHeader";
import Confirmation from "../../../../components/Confirmation/Confirmation";
import "./DeleteOrderPage.css";
import "../../../../App.css";

function DeleteOrderPage() {
  const navigate = useNavigate();

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
  const orderId = localStorage.getItem("orderToDelete");
  const isUser = auth?.role === "USER";
  const isEmployee = auth?.role === "EMPLOYEE";
  const isAdmin = auth?.role === "ADMIN";

  useEffect(() => {
    const noAuthOrUser = !auth || isUser;

    if (!orderId || noAuthOrUser) {
      navigate("/error");
    }
  }, [orderId, navigate]);

  const deleteOrder = async () => {
    if (!orderId) {
      alert("Brak ID zamówienia.");
      return;
    }

    const token = JSON.parse(localStorage.getItem("authData"))?.token;
    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/employee_admin_delete_order/${orderId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (isEmployee) {
          navigate("/employee/orders/delete/success");
        } else if (isAdmin) {
          navigate("/admin/orders/delete/success");
        }
      } else {
        alert(data.message || "Wystąpił błąd.");
        alert("Wystąpił błąd.");
      }
    } catch (error) {
      console.error("Błąd:", error);
      alert("Błąd połączenia z serwerem.");
    }
  };

  const goBack = () => {
    if (isEmployee) {
      navigate("/employee/orders");
    } else if (isAdmin) {
      navigate("/admin/orders");
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <DefaultHeader />

      <Confirmation
        onConfirm={deleteOrder}
        title1="CZY NA PEWNO"
        title2="CHCESZ USUNĄĆ TO ZAMÓWIENIE?"
        color="#0F1027"
        text="USUŃ ZAMÓWIENIE"
      />
      <div className="go-back-container">
        <button onClick={goBack} className="go-back-order-button">
          ANULUJ
        </button>
      </div>
    </div>
  );
}

export default DeleteOrderPage;
