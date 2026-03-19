import { useState } from "react";
import "../styles/login.css";
import { inicioSesion } from "../services/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await inicioSesion(username, password);
    
      if (result) {
        alert("Inicio de sesión exitoso");
        navigate("/home");
      } else {
        alert("Usuario o contraseña incorrectos");
      }

    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  return (
    <main>
      <div className="login-container">

        <a id="logo" href="./Home.jsx">
          <img src="/logo.png" alt="Logo" />
        </a>

        <h1>Bienvenido a Medellin Parce</h1>

        <section>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              id="username"
              required
              placeholder="Ingrese su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              id="password"
              required
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" id="login-button">
              Iniciar sesión
            </button>

          </form>

          <div className="sincuenta">
            <p>
              ¿No tienes una cuenta?{" "}
              <Link to="/registro">Regístrate aquí</Link>
            </p>
          </div>

          <div id="toast-container-mensaje"></div>

        </section>
      </div>
    </main>
  );
}