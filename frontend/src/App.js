import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import SchoolPage from "./pages/SchoolPage/SchoolPage";
import TicketsPage from "./pages/TicketsPage/TicketsPage";
import SeatsPage from "./pages/SeatsPage/SeatsPage";
import SnacksSchoolPage from "./pages/SnacksPage/SnacksSchoolPage";
import SnacksPage from "./pages/SnacksPage/SnacksPage";
import PaymentPage from "./pages/PaymentPage/PaymentPage";
import PaymentSchoolPage from "./pages/PaymentPage/PaymentSchoolPage";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import ConfirmPaymentPage from "./pages/ConfirmPaymentPage/ConfirmPaymentPage";
import SuccessPaymentPage from "./pages/SuccessPaymentPage/SuccessPaymentPage";
import LoginPage from "./pages/Login/LoginPage";
import MainLoginPage from "./pages/Login/MainLoginPage";
import RegisterPage from "./pages/Login/RegisterPage";
import RegisterNamePage from "./pages/Login/RegisterNamePage";
import ConfirmRegisterPage from "./pages/Login/ConfirmRegisterPage";
import SuccessRegisterPage from "./pages/Login/SuccessRegisterPage";
import LogoutPage from "./pages/LogoutPage/LogoutPage";
import MyShowingsPage from "./pages/MyShowingsPage/MyShowingsPage";

const App = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      const timer = setTimeout(() => {
        setLoading(false);
        navigate("/home");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [navigate, location.pathname]);

  if (loading && location.pathname === "/") {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<MainLoginPage />} />
      <Route path="/login/sign_in" element={<LoginPage />} />
      <Route path="/login/sign_up" element={<RegisterPage />} />
      <Route
        path="/login/sign_up/name_surname"
        element={<RegisterNamePage />}
      />
      <Route path="/login/sign_up/confirm" element={<ConfirmRegisterPage />} />
      <Route path="/login/sign_up/success" element={<SuccessRegisterPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/schools" element={<SchoolPage />} />
      <Route path="/home/tickets" element={<TicketsPage />} />
      <Route path="/schools/tickets" element={<TicketsPage />} />
      <Route path="/home/seats" element={<SeatsPage />} />
      <Route path="/home/snacks" element={<SnacksPage />} />
      <Route path="/schools/snacks" element={<SnacksSchoolPage />} />
      <Route path="/home/payment" element={<PaymentPage />} />
      <Route path="/schools/payment" element={<PaymentSchoolPage />} />
      <Route path="/home/confirm_payment" element={<ConfirmPaymentPage />} />
      <Route path="/schools/confirm_payment" element={<ConfirmPaymentPage />} />
      <Route path="/home/success" element={<SuccessPaymentPage />} />
      <Route path="/schools/success" element={<SuccessPaymentPage />} />
      <Route path="my_showings" element={<MyShowingsPage />} />
    </Routes>
  );
};

export default App;
