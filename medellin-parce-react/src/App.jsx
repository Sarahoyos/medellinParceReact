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
import EnDesarrollo from "./components/EnDesarrollo";
import ProductosHombre from "./components/ProductosHombre";
import ProductosSweaters from "./components/ProductosSweaters";
import ProductosChompas from "./components/ProductosChompas";
import AdminRoute from "./components/AdminRoute";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/blog" element={<EnDesarrollo pagina="El Blog" />} />
            <Route path="/nosotros" element={<EnDesarrollo pagina="Nosotros" />} />

            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/productos" element={<PrivateRoute><Productos /></PrivateRoute>} />
            <Route path="/productos/camisetas-mujer" element={<PrivateRoute><ProductosMujer /></PrivateRoute>} />
            <Route path="/orden-compra" element={<PrivateRoute><OrdenCompra /></PrivateRoute>} />
            <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
            <Route path="/productos/camisetas-hombre" element={<PrivateRoute><ProductosHombre /></PrivateRoute>} />
            <Route path="/productos/sweaters" element={<PrivateRoute><ProductosSweaters /></PrivateRoute>} />
            <Route path="/productos/chompas" element={<PrivateRoute><ProductosChompas /></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<AdminRoute> <Dashboard /> </AdminRoute>}/>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;