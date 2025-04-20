import React from "react";
import { Routes, Route } from "react-router-dom";
import MyShowingsPage from "../pages/MyShowingsPage/MyShowingsPage";

const UserRoutes = () => (
  <Routes>
    <Route path="/my_showings" element={<MyShowingsPage />} />
  </Routes>
);

export default UserRoutes;
