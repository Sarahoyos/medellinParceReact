import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usuariosApi } from "../services/api";
import "../styles/register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    idCliente: "",
    nombreCliente: "",
    correoElectronico: "",
    password: "",
    confirmPassword: "",
    direccionEnvio: "",
    numeroTelefono: "",
  });

  const [errores, setErrores] = useState({});
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrores((prev) => ({ ...prev, [id]: "" }));
  };

  const validar = () => {
    const nuevosErrores = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.idCliente.trim())
      nuevosErrores.idCliente = "El ID es obligatorio.";
    if (!form.nombreCliente.trim())
      nuevosErrores.nombreCliente = "El nombre es obligatorio.";
    if (!emailRegex.test(form.correoElectronico))
      nuevosErrores.correoElectronico = "El correo no es válido.";
    if (form.password.length < 6)
      nuevosErrores.password = "Mínimo 6 caracteres.";
    if (form.password !== form.confirmPassword)
      nuevosErrores.confirmPassword = "Las contraseñas no coinciden.";

    return nuevosErrores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erroresValidacion = validar();
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    setCargando(true);

    try {
      await usuariosApi.crear({
        idCliente: form.idCliente,
        nombreCliente: form.nombreCliente,
        correoElectronico: form.correoElectronico,
        password: form.password,
        direccionEnvio: form.direccionEnvio,
        numeroTelefono: form.numeroTelefono,
      });

      setExito(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrores({ general: err.message });
    } finally {
      setCargando(false);
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

            <input type="text" id="idCliente" placeholder="ID de cliente (ej: USR001)"
              value={form.idCliente} onChange={handleChange} required />
            {errores.idCliente && <span className="campo-error">{errores.idCliente}</span>}

            <input type="text" id="nombreCliente" placeholder="Nombre completo"
              value={form.nombreCliente} onChange={handleChange} required />
            {errores.nombreCliente && <span className="campo-error">{errores.nombreCliente}</span>}

            <input type="email" id="correoElectronico" placeholder="Correo electrónico"
              value={form.correoElectronico} onChange={handleChange} required />
            {errores.correoElectronico && <span className="campo-error">{errores.correoElectronico}</span>}

            <input type="text" id="direccionEnvio" placeholder="Dirección de envío"
              value={form.direccionEnvio} onChange={handleChange} />

            <input type="tel" id="numeroTelefono" placeholder="Número de teléfono"
              value={form.numeroTelefono} onChange={handleChange} />

            <input type="password" id="password" placeholder="Contraseña"
              value={form.password} onChange={handleChange} required />
            {errores.password && <span className="campo-error">{errores.password}</span>}

            <input type="password" id="confirmPassword" placeholder="Confirmar contraseña"
              value={form.confirmPassword} onChange={handleChange} required />
            {errores.confirmPassword && <span className="campo-error">{errores.confirmPassword}</span>}

            {errores.general && (
              <p style={{ color: "#cc0000", fontSize: "13px", margin: "4px 0" }}>
                {errores.general}
              </p>
            )}

            {exito && (
              <p style={{ color: "#2d6a2d", fontSize: "13px", fontWeight: "bold" }}>
                ✓ ¡Registro exitoso! Redirigiendo...
              </p>
            )}

            <button type="submit" id="register-button" disabled={cargando || exito}>
              {cargando ? "Registrando..." : "Registrarse"}
            </button>

          </form>

          <div className="sincuenta">
            <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}
