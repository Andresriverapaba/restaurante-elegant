import  { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "../css/AdminPage.css";

const API_URL =
  "https://api-restaurant-elegant-frdxh8dxbrhgcfcz.mexicocentral-01.azurewebsites.net/api/Platos";

function AdminPage() {
  const [platos, setPlatos] = useState([]);
  const [mostrarEliminados, setMostrarEliminados] = useState(false);
  const [nuevoPlato, setNuevoPlato] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    imagenUrl: "",
  });
  const [editando, setEditando] = useState(null);
  const [platoEditado, setPlatoEditado] = useState({});

  const fetchPlatos = async () => {
    const endpoint = mostrarEliminados ? `${API_URL}/todos` : `${API_URL}`;
    const res = await fetch(endpoint);
    const data = await res.json();
    setPlatos(
      mostrarEliminados
        ? data.filter((p) => !p.isActive)
        : data.filter((p) => p.isActive)
    );
  };

  useEffect(() => {
    fetchPlatos();
  }, [mostrarEliminados]);

  const handleChange = (e) => {
    setNuevoPlato({ ...nuevoPlato, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!nuevoPlato.nombre || !nuevoPlato.precio || !nuevoPlato.imagenUrl) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    // Validación de precio negativo
    if (parseFloat(nuevoPlato.precio) < 0) {
      toast.error("El precio no puede ser un valor negativo");
      return;
    }

    // Validación de URL de imagen
    if (nuevoPlato.imagenUrl.trim() === "") {
      toast.error("La URL de la imagen es obligatoria");
      return;
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nuevoPlato.nombre,
        descripcion: nuevoPlato.descripcion,
        precio: parseFloat(nuevoPlato.precio),
        imagenUrl: nuevoPlato.imagenUrl,
        isActive: true,
      }),
    });

    if (res.ok) {
      toast.success("Plato agregado con éxito");
      setNuevoPlato({ nombre: "", descripcion: "", precio: "", imagenUrl: "" });
      fetchPlatos();
    } else {
      toast.error("Error al agregar plato");
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

  const handleEditar = (plato) => {
    setEditando(plato.id);
    setPlatoEditado({
      nombre: plato.nombre,
      descripcion: plato.descripcion,
      precio: plato.precio,
      imagenUrl: plato.imagenUrl,
    });
  };

  const handleEditarChange = (e) => {
    setPlatoEditado({ ...platoEditado, [e.target.name]: e.target.value });
  };

  const handleGuardarEdicion = async (id) => {
    // Validación de precio negativo al editar
    if (parseFloat(platoEditado.precio) < 0) {
      toast.error("El precio no puede ser un valor negativo");
      return;
    }

    // Validación de URL de imagen al editar
    if (!platoEditado.imagenUrl || platoEditado.imagenUrl.trim() === "") {
      toast.error("La URL de la imagen no puede quedar vacía");
      return;
    }

    try {
      const platoOriginal = platos.find((p) => p.id === id);

      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
          nombre: platoEditado.nombre,
          descripcion: platoEditado.descripcion,
          precio: parseFloat(platoEditado.precio),
          imagenUrl: platoEditado.imagenUrl,
          isActive: platoOriginal.isActive,
        }),
      });

      if (res.ok) {
        toast.success("✅ Plato actualizado correctamente");
        setEditando(null);
        fetchPlatos();
      } else {
        const errorText = await res.text();
        console.error("Error al actualizar:", errorText);
        toast.error("❌ Error al actualizar plato");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error al conectar con el servidor");
    }
  };

  const handleCancelarEdicion = () => {
    setEditando(null);
  };

  return (
    <div className="admin-container">
      <h2>⚙️ Panel de Administración</h2>

      {!mostrarEliminados && (
        <div className="form-nuevo-plato">
          <h3>Agregar nuevo plato</h3>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={nuevoPlato.nombre}
            onChange={handleChange}
          />
          <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            value={nuevoPlato.descripcion}
            onChange={handleChange}
          />
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            value={nuevoPlato.precio}
            onChange={handleChange}
          />
          <input
            type="text"
            name="imagenUrl"
            placeholder="URL de imagen"
            value={nuevoPlato.imagenUrl}
            onChange={handleChange}
          />
          <button onClick={handleAdd}>➕ Agregar</button>
        </div>
      )}

      <table className="tabla-platos">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {platos.map((p) => (
            <tr key={p.id}>
              <td>
                <img src={p.imagenUrl} alt={p.nombre} width="80" />
              </td>
              <td>
                {editando === p.id ? (
                  <input
                    type="text"
                    name="nombre"
                    value={platoEditado.nombre}
                    onChange={handleEditarChange}
                  />
                ) : (
                  p.nombre
                )}
              </td>
              <td>
                {editando === p.id ? (
                  <input
                    type="text"
                    name="descripcion"
                    value={platoEditado.descripcion}
                    onChange={handleEditarChange}
                  />
                ) : (
                  p.descripcion
                )}
              </td>
              <td>
                {editando === p.id ? (
                  <input
                    type="number"
                    name="precio"
                    value={platoEditado.precio}
                    onChange={handleEditarChange}
                  />
                ) : (
                  `$${p.precio}`
                )}
              </td>
              <td>
                {!mostrarEliminados ? (
                  editando === p.id ? (
                    <>
                      <button onClick={() => handleGuardarEdicion(p.id)}>
                        💾 Guardar
                      </button>
                      <button onClick={handleCancelarEdicion}>
                        ❌ Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditar(p)}>✏️ Editar</button>
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
        <button
          onClick={() => setMostrarEliminados(!mostrarEliminados)}
          className="boton-toggle"
        >
          {mostrarEliminados ? "👀 Ver Activos" : "🗑️ Ver Eliminados"}
        </button>
      </div>
    </div>
  );
}

export default AdminPage;