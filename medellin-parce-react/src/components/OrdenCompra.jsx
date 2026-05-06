import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ordenCompraApi } from "../services/api";
import CartDropdown from "./CartDropdown";
import "../styles/ordenCompra.css";

const OrdenCompra = () => {
  const { usuario, logout } = useAuth();
  const { cart, updateQuantity, removeFromCart, totalPrice, clearCart, carritoId } = useCart();
  const navigate = useNavigate();

  const subtotal = totalPrice;
  const descuento = subtotal * 0.20;
  const iva = (subtotal - descuento) * 0.19;
  const total = subtotal - descuento + iva;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleFinalizar = async () => {
    if (cart.length === 0) {
      alert("⚠️ El carrito está vacío.");
      return;
    }

    try {
      const fecha = new Date().toISOString().split("T")[0];

      // idCompra máximo 10 caracteres
      const idCompra = `O${Date.now()}`.slice(0, 10);
      // cliente máximo 10 caracteres
      const cliente = usuario.idCliente.slice(0, 10);

      await ordenCompraApi.crear({
        idCompra,
        numeroOrden: idCompra,
        cliente,
          listaProductos: cart.map(item => item.idProducto).join(","),
        fecha,
        total: Math.round(total),

      });

      alert("✅ ¡Compra finalizada parcero! Gracias por tu pedido.");
      clearCart();
      navigate("/home");
    } catch (err) {
      console.error("Error al finalizar compra:", err);
      alert("❌ Error al procesar la compra. Intenta de nuevo.");
    }
  };

  const formatearPrecio = (valor) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);

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

      {/* Main */}
      <main id="contenedor">
        <section id="factura">
          <h2 id="titulo-factura">Resumen de compra</h2>
          <small id="numero-factura">#{carritoId || "---"}</small>

          {/* Info del cliente */}
          <div id="cliente-info">
            {usuario && (
              <>
                <p><strong>Cliente:</strong> {usuario.nombreCliente}</p>
                <p><strong>Correo:</strong> {usuario.correoElectronico}</p>
                {usuario.direccionEnvio && (
                  <p><strong>Dirección:</strong> {usuario.direccionEnvio}</p>
                )}
              </>
            )}
          </div>

          {/* Tabla de productos */}
          <div id="productos">
            <h3>📦 Productos añadidos</h3>
            <table id="tabla-productos">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="lista-productos">
                {cart.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                      No hay productos en el carrito
                    </td>
                  </tr>
                )}
                {cart.map((item) => (
                  <tr key={item.idProducto}>
                    <td>{item.name}</td>
                    <td>{formatearPrecio(item.price)}</td>
                    <td>
                      <button className="btn-cantidad"
                        onClick={() => updateQuantity(item.idProducto, item.quantity - 1)}>-</button>
                      {item.quantity}
                      <button className="btn-cantidad"
                        onClick={() => updateQuantity(item.idProducto, item.quantity + 1)}>+</button>
                    </td>
                    <td>{formatearPrecio(item.price * item.quantity)}</td>
                    <td>
                      <button className="btn-eliminar"
                        onClick={() => removeFromCart(item.idProducto)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div id="totales">
            <p><strong>Subtotal:</strong> {formatearPrecio(subtotal)}</p>
            <p><strong>Descuento (20%):</strong> -{formatearPrecio(descuento)}</p>
            <p><strong>IVA (19%):</strong> {formatearPrecio(iva)}</p>
            <h3 id="total-pagar">TOTAL A PAGAR: {formatearPrecio(total)}</h3>
          </div>

          <button id="btn-finalizar" onClick={handleFinalizar}>
            Finalizar compra
          </button>
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

export default OrdenCompra;
