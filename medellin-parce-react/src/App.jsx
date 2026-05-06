import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/login";
import Register from "./components/Register";
import Home from "./components/Home";
import Productos from "./components/Productos";
import ProductosMujer from "./components/ProductosMujer";
import OrdenCompra from "./components/OrdenCompra";
import Perfil from "./components/Perfil";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />

            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/productos" element={<PrivateRoute><Productos /></PrivateRoute>} />
            <Route path="/productos/camisetas-mujer" element={<PrivateRoute><ProductosMujer /></PrivateRoute>} />
            <Route path="/orden-compra" element={<PrivateRoute><OrdenCompra /></PrivateRoute>} />
            <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;