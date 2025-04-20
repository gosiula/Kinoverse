import React from "react";
import { Routes, Route } from "react-router-dom";
import OrdersPage from "../pages/EmployeeAndAdmin/Orders/OrdersPage/OrdersPage";
import EditOrderPage from "../pages/EmployeeAndAdmin/Orders/EditOrderPage/EditOrderPage";
import DeleteOrderPage from "../pages/EmployeeAndAdmin/Orders/DeleteOrderPage/DeleteOrderPage";
import DeleteOrderSuccessPage from "../pages/EmployeeAndAdmin/Orders/DeleteOrderPage/DeleteOrderSuccessPage";
import EditSeatsPage from "../pages/EmployeeAndAdmin/Orders/EditSeatsPage/EditSeatsPage";
import EditOrderSuccessPage from "../pages/EmployeeAndAdmin/Orders/EditOrderSuccessPage/EditOrderSuccessPage";

const AdminRoutes = () => (
  <Routes>
    <Route path="/orders" element={<OrdersPage />} />
    <Route path="/orders/edit" element={<EditOrderPage />} />
    <Route path="/orders/delete" element={<DeleteOrderPage />} />
    <Route path="/orders/delete/success" element={<DeleteOrderSuccessPage />} />
    <Route path="/orders/edit_seats" element={<EditSeatsPage />} />
    <Route path="/orders/edit/success" element={<EditOrderSuccessPage />} />
  </Routes>
);

export default AdminRoutes;
