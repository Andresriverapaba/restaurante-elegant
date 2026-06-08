import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "../css/Navbar.css";
import logo from "../assets/Logo.png";

function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-left">
          <img src={logo} alt="Restaurante Elegant" className="navbar-logo" />
          <h1 className="navbar-title">RESTAURANTE ELEGANT</h1>
        </div>

        <nav className="navbar-links">
          <Link to="/menu">Menú</Link>
          {user && user.rol === "Cliente" && <Link to="/cart">Carrito</Link>}
          {user && user.rol === "Admin" && <Link to="/admin">Panel Admin</Link>}
          {user && user.rol === "Cliente" && <Link to="/mis-pedidos">Mis pedidos</Link>}
          {user && user.rol === "Admin" && <Link to="/admin/pedidos">Pedidos</Link>}
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Registro</Link>
            </>
          )}
          {user && (
            <button className="btn-logout" onClick={handleLogout}>🚪 Cerrar sesión</button>
          )}
        </nav>
      </header>

      {/* Icono flotante (Solo si es Cliente y hay productos) */}
      {user && user.rol === "Cliente" && totalItems > 0 && (
        <div className="floating-cart" onClick={() => navigate("/cart")}>
          🛒 <span className="cart-count">{totalItems}</span>
        </div>
      )}
    </>
  );
}

export default Navbar;