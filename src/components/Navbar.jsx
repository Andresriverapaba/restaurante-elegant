import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/Navbar.css";
import logo from "../assets/Logo.png";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Restaurante Elegant" className="navbar-logo" />
        <h1 className="navbar-title">Restaurante Elegant</h1>
      </div>

      <nav className="navbar-links">
        <Link to="/menu">Menú</Link>
        {user && user.rol === "Cliente" && (
          <Link to="/cart">Carrito</Link>
        )}

        {user && user.rol === "Admin" && (
          <Link to="/admin">Panel Admin</Link>
        )}

      {user && user.rol === "Cliente" && (
          <Link to="/mis-pedidos">Mis pedidos</Link>
      )}

        {user && user.rol === "Cliente" && <Link to="/mis-pedidos">Mis pedidos</Link>}

        {user && user.rol === "Admin" && (
          <>
            <Link to="/admin/pedidos">Pedidos</Link>
          </>
        )}

        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registro</Link>
          </>
        )}




        {user && (
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Cerrar sesión
          </button>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
