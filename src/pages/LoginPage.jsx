import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/LoginPage.css"; 
import logo from "../assets/logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      const user = JSON.parse(localStorage.getItem("user"));
      if (user.rol === "Admin") navigate("/admin");
      else navigate("/menu");
    } catch {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="Restaurante Elegant" className="login-logo" />

        <h2>Bienvenido a Restaurante Elegant</h2>
        <p className="login-subtitle">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
          {error && <p className="login-error">{error}</p>}
        </form>

        <p className="login-register">
          ¿No tienes una cuenta?{" "}
          <Link to="/register" className="login-link">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
