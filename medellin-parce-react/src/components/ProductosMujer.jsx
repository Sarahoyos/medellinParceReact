import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { productosApi } from "../services/api";
import CartDropdown from "./CartDropdown";
import "../styles/productos.css";

const ProductosMujer = () => {
  const { usuario, logout } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await productosApi.getAll();
        const mujer = data.filter((p) =>
          p.nombreProducto?.toLowerCase().includes("mujer") ||
          p.descripcion?.toLowerCase().includes("mujer")
        );
        setProductos(mujer);
      } catch (err) {
        setError("No se pudieron cargar los productos.");
        console.error(err);
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);

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

            {!usuario && (
              <li id="auth-section">
                <Link to="/login">INICIAR SESION</Link>
              </li>
            )}

            {usuario && (
              <li id="perfil-usuario" style={{ display: "block" }}>
                <img src="/imagenes/image copy.png" alt="Icono de usuario" className="icono-usuario" />
                <div className="dropdown-contenido">
                  <a href="/perfil">Mi Perfil</a>
                  <a onClick={handleLogout} style={{ cursor: "pointer" }}>Cerrar Sesión</a>
                </div>
              </li>
            )}

            <CartDropdown />
          </ul>
        </nav>
      </header>

      {/* Productos */}
      <main className="main-content">
        <h1 className="category-title">Colección Mujer</h1>

        {cargando && (
          <p style={{ textAlign: "center", padding: "40px" }}>Cargando productos...</p>
        )}

        {error && (
          <p style={{ textAlign: "center", color: "#cc0000", padding: "20px" }}>{error}</p>
        )}

        {!cargando && !error && productos.length === 0 && (
          <p style={{ textAlign: "center", padding: "40px" }}>
            No hay productos disponibles.
          </p>
        )}

        <div className="product-grid">
          {productos.map((p) => (
            <div className="product-card" key={p.idProducto}>
              <img
                src={`/imagenes/${p.imagen}`}
                alt={p.nombreProducto}
                onError={(e) => { e.target.src = "/imagenes/placeholder.jpg"; }}
              />
              <h2 className="product-name">{p.nombreProducto}</h2>
              <p style={{ fontSize: "14px", color: "#555", margin: "4px 0" }}>
                Talla: {p.talla} | Color: {p.color}
              </p>
              <p className="product-price">{formatearPrecio(p.precio)}</p>
              <button
                className="add-to-cart-btn"
                onClick={() => addToCart(p.nombreProducto, p.precio, p.idProducto, usuario)}
              >
                Agregar
              </button>
            </div>
          ))}
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

export default ProductosMujer;
