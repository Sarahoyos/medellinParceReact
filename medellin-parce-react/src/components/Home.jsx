import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/home.css";

const Home = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDescuento = (e) => {
    e.preventDefault();
    e.target.reset();
  };

  return (
    <div>

      {/* Header */}
      <header>
        <div className="logo">
          <a href="/home">
            <img src="/logo.png" alt="Medellín Parce Logo" />
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

      {/* Slogan */}
      <section className="slogan">
        <h2>PRENDAS DE PARCEROS PARA PARCEROS.</h2>
      </section>

      {/* Imagen intermedia con overlay */}
      <section className="banner-intermedio">
        <img src="/main.jpg" alt="Barrio de Medellín" />
        <div className="overlay-text">EL DISEÑO MÁS PAISA!!</div>
      </section>

      {/* Sub-slogan */}
      <section className="sub-slogan">
        <h2>MEDELLIN PARCE UNA MARCA 100% PAISA.</h2>
      </section>

      {/* Galería */}
      <section className="galeria">
        <div className="grid-galeria">
          <img src="/imagenes/Camiseta hombre.jpg" alt="Foto 1" />
          <img src="/imagenes/Camiseta mujer.jpg" alt="Foto 2" />
          <img src="/imagenes/Sweaters.jpg" alt="Foto 3" />
          <img src="/imagenes/Busos.jpg" alt="Foto 4" />
        </div>
      </section>

      {/* Formulario */}
      <section className="formulario">
        <form onSubmit={handleDescuento}>
          <h2>Registrate y obtén un 20% de descuento en tu primera compra!</h2>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input type="text" id="nombre" name="nombre" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="celular">Celular</label>
            <input type="tel" id="celular" name="celular" required />
          </div>
          <button type="submit">Enviar</button>
        </form>
      </section>

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

export default Home;
