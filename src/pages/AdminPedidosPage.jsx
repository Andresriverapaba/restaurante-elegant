import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../css/AdminPedidosPage.css";

const API_URL =
  "https://api-restaurant-elegant-frdxh8dxbrhgcfcz.mexicocentral-01.azurewebsites.net/api/pedidos";

function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPedidos = async () => {
    
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al obtener pedidos");
      const data = await res.json();
      setPedidos(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`${API_URL}/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoEstado),
      });

      if (res.ok) {
        toast.success("Estado actualizado");
        fetchPedidos();
      } else {
        toast.error("Error al actualizar estado");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    }
  };

  const eliminarPedido = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este pedido?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

      if (res.ok) {
        toast.info("Pedido eliminado");
        fetchPedidos();
      } else {
        toast.error("Error al eliminar pedido");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  if (loading) return <p>Cargando pedidos...</p>;

  return (
    <div className="admin-pedidos-container">
      <h2>📋 Gestión de Pedidos</h2>

      {pedidos.length === 0 ? (
        <p>No hay pedidos registrados.</p>
      ) : (
        <table className="tabla-pedidos-admin">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Pedido</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Factura</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>

                <td>
                  {p.usuario?.nombre ||
                    p.usuarioNombre ||
                    `Usuario ${p.usuarioId}`}
                </td>

                <td>{new Date(p.fecha).toLocaleString()}</td>

                <td>
                  {p.detalles?.length > 0 ? (
                    <ul className="detalles-lista">
                      {p.detalles.map((d, i) => (
                        <li key={i}>
                          {d.plato?.nombre || d.platoNombre} × {d.cantidad}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "—"
                  )}
                </td>

                <td>${p.total}</td>

                <td>
                  <select
                    value={p.estado}
                    onChange={(e) => actualizarEstado(p.id, e.target.value)}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Preparando">Preparando</option>
                    <option value="Listo">Listo</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </td>

                <td>
                  <button
                    className="factura-btn"
                    onClick={() => navigate(`/factura/${p.id}`)}
                  >
                    🧾 Ver factura
                  </button>
                </td>

                <td>
                  <button onClick={() => eliminarPedido(p.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      )}
    </div>
  );
}

export default AdminPedidosPage;
