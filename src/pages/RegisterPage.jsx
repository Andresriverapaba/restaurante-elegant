import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/RegisterPage.css";

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpiamos errores previos

    // 1. Validación de Formato de Email
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un formato de correo electrónico válido.");
      return;
    }

    // 2. Validación de Contraseña (Alfanumérica entre 6 y 20 caracteres)
    const passwordRegex = /^[a-zA-Z0-9]{6,20}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "La contraseña debe ser alfanumérica (solo letras y números) y tener entre 6 y 20 caracteres."
      );
      return;
    }

    try {
      await register(nombre, email, password);
      navigate("/menu");
    } catch (err) {
      setError("Error al registrar usuario. Es posible que el correo ya esté en uso.");
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h2>Registrarse</h2>
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
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
        <button type="submit">Crear cuenta</button>
        {error && <p className="error" style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </form>
    </div>
  );
}