import React from "react";

import "../styles/home.css";
// import logo from "./logo.png"; 
// import mainImg from "./main.jpg"; 
// import camHombre from "../paginaIntermedia/imagenes/Camiseta hombre.jpg";
// import camMujer from "../paginaIntermedia/imagenes/Camiseta mujer.jpg";
// import sweaters from "../paginaIntermedia/imagenes/Sweaters.jpg";
// import busos from "../paginaIntermedia/imagenes/Busos.jpg";
// import userIcon from "../modificacionDatos/image copy.png";

const Home = () => {




  return (
    <div>
      {/* Header */}
      <header>
        <div className="logo">
          <a href="/home">
            {/* <img src= alt="Medellín Parce Logo" /> */}
          </a>
        </div>
        <nav>
          <ul>
            <li><a href="/home">INICIO</a></li>
            <li><a href="/productos">PRODUCTOS</a></li>
            <li><a href="#">BLOG</a></li>
            <li><a href="#">NOSOTROS</a></li>
            <li id="auth-section">

            </li>
            <li id="perfil-usuario">
              {/* <img src={userIcon} alt="Icono de usuario" className="icono-usuario" /> */}
              <div className="dropdown-contenido">
                <a href="/perfil">Mi Perfil</a>
                <a href="/login">Cerrar Sesión</a>
              </div>
            </li>
          </ul>
        </nav>
      </header>

      {/* Slogan */}
      <section className="slogan">
        <h2>PRENDAS DE PARCEROS PARA PARCEROS.</h2>
      </section>

      {/* Imagen intermedia con overlay */}
      <section className="banner-intermedio">
        {/* <img src={mainImg} alt="Barrio de Medellín" /> */}
        <div className="overlay-text">EL DISEÑO MÁS PAISA!!</div>
      </section>

      {/* Sub-slogan */}
      <section className="sub-slogan">
        <h2>MEDELLIN PARCE UNA MARCA 100% PAISA.</h2>
      </section>

      {/* Galería */}
      <section className="galeria">
        <div className="grid-galeria">
          {/* <img src={camHombre} alt="Camiseta Hombre" />
          <img src={camMujer} alt="Camiseta Mujer" />
          <img src={sweaters} alt="Sweaters" />
          <img src={busos} alt="Busos" /> */}
        </div>
      </section>

      {/* Formulario */}
      <section className="formulario">
        <form>
          <h2>Regístrate y obtén un 20% de descuento en tu primera compra!</h2>
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
          {/* <img src={logo} alt="Logo Medellín Parce" /> */}
        </div>
      </footer>
    </div>
  );
};

export default Home;