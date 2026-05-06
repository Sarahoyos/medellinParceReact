import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import CartDropdown from "./CartDropdown";
import "../styles/productos.css";

const EnDesarrollo = ({ pagina = "Esta página" }) => {
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
          <a href="/home"><img src="/logo.png" alt="logo" /></a>
        </div>
        <nav>
          <ul>
            <li><a href="/home">INICIO</a></li>
            <li><a href="/productos">PRODUCTOS</a></li>
            <li><a href="/blog">BLOG</a></li>
            <li><a href="/nosotros">NOSOTROS</a></li>

            {!usuario && (
              <li id="auth-section">
                <a href="/login">INICIAR SESION</a>
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

      {/* Contenido */}
      <main style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "40px 20px",
        fontFamily: "'Arial Black', Arial, sans-serif",
        textAlign: "center",
      }}>
        <div style={{
          background: "rgba(90, 106, 95, 0.35)",
          borderRadius: "15px",
          padding: "50px 40px",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🚧</div>
          <h1 style={{
            fontSize: "2rem",
            fontWeight: "900",
            margin: "0 0 16px",
            color: "#000",
          }}>
            EN DESARROLLO
          </h1>
          <p style={{
            fontSize: "1rem",
            color: "#444",
            margin: "0 0 30px",
            fontFamily: "Arial, sans-serif",
            fontWeight: "normal",
            lineHeight: "1.5",
          }}>
            {pagina} está siendo construida por nuestro equipo.<br />
            ¡Vuelve pronto parcero!
          </p>
          <button
            onClick={() => navigate("/home")}
            style={{
              background: "rgba(0,0,0,0.7)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "14px 30px",
              fontSize: "15px",
              fontFamily: "'Arial Black', Arial, sans-serif",
              fontWeight: "900",
              letterSpacing: "2px",
              cursor: "pointer",
              transition: "background 0.3s",
            }}
            onMouseOver={(e) => e.target.style.background = "#4a564e"}
            onMouseOut={(e) => e.target.style.background = "rgba(0,0,0,0.7)"}
          >
            VOLVER AL INICIO
          </button>
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

export default EnDesarrollo;
