import { useState } from "react";
import "../styles/register.css";
import { Usuario } from "../services/usuario";

export default function Register() {

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { fullname, email, username, password, confirmPassword } = form;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: "error", text: "El correo no es válido." });
      return;
    }

    // Password match
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    const nuevoUsuario = new Usuario(fullname, email, username, password);

    const result = nuevoUsuario.registrar();

    setMessage({
      type: result.success ? "success" : "error",
      text: result.message
    });

    if (result.success) {
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  };

  return (
    <main>
      <div className="login-container">

        <div id="logo">
          <a href="/home">
            <img src="/logo.png" alt="logo" />
          </a>
        </div>

        <h1>Crear una cuenta</h1>

        <section>
          <form onSubmit={handleSubmit}>

            <input
              type="text"
              id="fullname"
              placeholder="Nombre completo"
              value={form.fullname}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              id="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              id="username"
              placeholder="Nombre de usuario"
              value={form.username}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              id="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirmar contraseña"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            <button type="submit" id="register-button">
              Registrarse
            </button>

          </form>

          <div className="sincuenta">
            <p>
              ¿Ya tienes cuenta?{" "}
              <a href="/login">Inicia sesión aquí</a>
            </p>
          </div>

          {/* 🔥 React Toast Message */}
          {message && (
            <div
              style={{
                padding: "10px",
                marginTop: "10px",
                borderRadius: "8px",
                fontWeight: "bold",
                backgroundColor:
                  message.type === "error" ? "#ff4d4d" : "#4CAF50",
                color: "white"
              }}
            >
              {message.text}
            </div>
          )}

        </section>
      </div>
    </main>
  );
}