import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usuariosApi, ordenCompraApi, productosApi } from "../services/api";
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
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [productos, setProductos] = useState({});
  const [cargandoOrdenes, setCargandoOrdenes] = useState(true);

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

      const cargarDatos = async () => {
        try {
          // Cargar productos como mapa { idProducto: producto }
          const listaProductos = await productosApi.getAll();
          const mapaProductos = {};
          listaProductos.forEach(p => { mapaProductos[p.idProducto] = p; });
          setProductos(mapaProductos);

          // Cargar órdenes del usuario
          const todas = await ordenCompraApi.getAll();
          const misOrdenes = todas.filter(o => o.cliente === usuario.idCliente);
          setOrdenes(misOrdenes);
        } catch (err) {
          console.error("Error cargando datos:", err);
        } finally {
          setCargandoOrdenes(false);
        }
      };

      cargarDatos();
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
      setMensaje({ tipo: "error", texto: "Mínimo 6 caracteres." });
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
      localStorage.setItem("sesionActiva", JSON.stringify({ ...usuario, ...datosActualizados }));
      setMensaje({ tipo: "exito", texto: "✓ Datos actualizados correctamente." });
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message || "Error al actualizar." });
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarCuenta = async () => {
    try {
      await usuariosApi.eliminar(usuario.idCliente);
      logout();
      navigate("/login");
    } catch (err) {
      setMensaje({ tipo: "error", texto: "Error al eliminar la cuenta." });
      setConfirmarEliminar(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const formatearPrecio = (valor) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(valor);

  // Parsear listaProductos "PROD003:1,PROD002:1" → [{ id, cantidad }]
  const parsearProductos = (listaStr) => {
    if (!listaStr) return [];
    return listaStr.split(",").map(item => {
      const [id, cantidad] = item.split(":");
      return { id: id?.trim(), cantidad: parseInt(cantidad) || 1 };
    });
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
            <li><a href="/blog">BLOG</a></li>
            <li><a href="/nosotros">NOSOTROS</a></li>
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

      <main className="perfil-main">
        <div className="perfil-container">

          {/* Header del perfil */}
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
                <input type="text" id="nombreCliente" value={form.nombreCliente} onChange={handleChange} required />
              </div>
              <div className="perfil-grupo">
                <label htmlFor="correoElectronico">Correo electrónico</label>
                <input type="email" id="correoElectronico" value={form.correoElectronico} onChange={handleChange} required />
              </div>
              <div className="perfil-grupo">
                <label htmlFor="direccionEnvio">Dirección de envío</label>
                <input type="text" id="direccionEnvio" value={form.direccionEnvio} onChange={handleChange} />
              </div>
              <div className="perfil-grupo">
                <label htmlFor="numeroTelefono">Número de teléfono</label>
                <input type="tel" id="numeroTelefono" value={form.numeroTelefono} onChange={handleChange} />
              </div>
            </div>

            <div className="perfil-seccion">
              <h2>Cambiar contraseña</h2>
              <p className="perfil-hint">Deja en blanco si no quieres cambiarla</p>
              <div className="perfil-grupo">
                <label htmlFor="password">Nueva contraseña</label>
                <input type="password" id="password" value={form.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" />
              </div>
              <div className="perfil-grupo">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <input type="password" id="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repite la contraseña" />
              </div>
            </div>

            {mensaje && (
              <div className={`perfil-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
            )}

            <button type="submit" className="perfil-btn" disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar cambios"}
            </button>

          </form>

          {/* Historial de compras */}
          <div className="perfil-historial">
            <h2>Mis compras</h2>

            {cargandoOrdenes && <p className="perfil-hint">Cargando historial...</p>}

            {!cargandoOrdenes && ordenes.length === 0 && (
              <p className="perfil-hint">Aún no has realizado compras.</p>
            )}

            {ordenes.map((orden) => {
              const items = parsearProductos(orden.listaProductos);
              return (
                <div className="perfil-orden" key={orden.idCompra}>

                  <div className="perfil-orden-header">
                    <span className="perfil-orden-id">#{orden.idCompra}</span>
                    <span className="perfil-orden-total">{formatearPrecio(orden.total)}</span>
                  </div>

                  <div className="perfil-orden-fechas">
                    <p>📅 Compra: <strong>{orden.fecha}</strong></p>
                    {orden.fechaEntrega && (
                      <p>🚚 Entrega estimada: <strong>{orden.fechaEntrega}</strong></p>
                    )}
                  </div>

                  {/* Fotos de productos */}
                  <div className="perfil-orden-productos">
                    {items.map(({ id, cantidad }) => {
                      const prod = productos[id];
                      return (
                        <div className="perfil-orden-producto" key={id}>
                          <img
                            src={prod ? `/imagenes/${prod.imagen}` : "/logo.png"}
                            alt={prod?.nombreProducto || id}
                            onError={(e) => { e.target.src = "/logo.png"; }}
                          />
                          <p className="perfil-prod-nombre">{prod?.nombreProducto || id}</p>
                          <p className="perfil-prod-cantidad">x{cantidad}</p>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Eliminar cuenta */}
          <div className="perfil-eliminar-seccion">
            {!confirmarEliminar ? (
              <button className="perfil-btn-eliminar" onClick={() => setConfirmarEliminar(true)}>
                Eliminar cuenta
              </button>
            ) : (
              <div className="perfil-confirmar">
                <p>¿Estás seguro? Esta acción desactivará tu cuenta.</p>
                <div className="perfil-confirmar-botones">
                  <button className="perfil-btn-confirmar-si" onClick={handleEliminarCuenta}>Sí, eliminar</button>
                  <button className="perfil-btn-confirmar-no" onClick={() => setConfirmarEliminar(false)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>

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
        <div className="footer-logo"><img src="/logo.png" alt="Logo Medellín Parce" /></div>
      </footer>

    </div>
  );
};

export default Perfil;
