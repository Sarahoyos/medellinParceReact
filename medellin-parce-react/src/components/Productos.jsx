import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/productos.css";

const categorias = [
  {
    img: "/imagenes/Camiseta hombre.jpg",
    alt: "Camisetas Hombre",
    label: <>CAMISETAS<br />HOMBRE</>,
    href: "/productos/camisetas-hombre"
  },
  {
    img: "/imagenes/Camiseta mujer.jpg",
    alt: "Camisetas Mujer",
    label: <>CAMISETAS<br />MUJER</>,
    href: "/productos/camisetas-mujer"
  },
  {
    img: "/imagenes/Sweaters.jpg",
    alt: "Sweaters",
    label: <>SWEATERS</>,
    href: "/productos/sweaters"
  },
  {
    img: "/imagenes/Busos.jpg",
    alt: "Chompas",
    label: <>CHOMPAS</>,
    href: "/productos/chompas"
  }
];

const Productos = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>

      {/* Header */}
      <header>
        <div className="logo">
          <a href="/home">
            <img src="/logo.png" alt="logo" />
          </a>
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
                <img
                  src="/imagenes/image copy.png"
                  alt="Icono de usuario"
                  className="icono-usuario"
                />
                <div className="dropdown-contenido">
                  <a href="/perfil">Mi Perfil</a>
                  <a onClick={handleLogout} style={{ cursor: "pointer" }}>
                    Cerrar Sesión
                  </a>
                </div>
              </li>
            )}
          </ul>
        </nav>
      </header>

      {/* Productos */}
      <main>
        <section id="productos">
          <h1>NUESTROS PRODUCTOS</h1>
          <div className="grid">
            {categorias.map((cat, i) => (
              <div className="card" key={i}>
                <a href={cat.href}>
                  <img src={cat.img} alt={cat.alt} />
                </a>
                <span>{cat.label}</span>
              </div>
            ))}
          </div>
        </section>
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

export default Productos;
