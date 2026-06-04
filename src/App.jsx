import { HashRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import MisPedidosPage from "./pages/MisPedidosPage";
import AdminPedidosPage from "./pages/AdminPedidosPage";
import FacturaPage from "./pages/FacturaPage";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import "./App.css";

// Ruta protegida
function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.rol !== role) return <Navigate to="/menu" />;
  return children;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}

      <Routes>
        {/* Público */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Cliente */}
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />

        <Route
          path="/mis-pedidos"
          element={
            <PrivateRoute role="Cliente">
              <MisPedidosPage />
            </PrivateRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="Admin">
              <AdminPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/pedidos"
          element={
            <PrivateRoute role="Admin">
              <AdminPedidosPage />
            </PrivateRoute>
          }
        />

        {/* Nueva ruta de factura */}
        <Route
          path="/factura/:pedidoId"
          element={
            <PrivateRoute role="Admin">
              <FacturaPage />
            </PrivateRoute>
          }
        />

        {/* Redirección */}
        <Route
          path="/"
          element={
            user ? (
              user.rol === "Admin" ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/menu" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
