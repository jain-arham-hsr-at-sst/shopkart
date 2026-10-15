import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../services/api";

const ProtectedRoute = () => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/customers/me");
        setStatus("authenticated");
      } catch (err) {
        setStatus("unauthenticated");
      }
    };
    checkAuth();
  }, []);

  if (status === "checking")
    return <h3 style={{ padding: "20px" }}>Loading...</h3>;
  if (status === "unauthenticated") return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
