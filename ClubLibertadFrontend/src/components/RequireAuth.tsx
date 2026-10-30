import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../services/api";

interface Props {
  children: ReactNode;
  rol?: "BAILARIN" | "ADMIN";
}

export default function RequireAuth({ children, rol }: Props) {
  const location = useLocation();
  const token = authService.obtenerToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (rol) {
    const rolActual = (authService.obtenerRol() || "").toUpperCase();
    if (!rolActual.includes(rol)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
