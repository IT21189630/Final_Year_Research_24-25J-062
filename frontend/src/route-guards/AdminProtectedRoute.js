import React from "react";
import users from "../configurations/userRoles";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function AdminProtectedRoute() {
  const { Admin } = users;
  const { role } = useSelector((state) => state.user);

  return role != null && role === Admin ? <Outlet /> : <Navigate to="/" />;
}

export default AdminProtectedRoute;
