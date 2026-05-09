import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usuariosApi, productosApi, ordenCompraApi, carritosApi } from "../services/api";
import "../styles/dashboard.css";

const SECCIONES = [
  { key: "resumen",   label: "📊 Resumen" },
  { key: "usuarios",  label: "👤 Usuarios" },
  { key: "productos", label: "👕 Productos" },
  { key: "ordenes",   label: "📦 Órdenes" },
  { key: "analitica", label: "📈 Analítica" },
  { key: "carritos",  label: "🛒 Carritos abandonados" },
  { key: "graficos",  label: "🖼️ Gráficos Python" },
];

const Dashboard = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [seccion, setSeccion] = useState("resumen");
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [carritos, setCarritos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [formProducto, setFormProducto] = useState({ idProducto: "", nombreProducto: "", talla: "", color: "", precio: "", descripcion: "", imagen: "", categoria: "" });
  const [editandoProducto, setEditandoProducto] = useState(null);
  const [mensajeProducto, setMensajeProducto] = useState(null);

  const [confirmarDesactivar, setConfirmarDesactivar] = useState(null);
  const [confirmarActivar, setConfirmarActivar] = useState(null);
  const [formUsuario, setFormUsuario] = useState({ idCliente: "", nombreCliente: "", correoElectronico: "", password: "", direccionEnvio: "", numeroTelefono: "", rol: "admin" });
  const [mensajeUsuario, setMensajeUsuario] = useState(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(false);

  const [carritoAbierto, setCarritoAbierto] = useState(null);
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [u, p, o, c] = await Promise.all([
          usuariosApi.getAllTodos(),
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

  const cambiarSeccion = (key) => {
    setSeccion(key);
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const formatearPrecio = (valor) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(valor || 0);

  // ── USUARIOS ──
  const handleDesactivar = async (u) => {
    try {
      await usuariosApi.eliminar(u.idCliente);
      setUsuarios(await usuariosApi.getAllTodos());
    } catch (err) { console.error(err); }
    finally { setConfirmarDesactivar(null); }
  };

  const handleActivar = async (u) => {
    try {
      await usuariosApi.modificar(u.idCliente, { ...u, activo: true });
      setUsuarios(await usuariosApi.getAllTodos());
    } catch (err) { console.error(err); }
  };

  const handleCrearAdmin = async (e) => {
    e.preventDefault();
    setCargandoUsuario(true);
    try {
      await usuariosApi.crear({ ...formUsuario });
      setMensajeUsuario({ tipo: "exito", texto: "✓ Administrador creado." });
      setFormUsuario({ idCliente: "", nombreCliente: "", correoElectronico: "", password: "", direccionEnvio: "", numeroTelefono: "", rol: "admin" });
      setUsuarios(await usuariosApi.getAllTodos());
    } catch (err) {
      setMensajeUsuario({ tipo: "error", texto: err.message || "Error al crear." });
    } finally { setCargandoUsuario(false); }
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
        await productosApi.modificar(editandoProducto, { ...formProducto, precio: parseInt(formProducto.precio) });
        setMensajeProducto({ tipo: "exito", texto: "✓ Producto actualizado." });
      } else {
        await productosApi.crear({ ...formProducto, precio: parseInt(formProducto.precio) });
        setMensajeProducto({ tipo: "exito", texto: "✓ Producto creado." });
      }
      setProductos(await productosApi.getAll());
      setFormProducto({ idProducto: "", nombreProducto: "", talla: "", color: "", precio: "", descripcion: "", imagen: "", categoria: "" });
      setEditandoProducto(null);
    } catch (err) { setMensajeProducto({ tipo: "error", texto: "Error al guardar." }); }
  };

  const handleEditarProducto = (p) => {
    setFormProducto({ idProducto: p.idProducto, nombreProducto: p.nombreProducto, talla: p.talla, color: p.color, precio: p.precio, descripcion: p.descripcion, imagen: p.imagen || "", categoria: p.categoria || "" });
    setEditandoProducto(p.idProducto);
    cambiarSeccion("productos");
  };

  const handleEliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await productosApi.eliminar(id);
      setProductos(prev => prev.filter(p => p.idProducto !== id));
    } catch (err) { console.error(err); }
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

  const renderSeccion = () => {
    switch (seccion) {

      case "resumen":
        return (
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
        );

      case "usuarios":
        return (
          <div>
            <h1 className="dash-titulo">Gestión de usuarios</h1>

            <div className="dash-form-container">
              <h2>Crear nuevo administrador</h2>
              <form onSubmit={handleCrearAdmin} className="dash-form">
                <div className="dash-form-grid">
                  <div className="dash-form-grupo">
                    <label>ID</label>
                    <input type="text" value={formUsuario.idCliente} onChange={e => setFormUsuario(p => ({ ...p, idCliente: e.target.value }))} placeholder="ej: ADMIN002" required />
                  </div>
                  <div className="dash-form-grupo">
                    <label>Nombre completo</label>
                    <input type="text" value={formUsuario.nombreCliente} onChange={e => setFormUsuario(p => ({ ...p, nombreCliente: e.target.value }))} required />
                  </div>
                  <div className="dash-form-grupo">
                    <label>Correo</label>
                    <input type="email" value={formUsuario.correoElectronico} onChange={e => setFormUsuario(p => ({ ...p, correoElectronico: e.target.value }))} required />
                  </div>
                  <div className="dash-form-grupo">
                    <label>Contraseña</label>
                    <input type="password" value={formUsuario.password} onChange={e => setFormUsuario(p => ({ ...p, password: e.target.value }))} required />
                  </div>
                  <div className="dash-form-grupo">
                    <label>Dirección</label>
                    <input type="text" value={formUsuario.direccionEnvio} onChange={e => setFormUsuario(p => ({ ...p, direccionEnvio: e.target.value }))} />
                  </div>
                  <div className="dash-form-grupo">
                    <label>Teléfono</label>
                    <input type="tel" value={formUsuario.numeroTelefono} onChange={e => setFormUsuario(p => ({ ...p, numeroTelefono: e.target.value }))} />
                  </div>
                </div>
                {mensajeUsuario && <div className={`dash-mensaje ${mensajeUsuario.tipo}`}>{mensajeUsuario.texto}</div>}
                <button type="submit" className="dash-btn-guardar" disabled={cargandoUsuario}>
                  {cargandoUsuario ? "Creando..." : "Crear administrador"}
                </button>
              </form>
            </div>

            {confirmarDesactivar && (
              <div className="dash-modal-overlay">
                <div className="dash-modal">
                  <p>¿Desactivar la cuenta de <strong>{confirmarDesactivar.nombreCliente}</strong>?</p>
                  <p style={{ fontSize: "13px", color: "#888", marginTop: "6px" }}>El usuario no podrá iniciar sesión.</p>
                  <div className="dash-modal-botones">
                    <button className="dash-btn-accion desactivar" onClick={() => handleDesactivar(confirmarDesactivar)}>Sí, desactivar</button>
                    <button className="dash-btn-accion activar" onClick={() => setConfirmarDesactivar(null)}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}

            {confirmarActivar && (
              <div className="dash-modal-overlay">
                <div className="dash-modal">
                  <p>¿Reactivar la cuenta de <strong>{confirmarActivar.nombreCliente}</strong>?</p>
                  <p style={{ fontSize: "13px", color: "#888", marginTop: "6px" }}>El usuario podrá volver a iniciar sesión.</p>
                  <div className="dash-modal-botones">
                    <button className="dash-btn-accion activar" onClick={() => { handleActivar(confirmarActivar); setConfirmarActivar(null); }}>Sí, activar</button>
                    <button className="dash-btn-accion desactivar" onClick={() => setConfirmarActivar(null)}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}

            <table className="dash-tabla">
              <thead>
                <tr>
                  <th>ID</th><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Rol</th><th>Estado</th><th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.idCliente}>
                    <td>{u.idCliente}</td>
                    <td>{u.nombreCliente}</td>
                    <td>{u.correoElectronico}</td>
                    <td>{u.numeroTelefono}</td>
                    <td><span className={`dash-badge ${u.rol === "admin" ? "activo" : "inactivo"}`}>{u.rol || "usuario"}</span></td>
                    <td><span className={`dash-badge ${u.activo ? "activo" : "inactivo"}`}>{u.activo ? "Activo" : "Inactivo"}</span></td>
                    <td>
                      {u.idCliente !== "ADMIN001" && (
                        u.activo
                          ? <button className="dash-btn-accion desactivar" onClick={() => setConfirmarDesactivar(u)}>Desactivar</button>
                          : <button className="dash-btn-accion activar" onClick={() => setConfirmarActivar(u)}>Activar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "productos":
        return (
          <div>
            <h1 className="dash-titulo">Gestión de productos</h1>
            <div className="dash-form-container">
              <h2>{editandoProducto ? "Editar producto" : "Nuevo producto"}</h2>
              <form onSubmit={handleGuardarProducto} className="dash-form">
                <div className="dash-form-grid">
                  <div className="dash-form-grupo">
                    <label htmlFor="idProducto">ID Producto</label>
                    <input type="text" id="idProducto" value={formProducto.idProducto} onChange={handleProductoChange} required disabled={!!editandoProducto} />
                  </div>
                  <div className="dash-form-grupo">
                    <label htmlFor="nombreProducto">Nombre</label>
                    <input type="text" id="nombreProducto" value={formProducto.nombreProducto} onChange={handleProductoChange} required />
                  </div>
                  <div className="dash-form-grupo">
                    <label htmlFor="talla">Talla</label>
                    <input type="text" id="talla" value={formProducto.talla} onChange={handleProductoChange} required />
                  </div>
                  <div className="dash-form-grupo">
                    <label htmlFor="color">Color</label>
                    <input type="text" id="color" value={formProducto.color} onChange={handleProductoChange} required />
                  </div>
                  <div className="dash-form-grupo">
                    <label htmlFor="precio">Precio (COP)</label>
                    <input type="number" id="precio" value={formProducto.precio} onChange={handleProductoChange} required />
                  </div>
                  <div className="dash-form-grupo">
                    <label htmlFor="imagen">Imagen</label>
                    <input type="text" id="imagen" value={formProducto.imagen} onChange={handleProductoChange} placeholder="ej: camiseta.jpg" />
                  </div>
                  <div className="dash-form-grupo">
                    <label htmlFor="categoria">Categoría</label>
                    <select id="categoria" value={formProducto.categoria} onChange={handleProductoChange} style={{ padding: "9px 12px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", fontFamily: "Arial, sans-serif", outline: "none" }}>
                      <option value="">Seleccionar...</option>
                      <option value="hombre">Camisetas Hombre</option>
                      <option value="mujer">Camisetas Mujer</option>
                      <option value="sweaters">Sweaters</option>
                      <option value="chompas">Chompas</option>
                    </select>
                  </div>
                  <div className="dash-form-grupo dash-form-full">
                    <label htmlFor="descripcion">Descripción</label>
                    <input type="text" id="descripcion" value={formProducto.descripcion} onChange={handleProductoChange} required />
                  </div>
                </div>
                {mensajeProducto && <div className={`dash-mensaje ${mensajeProducto.tipo}`}>{mensajeProducto.texto}</div>}
                <div className="dash-form-botones">
                  <button type="submit" className="dash-btn-guardar">{editandoProducto ? "Actualizar" : "Crear producto"}</button>
                  {editandoProducto && (
                    <button type="button" className="dash-btn-cancelar" onClick={() => { setEditandoProducto(null); setFormProducto({ idProducto: "", nombreProducto: "", talla: "", color: "", precio: "", descripcion: "", imagen: "", categoria: "" }); }}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
            <table className="dash-tabla">
              <thead>
                <tr><th>ID</th><th>Imagen</th><th>Nombre</th><th>Talla</th><th>Color</th><th>Precio</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.idProducto}>
                    <td>{p.idProducto}</td>
                    <td><img src={`/imagenes/${p.imagen}`} alt={p.nombreProducto} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }} onError={(e) => { e.target.src = "/logo.png"; }} /></td>
                    <td>{p.nombreProducto}</td>
                    <td>{p.talla}</td>
                    <td>{p.color}</td>
                    <td>{formatearPrecio(p.precio)}</td>
                    <td>
                      <button className="dash-btn-accion activar" onClick={() => handleEditarProducto(p)}>Editar</button>
                      <button className="dash-btn-accion desactivar" style={{ marginLeft: "6px" }} onClick={() => handleEliminarProducto(p.idProducto)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "ordenes":
        return (
          <div>
            <h1 className="dash-titulo">Todas las órdenes</h1>
            <table className="dash-tabla">
              <thead>
                <tr><th>ID Orden</th><th>Cliente</th><th>Fecha compra</th><th>Fecha entrega</th><th>Productos</th><th>Total</th></tr>
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
        );

      case "analitica":
        return (
          <div>
            <h1 className="dash-titulo">Analítica de ventas</h1>

            <div className="dash-analitica-seccion">
              <h2>Ingresos por mes</h2>
              <div className="dash-barras">
                {Object.entries(ingresosPorMes).sort((a, b) => a[0] - b[0]).map(([mes, total]) => {
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

            <div className="dash-analitica-seccion">
              <h2>Productos más vendidos</h2>
              <table className="dash-tabla">
                <thead><tr><th>Producto</th><th>Unidades vendidas</th></tr></thead>
                <tbody>
                  {productosMasVendidos.map(([id, cant]) => {
                    const prod = productos.find(p => p.idProducto === id);
                    return <tr key={id}><td>{prod?.nombreProducto || id}</td><td>{cant}</td></tr>;
                  })}
                </tbody>
              </table>
            </div>

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
        );

      case "carritos":
        return (
          <div>
            <h1 className="dash-titulo">Carritos abandonados</h1>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "20px", fontFamily: "Arial, sans-serif" }}>
              Usuarios que agregaron productos al carrito pero no completaron la compra.
            </p>
            {carritos.length === 0 ? (
              <p style={{ fontSize: "14px", color: "#aaa" }}>No hay carritos abandonados.</p>
            ) : (
              <table className="dash-tabla">
                <thead>
                  <tr><th>Cliente</th><th>Fecha</th><th>Productos</th><th>Cant. items</th><th></th></tr>
                </thead>
                <tbody>
                  {carritos.map(c => (
                    <>
                      <tr key={c.idCarrito} onClick={() => setCarritoAbierto(carritoAbierto === c.idCarrito ? null : c.idCarrito)} style={{ cursor: "pointer" }}>
                        <td>{c.mUsuario?.nombreCliente || "—"}</td>
                        <td>{c.fecha}</td>
                        <td style={{ fontSize: "12px", color: "#888" }}>{c.mCarritoItems?.length || 0} producto(s)</td>
                        <td>{c.mCarritoItems?.reduce((sum, i) => sum + (i.cantidad || 0), 0) || 0}</td>
                        <td style={{ textAlign: "center" }}>{carritoAbierto === c.idCarrito ? "▲" : "▼"}</td>
                      </tr>
                      {carritoAbierto === c.idCarrito && (
                        <tr key={c.idCarrito + "-det"}>
                          <td colSpan="5" style={{ background: "#f9f9f9", padding: "16px" }}>
                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                              {c.mCarritoItems?.map(i => {
                                const prod = productos.find(p => p.idProducto === i.id?.idProductoFK);
                                return (
                                  <div key={i.id?.idProductoFK} style={{ textAlign: "center" }}>
                                    <img src={prod ? `/imagenes/${prod.imagen}` : "/logo.png"} alt={prod?.nombreProducto} onError={(e) => { e.target.src = "/logo.png"; }} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid #eee" }} />
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
        );

      case "graficos":
        return (
          <div>
            <h1 className="dash-titulo">Gráficos Python</h1>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "20px", fontFamily: "Arial, sans-serif" }}>
              Gráficos generados por la rutina de analítica Python. Coloca los PNG en <code>public/graficos/</code>.
            </p>
            <button onClick={() => setTimestamp(Date.now())} className="dash-btn-guardar" style={{ marginBottom: "24px" }}>
              🔄 Actualizar gráficos
            </button>
            <div className="dash-graficos-grid">
              {[
                { archivo: "ingresos_por_mes.png",     titulo: "Ingresos por mes" },
                { archivo: "ordenes_por_mes.png",      titulo: "Órdenes por mes" },
                { archivo: "top_clientes.png",         titulo: "Top 10 clientes" },
                { archivo: "distribucion_totales.png", titulo: "Distribución de totales" },
                { archivo: "precios_productos.png",    titulo: "Precio por producto" },
              ].map(({ archivo, titulo }) => (
                <div className="dash-grafico-card" key={archivo}>
                  <h2>{titulo}</h2>
                  <img src={`/graficos/${archivo}?t=${timestamp}`} alt={titulo}
                    onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                  <div className="dash-grafico-placeholder" style={{ display: "none" }}>
                    <p>Gráfico no disponible</p>
                    <small>Corre <code>python main.py</code> y copia los PNG a <code>public/graficos/</code></small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dash-wrapper">
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <img src="/logo.png" alt="logo" />
          <span>ADMIN</span>
        </div>
        <nav className="dash-nav">
          {SECCIONES.map(item => (
            <button key={item.key} className={`dash-nav-btn ${seccion === item.key ? "activo" : ""}`} onClick={() => cambiarSeccion(item.key)}>
              {item.label}
            </button>
          ))}
        </nav>
        <button className="dash-logout" onClick={handleLogout}>Cerrar sesión</button>
      </aside>

      <main className="dash-main">
        {renderSeccion()}
      </main>
    </div>
  );
};

export default Dashboard;
