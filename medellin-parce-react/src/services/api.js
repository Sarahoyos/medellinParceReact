const BASE_URL = "http://localhost:8080";

// ============================================
// USUARIOS
// ============================================
export const usuariosApi = {

  // Obtener todos los usuarios
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/usuarios`);
    if (!res.ok) throw new Error("Error al obtener usuarios");
    return res.json();
  },

  // Obtener usuario por ID
  getById: async (id) => {
    const res = await fetch(`${BASE_URL}/usuarios/${id}`);
    if (!res.ok) throw new Error("Usuario no encontrado");
    return res.json();
  },

  // Crear usuario (registro)
  crear: async (usuario) => {
    const res = await fetch(`${BASE_URL}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Error al crear usuario");
    }
    return res.json();
  },

  // Modificar usuario
  modificar: async (id, usuario) => {
    const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario),
    });
    if (!res.ok) throw new Error("Error al modificar usuario");
    return res.json();
  },

  // Login — busca entre todos los usuarios y valida credenciales
  login: async (correoElectronico, password) => {
    const usuarios = await usuariosApi.getAll();
    const usuario = usuarios.find(
      (u) =>
        u.correoElectronico === correoElectronico &&
        u.password === password &&
        u.activo !== false
    );
    if (!usuario) throw new Error("Correo o contraseña incorrectos");
    return usuario;
  },
};

// ============================================
// PRODUCTOS
// ============================================
export const productosApi = {

  // Obtener todos los productos
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/productos`);
    if (!res.ok) throw new Error("Error al obtener productos");
    return res.json();
  },

  // Obtener producto por ID
  getById: async (id) => {
    const res = await fetch(`${BASE_URL}/productos/${id}`);
    if (!res.ok) throw new Error("Producto no encontrado");
    return res.json();
  },

  // Crear producto
  crear: async (producto) => {
    const res = await fetch(`${BASE_URL}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });
    if (!res.ok) throw new Error("Error al crear producto");
    return res.json();
  },
};

// ============================================
// CARRITOS
// ============================================
export const carritosApi = {

  // Obtener todos los carritos
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/carritos`);
    if (!res.ok) throw new Error("Error al obtener carritos");
    return res.json();
  },

  // Crear carrito
  crear: async (carrito) => {
    const res = await fetch(`${BASE_URL}/carritos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(carrito),
    });
    if (!res.ok) throw new Error("Error al crear carrito");
    return res.json();
  },

  // Modificar carrito
  modificar: async (id, carrito) => {
    const res = await fetch(`${BASE_URL}/carritos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(carrito),
    });
    if (!res.ok) throw new Error("Error al modificar carrito");
    return res.json();
  },

  // Eliminar carrito
  eliminar: async (id) => {
    const res = await fetch(`${BASE_URL}/carritos/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar carrito");
    return res.json();
  },
};

// ============================================
// CARRITO ITEMS
// ============================================
export const carritoItemsApi = {

  // Crear item en carrito
  crear: async (item) => {
    const res = await fetch(`${BASE_URL}/carritoItems`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Error al agregar item al carrito");
    return res.json();
  },

  // Modificar item
  modificar: async (idProducto, idCarrito, item) => {
    const res = await fetch(`${BASE_URL}/carritoItems/${idProducto}/${idCarrito}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Error al modificar item");
    return res.json();
  },

  // Eliminar item
  eliminar: async (idProducto, idCarrito) => {
    const res = await fetch(`${BASE_URL}/carritoItems/${idProducto}/${idCarrito}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar item");
    return res.json();
  },
};

// ============================================
// ORDEN DE COMPRA
// ============================================
export const ordenCompraApi = {

  // Crear orden
  crear: async (orden) => {
    const res = await fetch(`${BASE_URL}/ordenCompra`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orden),
    });
    if (!res.ok) throw new Error("Error al crear orden de compra");
    return res.json();
  },

  // Obtener todas las órdenes
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/ordenCompra`);
    if (!res.ok) throw new Error("Error al obtener órdenes");
    return res.json();
  },
};
