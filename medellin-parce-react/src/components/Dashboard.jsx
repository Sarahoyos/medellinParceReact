import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usuariosApi, productosApi, ordenCompraApi, carritosApi } from "../services/api";
import "../styles/dashboard.css";

const Dashboard = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const mainRef = useRef(null);

  const [seccion, setSeccion] = useState("resumen");
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [carritos, setCarritos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Form nuevo producto
  const [formProducto, setFormProducto] = useState({
    idProducto: "", nombreProducto: "", talla: "",
    color: "", precio: "", descripcion: "", imagen: ""
  });
  const [editandoProducto, setEditandoProducto] = useState(null);
  const [confirmarDesactivar, setConfirmarDesactivar] = useState(null);
  const [carritoAbierto, setCarritoAbierto] = useState(null); // id del carrito desplegado // id del usuario a desactivar
  const [formUsuario, setFormUsuario] = useState({ idCliente: "", nombreCliente: "", correoElectronico: "", password: "", direccionEnvio: "", numeroTelefono: "", rol: "admin" });
  const [mensajeUsuario, setMensajeUsuario] = useState(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(false);
  const [mensajeProducto, setMensajeProducto] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [u, p, o, c] = await Promise.all([
          usuariosApi.getAll(),
          productosApi.getAll(),
          ordenCompraApi.getAll(),
          carritosApi.getAll().catch(() => []),
        ]);
        setUsuarios(u);
        setProductos(p);
        setOrdenes(o);
        setCarritos(c);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const formatearPrecio = (valor) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(valor);

  // ── USUARIOS ──
  const handleDesactivar = async (u) => {
    try {
      await usuariosApi.eliminar(u.idCliente);
      const actualizados = await usuariosApi.getAll();
      setUsuarios(actualizados);
    } catch (err) {
      console.error("Error desactivando usuario:", err);
    } finally {
      setConfirmarDesactivar(null);
    }
  };

  const handleActivar = async (u) => {
    try {
      await usuariosApi.modificar(u.idCliente, { ...u, activo: true });
      const actualizados = await usuariosApi.getAll();
      setUsuarios(actualizados);
    } catch (err) {
      console.error("Error activando usuario:", err);
    }
  };

  const handleCrearAdmin = async (e) => {
    e.preventDefault();
    setCargandoUsuario(true);
    try {
      await usuariosApi.crear({ ...formUsuario });
      setMensajeUsuario({ tipo: "exito", texto: "✓ Administrador creado correctamente." });
      setFormUsuario({ idCliente: "", nombreCliente: "", correoElectronico: "", password: "", direccionEnvio: "", numeroTelefono: "", rol: "admin" });
      const actualizados = await usuariosApi.getAll();
      setUsuarios(actualizados);
    } catch (err) {
      setMensajeUsuario({ tipo: "error", texto: err.message || "Error al crear administrador." });
    } finally {
      setCargandoUsuario(false);
    }
  };

  // ── PRODUCTOS ──
  const handleProductoChange = (e) => {
    const { id, value } = e.target;
    setFormProducto(prev => ({ ...prev, [id]: value }));
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    try {
      if (editandoProducto) {
        await productosApi.modificar(editandoProducto, {
          ...formProducto,
          precio: parseInt(formProducto.precio)
        });
        setMensajeProducto({ tipo: "exito", texto: "✓ Producto actualizado." });
      } else {
        await productosApi.crear({
          ...formProducto,
          precio: parseInt(formProducto.precio)
        });
        setMensajeProducto({ tipo: "exito", texto: "✓ Producto creado." });
      }
      const actualizados = await productosApi.getAll();
      setProductos(actualizados);
      setFormProducto({ idProducto: "", nombreProducto: "", talla: "", color: "", precio: "", descripcion: "", imagen: "" });
      setEditandoProducto(null);
    } catch (err) {
      setMensajeProducto({ tipo: "error", texto: "Error al guardar producto." });
    }
  };

  const handleEditarProducto = (p) => {
    setFormProducto({
      idProducto: p.idProducto,
      nombreProducto: p.nombreProducto,
      talla: p.talla,
      color: p.color,
      precio: p.precio,
      descripcion: p.descripcion,
      imagen: p.imagen || ""
    });
    setEditandoProducto(p.idProducto);
    setSeccion("productos");
    window.scrollTo(0, 0);
  };

  const handleEliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await productosApi.eliminar(id);
      setProductos(prev => prev.filter(p => p.idProducto !== id));
    } catch (err) {
      console.error("Error eliminando producto:", err);
    }
  };

  // ── ANALÍTICA ──
  const ingresosTotales = ordenes.reduce((sum, o) => sum + (o.total || 0), 0);
  const ingresosPorMes = ordenes.reduce((acc, o) => {
    if (!o.fecha) return acc;
    const mes = new Date(o.fecha).getMonth() + 1;
    acc[mes] = (acc[mes] || 0) + (o.total || 0);
    return acc;
  }, {});

  const productosMasVendidos = (() => {
    const conteo = {};
    ordenes.forEach(o => {
      if (!o.listaProductos) return;
      o.listaProductos.split(",").forEach(item => {
        const [id, cant] = item.split(":");
        conteo[id] = (conteo[id] || 0) + (parseInt(cant) || 1);
      });
    });
    return Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 5);
  })();

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  if (cargando) return <div className="dash-loading">Cargando dashboard...</div>;

  return (
    <div className="dash-wrapper">

      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <img src="/logo.png" alt="logo" />
          <span>ADMIN</span>
        </div>

        <nav className="dash-nav">
          {[
            { key: "resumen", label: "📊 Resumen" },
            { key: "usuarios", label: "👤 Usuarios" },
            { key: "productos", label: "👕 Productos" },
            { key: "ordenes", label: "📦 Órdenes" },
            { key: "analitica", label: "📈 Analítica" },
            { key: "carritos", label: "🛒 Carritos abandonados" },
          ].map(item => (
            <button
              key={item.key}
              className={`dash-nav-btn ${seccion === item.key ? "activo" : ""}`}
              onClick={() => setSeccion(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button className="dash-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </aside>

      {/* Contenido */}
      <main className="dash-main" ref={mainRef}>

        {/* ── RESUMEN ── */}
        {seccion === "resumen" && (
          <div>
            <h1 className="dash-titulo">Resumen general</h1>
            <div className="dash-cards">
              <div className="dash-card">
                <p className="dash-card-valor">{usuarios.filter(u => u.activo).length}</p>
                <p className="dash-card-label">Usuarios activos</p>
              </div>
              <div className="dash-card">
                <p className="dash-card-valor">{productos.length}</p>
                <p className="dash-card-label">Productos</p>
              </div>
              <div className="dash-card">
                <p className="dash-card-valor">{ordenes.length}</p>
                <p className="dash-card-label">Órdenes totales</p>
              </div>
              <div className="dash-card">
                <p className="dash-card-valor">{formatearPrecio(ingresosTotales)}</p>
                <p className="dash-card-label">Ingresos totales</p>
              </div>
              <div className="dash-card">
                <p className="dash-card-valor">{carritos.length}</p>
                <p className="dash-card-label">Carritos abandonados</p>
              </div>
            </div>
          </div>
        )}

        {/* ── USUARIOS ── */}
        {seccion === "usuarios" && (
          <div>
            <h1 className="dash-titulo">Gestión de usuarios</h1>

            {/* Formulario crear admin */}
            <div className="dash-form-container">
              <h2>Crear nuevo administrador</h2>
              <form onSubmit={handleCrearAdmin} className="dash-form">
                <div className="dash-form-grid">
                  <div className="dash-form-grupo">
                    <label>ID</label>
                    <input type="text" value={formUsuario.idCliente}
                      onChange={e => setFormUsuario(p => ({ ...p, idCliente: e.target.value }))}
                      placeholder="ej: ADMIN002" required />
                  </div>
                  <div className="dash-form-grupo">
                    <label>Nombre completo</label>
                    <input type="text" value={formUsuario.nombreCliente}
                      onChange={e => setFormUsuario(p => ({ ...p, nombreCliente: e.target.value }))}
                      required />
                  </div>
                  <div className="dash-form-grupo">
                    <label>Correo</label>
                    <input type="email" value={formUsuario.correoElectronico}
                      onChange={e => setFormUsuario(p => ({ ...p, correoElectronico: e.target.value }))}
                      required />
                  </div>
                  <div className="dash-form-grupo">
                    <label>Contraseña</label>
                    <input type="password" value={formUsuario.password}
                      onChange={e => setFormUsuario(p => ({ ...p, password: e.target.value }))}
                      required />
                  </div>
                  <div className="dash-form-grupo">
                    <label>Dirección</label>
                    <input type="text" value={formUsuario.direccionEnvio}
                      onChange={e => setFormUsuario(p => ({ ...p, direccionEnvio: e.target.value }))} />
                  </div>
                  <div className="dash-form-grupo">
                    <label>Teléfono</label>
                    <input type="tel" value={formUsuario.numeroTelefono}
                      onChange={e => setFormUsuario(p => ({ ...p, numeroTelefono: e.target.value }))} />
                  </div>
                </div>
                {mensajeUsuario && (
                  <div className={`dash-mensaje ${mensajeUsuario.tipo}`}>{mensajeUsuario.texto}</div>
                )}
                <button type="submit" className="dash-btn-guardar" disabled={cargandoUsuario}>
                  {cargandoUsuario ? "Creando..." : "Crear administrador"}
                </button>
              </form>
            </div>

            {/* Modal confirmación desactivar */}
            {confirmarDesactivar && (
              <div className="dash-modal-overlay">
                <div className="dash-modal">
                  <p>¿Desactivar la cuenta de <strong>{confirmarDesactivar.nombreCliente}</strong>?</p>
                  <p style={{ fontSize: "13px", color: "#888", marginTop: "6px" }}>
                    El usuario no podrá iniciar sesión.
                  </p>
                  <div className="dash-modal-botones">
                    <button className="dash-btn-accion desactivar"
                      onClick={() => handleDesactivar(confirmarDesactivar)}>
                      Sí, desactivar
                    </button>
                    <button className="dash-btn-accion activar"
                      onClick={() => setConfirmarDesactivar(null)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabla usuarios */}
            <table className="dash-tabla">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.idCliente}>
                    <td>{u.idCliente}</td>
                    <td>{u.nombreCliente}</td>
                    <td>{u.correoElectronico}</td>
                    <td>{u.numeroTelefono}</td>
                    <td>
                      <span className={`dash-badge ${u.rol === "admin" ? "activo" : "inactivo"}`}>
                        {u.rol || "usuario"}
                      </span>
                    </td>
                    <td>
                      <span className={`dash-badge ${u.activo ? "activo" : "inactivo"}`}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      {u.idCliente !== "ADMIN001" && (
                        <>
                          {u.activo ? (
                            <button className="dash-btn-accion desactivar"
                              onClick={() => setConfirmarDesactivar(u)}>
                              Desactivar
                            </button>
                          ) : (
                            <button className="dash-btn-accion activar"
                              onClick={() => handleActivar(u)}>
                              Activar
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PRODUCTOS ── */}
        {seccion === "productos" && (
          <div>
            <h1 className="dash-titulo">Gestión de productos</h1>

            {/* Formulario */}
            <div className="dash-form-container">
              <h2>{editandoProducto ? "Editar producto" : "Nuevo producto"}</h2>
              <form onSubmit={handleGuardarProducto} className="dash-form">
                <div className="dash-form-grid">
                  <div className="dash-form-grupo">
                    <label htmlFor="idProducto">ID Producto</label>
                    <input type="text" id="idProducto" value={formProducto.idProducto}
                      onChange={handleProductoChange} required disabled={!!editandoProducto} />
                  </div>
                  <div className="dash-form-grupo">
                    <label htmlFor="nombreProducto">Nombre</label>
                    <input type="text" id="nombreProducto" value={formProducto.nombreProducto}
                      onChange={handleProductoChange} required />
                  </div>
                  <div className="dash-form-grupo">
                    <label htmlFor="talla">Talla</label>
                    <input type="text" id="talla" value={formProducto.talla}
                      onChange={handleProductoChange} required />
                  </div>
                  <div className="dash-form-grupo">
                    <label htmlFor="color">Color</label>
                    <input type="text" id="color" value={formProducto.color}
                      onChange={handleProductoChange} required />
                  </div>
                  <div className="dash-form-grupo">
                    <label htmlFor="precio">Precio (COP)</label>
                    <input type="number" id="precio" value={formProducto.precio}
                      onChange={handleProductoChange} required />
                  </div>
                  <div className="dash-form-grupo">
                    <label htmlFor="imagen">Imagen (nombre archivo)</label>
                    <input type="text" id="imagen" value={formProducto.imagen}
                      onChange={handleProductoChange} placeholder="ej: camiseta.jpg" />
                  </div>
                  <div className="dash-form-grupo dash-form-full">
                    <label htmlFor="descripcion">Descripción</label>
                    <input type="text" id="descripcion" value={formProducto.descripcion}
                      onChange={handleProductoChange} required />
                  </div>
                </div>

                {mensajeProducto && (
                  <div className={`dash-mensaje ${mensajeProducto.tipo}`}>
                    {mensajeProducto.texto}
                  </div>
                )}

                <div className="dash-form-botones">
                  <button type="submit" className="dash-btn-guardar">
                    {editandoProducto ? "Actualizar" : "Crear producto"}
                  </button>
                  {editandoProducto && (
                    <button type="button" className="dash-btn-cancelar"
                      onClick={() => { setEditandoProducto(null); setFormProducto({ idProducto: "", nombreProducto: "", talla: "", color: "", precio: "", descripcion: "", imagen: "" }); }}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Tabla productos */}
            <table className="dash-tabla">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Talla</th>
                  <th>Color</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.idProducto}>
                    <td>{p.idProducto}</td>
                    <td>
                      <img src={`/imagenes/${p.imagen}`} alt={p.nombreProducto}
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                        onError={(e) => { e.target.src = "/logo.png"; }} />
                    </td>
                    <td>{p.nombreProducto}</td>
                    <td>{p.talla}</td>
                    <td>{p.color}</td>
                    <td>{formatearPrecio(p.precio)}</td>
                    <td>
                      <button className="dash-btn-accion activar" onClick={() => handleEditarProducto(p)}>
                        Editar
                      </button>
                      <button className="dash-btn-accion desactivar" onClick={() => handleEliminarProducto(p.idProducto)}
                        style={{ marginLeft: "6px" }}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ÓRDENES ── */}
        {seccion === "ordenes" && (
          <div>
            <h1 className="dash-titulo">Todas las órdenes</h1>
            <table className="dash-tabla">
              <thead>
                <tr>
                  <th>ID Orden</th>
                  <th>Cliente</th>
                  <th>Fecha compra</th>
                  <th>Fecha entrega</th>
                  <th>Productos</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map(o => (
                  <tr key={o.idCompra}>
                    <td>{o.idCompra}</td>
                    <td>{o.cliente}</td>
                    <td>{o.fecha}</td>
                    <td>{o.fechaEntrega || "—"}</td>
                    <td style={{ fontSize: "12px" }}>{o.listaProductos}</td>
                    <td>{formatearPrecio(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ANALÍTICA ── */}
        {seccion === "analitica" && (
          <div>
            <h1 className="dash-titulo">Analítica de ventas</h1>

            {/* Ingresos por mes */}
            <div className="dash-analitica-seccion">
              <h2>Ingresos por mes</h2>
              <div className="dash-barras">
                {Object.entries(ingresosPorMes).sort((a,b) => a[0]-b[0]).map(([mes, total]) => {
                  const maxVal = Math.max(...Object.values(ingresosPorMes));
                  const porcentaje = (total / maxVal) * 100;
                  return (
                    <div className="dash-barra-item" key={mes}>
                      <div className="dash-barra-contenedor">
                        <div className="dash-barra" style={{ height: `${porcentaje}%` }}></div>
                      </div>
                      <p className="dash-barra-label">{meses[parseInt(mes) - 1]}</p>
                      <p className="dash-barra-valor">{formatearPrecio(total)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Productos más vendidos */}
            <div className="dash-analitica-seccion">
              <h2>Productos más vendidos</h2>
              <table className="dash-tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Unidades vendidas</th>
                  </tr>
                </thead>
                <tbody>
                  {productosMasVendidos.map(([id, cant]) => {
                    const prod = productos.find(p => p.idProducto === id);
                    return (
                      <tr key={id}>
                        <td>{prod?.nombreProducto || id}</td>
                        <td>{cant}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Ticket promedio */}
            <div className="dash-analitica-seccion">
              <h2>Resumen general</h2>
              <div className="dash-cards">
                <div className="dash-card">
                  <p className="dash-card-valor">{formatearPrecio(ingresosTotales / (ordenes.length || 1))}</p>
                  <p className="dash-card-label">Ticket promedio</p>
                </div>
                <div className="dash-card">
                  <p className="dash-card-valor">{formatearPrecio(ingresosTotales)}</p>
                  <p className="dash-card-label">Ingresos totales</p>
                </div>
                <div className="dash-card">
                  <p className="dash-card-valor">{ordenes.length}</p>
                  <p className="dash-card-label">Total órdenes</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── CARRITOS ABANDONADOS ── */}
        {seccion === "carritos" && (
          <div>
            <h1 className="dash-titulo">Carritos abandonados</h1>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "20px", fontFamily: "Arial, sans-serif" }}>
              Usuarios que agregaron productos al carrito pero no completaron la compra.
            </p>
            {carritos.length === 0 ? (
              <p style={{ fontSize: "14px", color: "#aaa", fontFamily: "Arial, sans-serif" }}>
                No hay carritos abandonados.
              </p>
            ) : (
              <table className="dash-tabla">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Productos</th>
                    <th>Cant. items</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {carritos.map(c => (
                    <>
                      <tr key={c.idCarrito}
                        onClick={() => setCarritoAbierto(carritoAbierto === c.idCarrito ? null : c.idCarrito)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{c.mUsuario?.nombreCliente || c.mUsuario?.idCliente || "—"}</td>
                        <td>{c.fecha}</td>
                        <td style={{ fontSize: "12px", color: "#888" }}>
                          {c.mCarritoItems?.length || 0} producto(s)
                        </td>
                        <td>{c.mCarritoItems?.reduce((sum, i) => sum + (i.cantidad || 0), 0) || 0}</td>
                        <td style={{ textAlign: "center" }}>
                          {carritoAbierto === c.idCarrito ? "▲" : "▼"}
                        </td>
                      </tr>
                      {carritoAbierto === c.idCarrito && (
                        <tr key={c.idCarrito + "-detalle"}>
                          <td colSpan="5" style={{ background: "#f9f9f9", padding: "16px" }}>
                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                              {c.mCarritoItems?.map(i => {
                                const prod = productos.find(p => p.idProducto === i.id?.idProductoFK);
                                return (
                                  <div key={i.id?.idProductoFK} style={{ textAlign: "center" }}>
                                    <img
                                      src={prod ? `/imagenes/${prod.imagen}` : "/logo.png"}
                                      alt={prod?.nombreProducto || i.id?.idProductoFK}
                                      onError={(e) => { e.target.src = "/logo.png"; }}
                                      style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid #eee" }}
                                    />
                                    <p style={{ fontSize: "11px", fontWeight: "bold", marginTop: "4px" }}>{prod?.nombreProducto || i.id?.idProductoFK}</p>
                                    <p style={{ fontSize: "11px", color: "#888" }}>x{i.cantidad}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
