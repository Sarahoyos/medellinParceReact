import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await login(correo, password);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main>
      <div className="login-container">

        <a id="logo" href="/home">
          <img src="/logo.png" alt="Logo" />
        </a>

        <h1>Bienvenido a Medellin Parce</h1>

        <section>
          <form onSubmit={handleSubmit}>

            <input
              type="email"
              id="username"
              required
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />

            <input
              type="password"
              id="password"
              required
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p style={{ color: "#cc0000", fontSize: "13px", margin: "4px 0 0" }}>
                {error}
              </p>
            )}

            <button type="submit" id="login-button" disabled={cargando}>
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>

          </form>

          <div className="sincuenta">
            <p>
              ¿No tienes una cuenta?{" "}
              <Link to="/registro">Regístrate aquí</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
