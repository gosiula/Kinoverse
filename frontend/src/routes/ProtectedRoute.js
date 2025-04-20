import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const authData = JSON.parse(localStorage.getItem("authData"));

  if (!authData || authData.role !== requiredRole) {
    return <Navigate to="/error" />;
  }

  return children;
};

export default ProtectedRoute;
