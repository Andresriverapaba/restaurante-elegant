import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (email, password) => {
    const res = await fetch(
      "https://api-restaurant-elegant-frdxh8dxbrhgcfcz.mexicocentral-01.azurewebsites.net/api/Usuarios/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!res.ok) throw new Error("Credenciales incorrectas");

    const data = await res.json();

    // Compatibilidad universal:
    // si viene con data.user, úsalo
    // si viene plano, úsalo tal cual
    const userData = data.user ? data.user : data;

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (nombre, email, password) => {
    const res = await fetch(
      "https://api-restaurant-elegant-frdxh8dxbrhgcfcz.mexicocentral-01.azurewebsites.net/api/Usuarios/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, rol: "Cliente" }),
      }
    );

    if (!res.ok) throw new Error("Error al registrar usuario");

    const data = await res.json();

    const userData = data.user ? data.user : data;

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
