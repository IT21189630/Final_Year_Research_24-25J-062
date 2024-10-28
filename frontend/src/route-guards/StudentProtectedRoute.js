import React from "react";
import users from "../configurations/userRoles";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function StudentProtectedRoute() {
  const { Student } = users;
  const { role } = useSelector((state) => state.user);

  return role != null && role === Student ? <Outlet /> : <Navigate to="/" />;
}

export default StudentProtectedRoute;
