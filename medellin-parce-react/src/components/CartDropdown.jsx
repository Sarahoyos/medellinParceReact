import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function CartDropdown() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cart.length > 0) {
      setCartOpen(false);
      navigate("/orden-compra");
    } else {
      alert("⚠️ El carrito está vacío.");
    }
  };

  const formatearPrecio = (valor) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);

  return (
    <li
      className="cart-icon-container"
      onClick={(e) => { e.stopPropagation(); setCartOpen(!cartOpen); }}
    >
      <i className="fas fa-shopping-cart cart-icon"></i>

      {totalItems > 0 && (
        <span className="cart-count show">{totalItems}</span>
      )}

      <div
        className={`cart-dropdown ${cartOpen ? "show" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cart-content">
          {cart.length === 0 && (
            <p style={{ textAlign: "center", padding: "10px", color: "#888" }}>
              El carrito está vacío
            </p>
          )}

          {cart.map((item) => (
            <div className="cart-item" key={item.idProducto}>
              <span>{item.name}</span>
              <div className="cart-item-controls">
                <button onClick={() => updateQuantity(item.idProducto, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.idProducto, item.quantity + 1)}>+</button>
              </div>
              <span>{formatearPrecio(item.price * item.quantity)}</span>
              <button className="remove-btn" onClick={() => removeFromCart(item.idProducto)}>×</button>
            </div>
          ))}

          <div className="cart-total">
            <strong>Total: {formatearPrecio(totalPrice)}</strong>
          </div>

          {cart.length > 0 && (
            <button className="checkout-btn" onClick={handleCheckout}>
              Pagar
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
