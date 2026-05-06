import { createContext, useContext, useState, useEffect } from "react";
import { carritosApi, carritoItemsApi } from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [carritoId, setCarritoId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const savedCarritoId = localStorage.getItem("carritoId");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedCarritoId) setCarritoId(savedCarritoId);
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const inicializarCarrito = async (usuario) => {
    if (carritoId) return carritoId;

    try {
      const id = `CAR-${usuario.idCliente}-${Date.now()}`;
      const fecha = new Date().toISOString().split("T")[0];

      await carritosApi.crear({
        idCarrito: id,
        fecha,
        items: 0,
        total: 0,
        mUsuario: { idCliente: usuario.idCliente },
      });

      setCarritoId(id);
      localStorage.setItem("carritoId", id);
      return id;
    } catch (err) {
      console.error("Error al crear carrito:", err);
      return null;
    }
  };

  const addToCart = async (nombre, precio, idProducto, usuario) => {
    // ✅ Forzar precio a número
    const precioNum = Number(precio);

    setCart((prev) => {
      const existing = prev.find((item) => item.idProducto === idProducto);
      if (existing) {
        return prev.map((item) =>
          item.idProducto === idProducto
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { name: nombre, price: precioNum, idProducto, quantity: 1 }];
    });

    if (usuario) {
      try {
        const idCarrito = await inicializarCarrito(usuario);
        if (!idCarrito || !idProducto) return;

        await carritoItemsApi.crear({
          id: { idProductoFK: idProducto, idCarritoFK: idCarrito },
          cantidad: 1,
          mProducto: { idProducto },
          mCarrito: { idCarrito },
        });
      } catch (err) {
        console.error("Error al agregar item al carrito:", err);
      }
    }
  };

  const removeFromCart = async (idProducto) => {
    setCart((prev) => prev.filter((item) => item.idProducto !== idProducto));

    if (carritoId && idProducto) {
      try {
        await carritoItemsApi.eliminar(idProducto, carritoId);
      } catch (err) {
        console.error("Error al eliminar item:", err);
      }
    }
  };

  const updateQuantity = async (idProducto, newQuantity) => {
    if (newQuantity < 1) return;

    setCart((prev) =>
      prev.map((item) =>
        item.idProducto === idProducto
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    if (carritoId && idProducto) {
      try {
        await carritoItemsApi.modificar(idProducto, carritoId, {
          id: { idProductoFK: idProducto, idCarritoFK: carritoId },
          cantidad: newQuantity,
          mProducto: { idProducto },
          mCarrito: { idCarrito: carritoId },
        });
      } catch (err) {
        console.error("Error al actualizar cantidad:", err);
      }
    }
  };

  const clearCart = () => {
    setCart([]);
    setCarritoId(null);
    localStorage.removeItem("cart");
    localStorage.removeItem("carritoId");
  };

  // ✅ Asegurar que quantity sea número
  const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity), 0);
  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cart,
      carritoId,
      cartOpen,
      setCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      inicializarCarrito,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
