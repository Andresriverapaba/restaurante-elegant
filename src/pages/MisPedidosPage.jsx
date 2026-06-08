import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext"; // Importamos el carrito
import { useNavigate } from "react-router-dom"; // Para redirigir al carrito tras repetir pedido
import { toast } from "react-toastify";
import "../css/MisPedidosPage.css";

const API_URL =
  "https://api-restaurant-elegant-frdxh8dxbrhgcfcz.mexicocentral-01.azurewebsites.net/api/pedidos";

export default function MisPedidosPage() {
  const { user } = useAuth();
  const { loadOrderIntoCart } = useCart(); // Extraemos la nueva función del contexto
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadPedidos();
  }, [user]);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      const url =
        user.rol === "Admin" ? API_URL : `${API_URL}/usuario/${user.id}`;

      const res = await fetch(url);

      if (!res.ok) {
        if (res.status === 404) {
          setPedidos([]);
          return;
        } else {
          throw new Error(`Error ${res.status} al cargar pedidos`);
        }
      }

      const data = await res.json();
      setPedidos(data);
    } catch (err) {
      console.error("❌ Error al obtener pedidos:", err);
      toast.error("❌ Error al cargar tus pedidos");
      setPedidos([]); 
    } finally {
      setLoading(false);
    }
  };

  // Función manejadora del botón de repetir compra
  const handleRepetirPedido = (pedido) => {
    if (!pedido.detalles || pedido.detalles.length === 0) {
      toast.error("No hay productos disponibles en este pedido.");
      return;
    }
    
    loadOrderIntoCart(pedido.detalles);
    toast.success("Platos añadidos al carrito. ¡Tu mesa te espera! 🛒", {
      theme: "dark"
    });
    navigate("/cart"); // Redirección fluida al carrito para checkout rápido
  };

  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
      hour12: true,
      timeZone: "America/Bogota",
    });
  };

  if (loading) {
    return (
      <div className="mis-pedidos-container loader-box">
        <p className="loading">⏳ Consultando tu historial culinario...</p>
      </div>
    );
  }

  return (
    <div className="mis-pedidos-container">
      <h2>🧾 Mis Pedidos</h2>

      {pedidos.length === 0 ? (
        <p className="no-pedidos">No tienes pedidos registrados en tu cuenta.</p>
      ) : (
        <div className="pedidos-grid">
          {pedidos.map((p) => (
            <div key={p.id} className="pedido-card">
              <div className="pedido-header">
                <span className="pedido-id">Pedido #{p.id}</span>
                <span className={`estado ${p.estado.toLowerCase()}`}>
                  {p.estado}
                </span>
              </div>

              <p className="pedido-fecha">📅 {formatFecha(p.fecha)}</p>

              <ul className="pedido-detalles">
                {p.detalles.map((d, i) => (
                  <li key={i}>
                    <span className="item-cantidad">{d.cantidad}x</span> {d.plato?.nombre || "Plato exquisito"}
                  </li>
                ))}
              </ul>

              <div className="pedido-footer">
                <p className="pedido-total">
                  Total: <strong>${p.total.toLocaleString("es-CO")}</strong>
                </p>
                {/* BOTÓN "PEDIR DE NUEVO" TOTALMENTE INTEGRADO */}
                <button 
                  onClick={() => handleRepetirPedido(p)} 
                  className="btn-repetir-pedido"
                >
                  🔄 Pedir de nuevo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}