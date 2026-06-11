import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "../css/AdminPage.css";
import { Link } from "react-router-dom";

const API_URL = "https://api-restaurant-elegant-frdxh8dxbrhgcfcz.mexicocentral-01.azurewebsites.net/api/Platos";
const REPORTES_URL = "https://api-restaurant-elegant-frdxh8dxbrhgcfcz.mexicocentral-01.azurewebsites.net/api/Reportes/diario";
const PEDIDOS_URL = "https://api-restaurant-elegant-frdxh8dxbrhgcfcz.mexicocentral-01.azurewebsites.net/api/Pedidos";

function AdminPage() {
  const [tabActiva, setTabActiva] = useState("platos");

  // Filtro de Fecha para la pestaña de REPORTES
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split("T")[0]);
  
  // Filtro de Fecha exclusivo para la pestaña de GESTIÓN DE PEDIDOS (Vacío significa "Todos")
  const [fechaFiltroPedidos, setFechaFiltroPedidos] = useState("");
  

  // Estados de Platos
  const [platos, setPlatos] = useState([]);
  const [mostrarEliminados, setMostrarEliminados] = useState(false);
  const [nuevoPlato, setNuevoPlato] = useState({ nombre: "", descripcion: "", precio: "", imagenUrl: "" });
  const [editando, setEditando] = useState(null);
  const [platoEditado, setPlatoEditado] = useState({});
  
  // Estados de Reportes y Pedidos
  const [reporteData, setReporteData] = useState(null);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  // GET Platos
  const fetchPlatos = async () => {
    const endpoint = mostrarEliminados ? `${API_URL}/todos` : `${API_URL}`;
    const res = await fetch(endpoint);
    const data = await res.json();
    setPlatos(mostrarEliminados ? data.filter((p) => !p.isActive) : data.filter((p) => p.isActive));
  };

  // GET Reportes
  const fetchReportes = async (fechaSeleccionada) => {
    setLoadingReporte(true);
    try {
      const res = await fetch(`${REPORTES_URL}?fecha=${fechaSeleccionada}`);
      if (res.ok) {
        const data = await res.json();
        setReporteData(data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar reportes");
    } finally {
      setLoadingReporte(false);
    }
  };

  // GET Pedidos
  const fetchPedidos = async () => {
    setLoadingPedidos(true);
    try {
      const res = await fetch(PEDIDOS_URL);
      if (res.ok) {
        const data = await res.json();
        setPedidos(data.sort((a, b) => b.id - a.id));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPedidos(false);
    }
  };

  // Manejadores CRUD Platos
  const handleChange = (e) => setNuevoPlato({ ...nuevoPlato, [e.target.name]: e.target.value });
  const handleEditarChange = (e) => setPlatoEditado({ ...platoEditado, [e.target.name]: e.target.value });
  
  const handleAdd = async () => {
    if (!nuevoPlato.nombre || !nuevoPlato.precio || !nuevoPlato.imagenUrl) {
      toast.error("Completa todos los campos obligatorios"); 
      return;
    }
    if (parseFloat(nuevoPlato.precio) < 0) {
      toast.error("El precio no puede ser negativo"); 
      return;
    }
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...nuevoPlato, precio: parseFloat(nuevoPlato.precio), isActive: true }),
    });
    if (res.ok) {
      toast.success("Plato agregado con éxito");
      setNuevoPlato({ nombre: "", descripcion: "", precio: "", imagenUrl: "" });
      fetchPlatos();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este plato?")) return;
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (res.ok) { 
      toast.info("Plato eliminado"); 
      fetchPlatos(); 
    }
  };

  const handleRestaurar = async (id) => {
    const res = await fetch(`${API_URL}/restaurar/${id}`, { method: "PUT" });
    if (res.ok) { 
      toast.success("Plato restaurado"); 
      fetchPlatos(); 
    }
  };

  const handleGuardarEdicion = async (id) => {
    if (parseFloat(platoEditado.precio) < 0) { 
      toast.error("Precio inválido"); 
      return; 
    }
    const platoOriginal = platos.find((p) => p.id === id);
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...platoEditado, precio: parseFloat(platoEditado.precio), isActive: platoOriginal.isActive }),
    });
    if (res.ok) { 
      toast.success("Plato actualizado"); 
      setEditando(null); 
      fetchPlatos(); 
    }
  };

  // Actualizar estado de despacho de pedidos
  const handleCambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const res = await fetch(`${PEDIDOS_URL}/${pedidoId}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoEstado),
      });
      if (res.ok) {
        toast.success(`Pedido #${pedidoId} actualizado`);
        fetchPedidos();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Efecto de carga adaptativo por pestañas
  useEffect(() => {
    if (tabActiva === "platos") fetchPlatos();
    if (tabActiva === "pedidos") fetchPedidos();
    if (tabActiva === "reportes") {
      fetchReportes(fechaFiltro);
      fetchPedidos();
    }
  }, [mostrarEliminados, tabActiva, fechaFiltro]);

  // Análisis de negocio local para extraer platos vendidos de la fecha en consulta
 const obtenerPlatosVendidosDelDia = () => {
    const desglose = {};
    
    // Filtramos los pedidos que coincidan con la fecha seleccionada
    pedidos.forEach((p) => {
      if (!p.fecha) return;
      
      // Convertimos a fecha local para evitar el desfase horario
      const d = new Date(p.fecha);
      const fechaPedidoString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      if (fechaPedidoString === fechaFiltro && p.estado !== "Cancelado") {
        // Aseguramos acceso tanto a 'pedidoDetalles' como 'detalles' por si acaso
        const detalles = p.pedidoDetalles || p.detalles;
        if (detalles && Array.isArray(detalles)) {
          detalles.forEach((det) => {
            const nombrePlato = det.plato?.nombre || det.nombrePlato || "Plato Desconocido";
            desglose[nombrePlato] = (desglose[nombrePlato] || 0) + (det.cantidad || 0);
          });
        }
      }
    });
    return Object.entries(desglose);
  };

const formatearFechaLocal = (fecha) => {
  const d = new Date(fecha);

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
  
const pedidosDelDia = pedidos.filter((p) => {
  return formatearFechaLocal(p.fecha) === fechaFiltro;
});

const pendientesHoy = pedidosDelDia.filter(
  (p) => p.estado === "Pendiente"
).length;

const preparandoHoy = pedidosDelDia.filter(
  (p) => p.estado === "Preparando"
).length;

const listosHoy = pedidosDelDia.filter(
  (p) => p.estado === "Listo"
).length;

const entregadosHoy = pedidosDelDia.filter(
  (p) => p.estado === "Entregado"
).length;
const canceladosHoy = pedidosDelDia.filter(
  (p) => p.estado === "Cancelado"
).length;


  // Filtro reactivo local para la tabla de despacho de pedidos
  const pedidosFiltrados = pedidos.filter((p) => {
    if (!fechaFiltroPedidos) return true;
    const fechaPedidoString = new Date(p.fecha).toISOString().split("T")[0];
    return fechaPedidoString === fechaFiltroPedidos;
  });

  return (
    <div className="admin-container">
      <div className="admin-tabs">
        <button className={tabActiva === "platos" ? "tab-btn active" : "tab-btn"} onClick={() => setTabActiva("platos")}>
          🍽️ Gestión de Platos
        </button>
        <button className={tabActiva === "pedidos" ? "tab-btn active" : "tab-btn"} onClick={() => setTabActiva("pedidos")}>
          📦 Gestión de Pedidos
        </button>
        <button className={tabActiva === "reportes" ? "tab-btn active" : "tab-btn"} onClick={() => setTabActiva("reportes")}>
          📊 Reportes y Estadísticas
        </button>
      </div>

      {/* PESTAÑA 1: GESTIÓN DE PLATOS */}
      {tabActiva === "platos" && (
        <>
          {!mostrarEliminados && (
            <div className="form-nuevo-plato">
              <h3>Agregar nuevo plato</h3>
              <input type="text" name="nombre" placeholder="Nombre" value={nuevoPlato.nombre} onChange={handleChange} />
              <input type="text" name="descripcion" placeholder="Descripción" value={nuevoPlato.descripcion} onChange={handleChange} />
              <input type="number" name="precio" placeholder="Precio" value={nuevoPlato.precio} onChange={handleChange} />
              <input type="text" name="imagenUrl" placeholder="URL de imagen" value={nuevoPlato.imagenUrl} onChange={handleChange} />
              <button onClick={handleAdd}>➕ Agregar</button>
            </div>
          )}
          
          <table className="tabla-platos">
            <thead>
              <tr><th>Imagen</th><th>Nombre</th><th>Descripción</th><th>Precio</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {platos.map((p) => (
                <tr key={p.id}>
                  <td><img src={p.imagenUrl} alt={p.nombre} width="80" /></td>
                  <td>{editando === p.id ? <input type="text" name="nombre" value={platoEditado.nombre} onChange={handleEditarChange} /> : p.nombre}</td>
                  <td>{editando === p.id ? <input type="text" name="descripcion" value={platoEditado.descripcion} onChange={handleEditarChange} /> : p.descripcion}</td>
                  <td>{editando === p.id ? <input type="number" name="precio" value={platoEditado.precio} onChange={handleEditarChange} /> : `$${p.precio}`}</td>
                  <td>
                    {!mostrarEliminados ? (
                      editando === p.id ? (
                        <>
                          <button onClick={() => handleGuardarEdicion(p.id)}>💾 Guardar</button>
                          <button onClick={() => setEditando(null)}>❌ Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditando(p.id); setPlatoEditado(p); }}>✏️ Editar</button>
                          <button onClick={() => handleDelete(p.id)}>🗑️ Eliminar</button>
                        </>
                      )
                    ) : (
                      <button onClick={() => handleRestaurar(p.id)}>♻️ Restaurar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="contenedor-boton-toggle">
            <button onClick={() => setMostrarEliminados(!mostrarEliminados)} className="boton-toggle">
              {mostrarEliminados ? "👀 Ver Activos" : "🗑️ Ver Eliminados"}
            </button>
          </div>
        </>
      )}

      {/* PESTAÑA 2: GESTIÓN DE PEDIDOS + BUSCADOR */}
      {tabActiva === "pedidos" && (
        <div className="admin-pedidos-section">
          <h3>📦 Control y Despacho de Pedidos</h3>
          
          <div className="search-pedidos-container">
            <label htmlFor="search-date">🔍 Filtrar lista de despacho por fecha: </label>
            <input 
              type="date" 
              id="search-date"
              value={fechaFiltroPedidos}
              onChange={(e) => setFechaFiltroPedidos(e.target.value)}
              className="input-calendario"
            />
            {fechaFiltroPedidos && (
              <button className="clear-filter-btn" onClick={() => setFechaFiltroPedidos("")}>❌ Limpiar</button>
            )}
          </div>

          {loadingPedidos ? <p>Cargando lista de pedidos...</p> : (
            <table className="tabla-platos">
              <thead>
               <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado Actual</th>
                <th>Acciones de Despacho</th>
              </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.length > 0 ? (
                  pedidosFiltrados.map((ped) => (
                    <tr key={ped.id}>
                      <td><strong>#{ped.id}</strong></td>

                      <td>
                        <strong>{ped.cliente}</strong>
                      </td>

                      <td>{new Date(ped.fecha).toLocaleString()}</td>
                      <td><strong className="texto-verde">${ped.total.toLocaleString()}</strong></td>
                      <td><span className={`estado-badge ${ped.estado.toLowerCase()}`}>{ped.estado}</span></td>
                      <td>
                          <div className="acciones-pedido">
                            <select 
                              value={ped.estado} 
                              onChange={(e) => handleCambiarEstadoPedido(ped.id, e.target.value)}
                              className="select-estado"
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="Preparando">Preparando</option>
                              <option value="Listo">Listo</option>
                              <option value="Entregado">Entregado</option>
                              <option value="Cancelado">Cancelado</option>
                            </select>

                            {ped.estado === "Entregado" && (
                              <Link
                                to={`/factura/${ped.id}`}
                                className="btn-factura"
                              >
                                🧾 Factura
                              </Link>
                            )}
                          </div>
                        </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{textAlign: "center", padding: "15px"}}>No hay pedidos registrados en la fecha seleccionada.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* PESTAÑA 3: REPORTES + AUDITORÍA DE PLATOS VENDIDOS */}
      {tabActiva === "reportes" && (
        <div className="reportes-section">
          <div className="datepicker-container">
            <label htmlFor="calendario-reporte">📅 Selecciona un día para consultar el histórico: </label>
            <input 
              type="date" 
              id="calendario-reporte"
              value={fechaFiltro} 
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="input-calendario"
            />
          </div>

          {loadingReporte ? (
            <div className="loading-spinner">📊 Procesando datos del servidor...</div>
          ) : reporteData ? (
            <>
              <div className="reportes-grid">
                <div className="card-reporte top-selling">
                  <h4>⭐ Más Vendido del Día</h4>
                  <p className="valor-destacado">{reporteData.platoMasVendidoHoy}</p>
                  <span className="sub-valor">{reporteData.cantidadPlatoMasVendidoHoy} unidades vendidas</span>
                </div>
                <div className="card-reporte generado">
                  <h4>💰 Ventas Generadas</h4>
                  <p className="valor">${reporteData.dineroGeneradoHoy.toLocaleString()}</p>
                </div>
                <div className="card-reporte ingresado">
                  <h4> 💵 Ingresos Confirmados</h4>
                  <p className="valor">${reporteData.dineroIngresadoHoy.toLocaleString()}</p>
                </div>
              </div>

              <div className="desglose-platos-container">
                <h3>📖 Auditoría de Cantidades Vendidas ({fechaFiltro})</h3>
                <div className="tabla-scroll" style={{marginBottom: "30px"}}>
                  <table className="tabla-reporte-horas">
                    <thead>
                      <tr>
                        <th>Nombre del Plato</th>
                        <th>Cantidad Total Despachada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {obtenerPlatosVendidosDelDia().length > 0 ? (
                        obtenerPlatosVendidosDelDia().map(([platoNombre, cantidad], idx) => (
                          <tr key={idx}>
                            <td><strong>{platoNombre}</strong></td>
                            <td>{cantidad} unidades</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="2" style={{textAlign: "center", padding: "10px"}}>No se registran platos vendidos para este día.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <h3>⚡ Monitoreo de Operaciones Activas de la Cocina (Tiempo Real)</h3>
                    <div className="operaciones-grid">
                      <div className="card-operativa pendiente">
                        <span className="numero">{pendientesHoy}</span>
                        <span className="etiqueta">Por Aprobar</span>
                      </div>
                      <div className="card-operativa preparando">
                        <span className="numero">{pendientesHoy}</span>
                        <span className="etiqueta">En Cocina</span>
                      </div>
                      <div className="card-operativa listo">
                        <span className="numero">{listosHoy}</span>
                        <span className="etiqueta">Listos</span>
                      </div>
                      {/* NUEVO RECUADRO: Calculado dinámicamente para el día seleccionado */}
                      <div className="card-operativa entregado">
                       <span className="numero">{entregadosHoy}</span>
                        <span className="etiqueta">Entregados Hoy</span>
                      </div>
                      <div className="card-operativa cancelado">
                      <span className="numero">{canceladosHoy}</span>
                      <span className="etiqueta">Cancelados</span>
                    </div>
                    </div>

              <h3>🕐 Distribución de Ventas por Horas</h3>
              <div className="tabla-scroll">
                <table className="tabla-reporte-horas">
                  <thead>
                    <tr><th>Rango de Hora</th><th>Pedidos Procesados</th><th>Ingresos Registrados</th></tr>
                  </thead>
                  <tbody>
                    {reporteData.ventasPorHora.map((v, index) => (
                      <tr key={index}>
                        <td><strong>{v.hora}</strong></td>
                        <td>{v.cantidadPedidos} pedido(s)</td>
                        <td><span className="texto-verde">${v.totalVentas.toLocaleString()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
    
  );
}

export default AdminPage;