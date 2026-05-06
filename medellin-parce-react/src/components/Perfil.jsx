import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usuariosApi } from "../services/api";
import "../styles/perfil.css";

const Perfil = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombreCliente: "",
    correoElectronico: "",
    direccionEnvio: "",
    numeroTelefono: "",
    password: "",
    confirmPassword: "",
  });

  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (usuario) {
      setForm({
        nombreCliente: usuario.nombreCliente || "",
        correoElectronico: usuario.correoElectronico || "",
        direccionEnvio: usuario.direccionEnvio || "",
        numeroTelefono: usuario.numeroTelefono || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    setMensaje(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password && form.password !== form.confirmPassword) {
      setMensaje({ tipo: "error", texto: "Las contraseñas no coinciden." });
      return;
    }

    if (form.password && form.password.length < 6) {
      setMensaje({ tipo: "error", texto: "La contraseña debe tener mínimo 6 caracteres." });
      return;
    }

    setCargando(true);

    try {
      const datosActualizados = {
        idCliente: usuario.idCliente,
        nombreCliente: form.nombreCliente,
        correoElectronico: form.correoElectronico,
        direccionEnvio: form.direccionEnvio,
        numeroTelefono: form.numeroTelefono,
        password: form.password || usuario.password,
        activo: true,
      };

      await usuariosApi.modificar(usuario.idCliente, datosActualizados);

      // Actualizar sesión local con nuevos datos
      const sesionActualizada = { ...usuario, ...datosActualizados };
      localStorage.setItem("sesionActiva", JSON.stringify(sesionActualizada));

      setMensaje({ tipo: "exito", texto: "✓ Datos actualizados correctamente." });
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message || "Error al actualizar." });
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>

      {/* Header */}
      <header>
        <div className="logo">
          <a href="/home"><img src="/logo.png" alt="logo" /></a>
        </div>
        <nav>
          <ul>
            <li><a href="/home">INICIO</a></li>
            <li><a href="/productos">PRODUCTOS</a></li>
            <li><a href="#">BLOG</a></li>
            <li><a href="#">NOSOTROS</a></li>
            <li id="perfil-usuario" style={{ display: "block" }}>
              <img src="/imagenes/image copy.png" alt="Icono de usuario" className="icono-usuario" />
              <div className="dropdown-contenido">
                <a href="/perfil">Mi Perfil</a>
                <a onClick={handleLogout} style={{ cursor: "pointer" }}>Cerrar Sesión</a>
              </div>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main */}
      <main className="perfil-main">
        <div className="perfil-container">

          <div className="perfil-header">
            <div className="perfil-avatar">
              {usuario?.nombreCliente?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="perfil-nombre">{usuario?.nombreCliente}</h1>
              <p className="perfil-id">ID: {usuario?.idCliente}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="perfil-form">

            <div className="perfil-seccion">
              <h2>Información personal</h2>

              <div className="perfil-grupo">
                <label htmlFor="nombreCliente">Nombre completo</label>
                <input
                  type="text"
                  id="nombreCliente"
                  value={form.nombreCliente}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="perfil-grupo">
                <label htmlFor="correoElectronico">Correo electrónico</label>
                <input
                  type="email"
                  id="correoElectronico"
                  value={form.correoElectronico}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="perfil-grupo">
                <label htmlFor="direccionEnvio">Dirección de envío</label>
                <input
                  type="text"
                  id="direccionEnvio"
                  value={form.direccionEnvio}
                  onChange={handleChange}
                  placeholder="Tu dirección de envío"
                />
              </div>

              <div className="perfil-grupo">
                <label htmlFor="numeroTelefono">Número de teléfono</label>
                <input
                  type="tel"
                  id="numeroTelefono"
                  value={form.numeroTelefono}
                  onChange={handleChange}
                  placeholder="Tu número de teléfono"
                />
              </div>
            </div>

            <div className="perfil-seccion">
              <h2>Cambiar contraseña</h2>
              <p className="perfil-hint">Deja en blanco si no quieres cambiarla</p>

              <div className="perfil-grupo">
                <label htmlFor="password">Nueva contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="perfil-grupo">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite la contraseña"
                />
              </div>
            </div>

            {mensaje && (
              <div className={`perfil-mensaje ${mensaje.tipo}`}>
                {mensaje.texto}
              </div>
            )}

            <button type="submit" className="perfil-btn" disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar cambios"}
            </button>

          </form>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-info">
          <p>Medellín Parce</p>
          <p>Contacto: +57 305 2592493</p>
          <p>Email: <a href="mailto:info.medellinparce@gmail.com">info.medellinparce@gmail.com</a></p>
          <p>Todos los derechos reservados.</p>
        </div>
        <div className="footer-logo">
          <img src="/logo.png" alt="Logo Medellín Parce" />
        </div>
      </footer>

    </div>
  );
};

export default Perfil;
