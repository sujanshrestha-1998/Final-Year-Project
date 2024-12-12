import React from "react";
import { Navigate } from "react-router-dom";

const FOUR_DAYS_IN_MS = 4 * 24 * 60 * 60 * 1000;

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const loginTimestamp = localStorage.getItem("loginTimestamp");

  if (!isAuthenticated || !loginTimestamp) {
    return <Navigate to="/" />;
  }

  const isExpired = Date.now() - parseInt(loginTimestamp, 10) > FOUR_DAYS_IN_MS;

  if (isExpired) {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("loginTimestamp");
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
