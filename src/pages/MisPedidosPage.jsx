import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "../css/MisPedidosPage.css";

const API_URL =
  "https://api-restaurant-elegant-frdxh8dxbrhgcfcz.mexicocentral-01.azurewebsites.net/api/pedidos";


export default function MisPedidosPage() {
  const { user } = useAuth();
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

      // Manejo de errores específicos
      if (!res.ok) {
        if (res.status === 404) {
          // No hay pedidos
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

  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
      hour12: true,
      timeZone: "America/Bogota",
    });
  };

  if (loading) return <p className="loading">Cargando pedidos...</p>;

  return (
    <div className="mis-pedidos-container">
      <h2>🧾 Mis Pedidos</h2>

      {pedidos.length === 0 ? (
        <p className="no-pedidos">No tienes pedidos registrados.</p>
      ) : (
        <div className="pedidos-grid">
          {pedidos.map((p) => (
            <div key={p.id} className="pedido-card">
              <div className="pedido-header">
                <span className="pedido-id"># {p.id}</span>
                <span className={`estado ${p.estado.toLowerCase()}`}>
                  {p.estado}
                </span>
              </div>

              <p className="pedido-fecha">{formatFecha(p.fecha)}</p>

              <ul className="pedido-detalles">
                {p.detalles.map((d, i) => (
                  <li key={i}>
                    {d.cantidad}x {d.plato?.nombre || "Plato desconocido"}
                  </li>
                ))}
              </ul>

              <p className="pedido-total">
                💰 Total: <strong>${p.total.toLocaleString("es-CO")}</strong>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
