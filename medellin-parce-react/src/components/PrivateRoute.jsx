import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        fontSize: "1rem",
        color: "#888"
      }}>
        Cargando...
      </div>
    );
  }

  return usuario ? children : <Navigate to="/login" replace />;
}
