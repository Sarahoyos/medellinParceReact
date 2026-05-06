import { createContext, useContext, useState, useEffect } from "react";
import { usuariosApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const sesion = localStorage.getItem("sesionActiva");
    if (sesion) setUsuario(JSON.parse(sesion));
    setCargando(false);
  }, []);

  // Login contra el backend
  const login = async (correoElectronico, password) => {
    const usuarioData = await usuariosApi.login(correoElectronico, password);
    localStorage.setItem("sesionActiva", JSON.stringify(usuarioData));
    setUsuario(usuarioData);
    return usuarioData;
  };

  const logout = () => {
    localStorage.removeItem("sesionActiva");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
