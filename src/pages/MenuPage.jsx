import { useEffect, useState } from "react";
import axios from "axios";
import PlatoCard from "../components/PlatoCard.jsx";
import "../css/MenuPage.css";

function MenuPage() {
  const [platos, setPlatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para búsqueda y filtrado por categoría
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");

  const API_URL = "https://api-restaurant-elegant-frdxh8dxbrhgcfcz.mexicocentral-01.azurewebsites.net/api/platos";

  useEffect(() => {
    axios
      .get(API_URL) // Corregido: Una sola petición limpia sin encadenamiento roto
      .then((res) => {
        setPlatos(res.data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error cargando platos:", err);
        setError("No se pudo cargar el menú desde el servidor.");
        setCargando(false);
      });
  }, []);

  // Función inteligente para clasificar los platos en el frontend basándose en el contenido de texto
  const clasificarPlato = (plato) => {
    const texto = `${plato.nombre} ${plato.descripcion}`.toLowerCase();
    
    if (texto.includes("bebida") || texto.includes("jugo") || texto.includes("gaseosa") || texto.includes("coca") || texto.includes("limonada") || texto.includes("agua")) {
      return "Bebidas";
    }
    if (texto.includes("entrada") || texto.includes("patacon") || texto.includes("empanada") || texto.includes("papas") || texto.includes("porcion")) {
      return "Entradas";
    }
    if (texto.includes("postre") || texto.includes("torta") || texto.includes("helado") || texto.includes("flan") || texto.includes("dulce") || texto.includes("panocha")) {
      return "Postres";
    }
    return "Platos Fuertes"; // Por ejemplo: hamburguesas, costillas, etc.
  };

  if (cargando) {
    return (
      <div className="menu-container loader-box">
        <p className="loading-text">✨ Preparando nuestro exquisito menú...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-container loader-box">
        <p className="error-text">❌ {error}</p>
      </div>
    );
  }

  // Lista de categorías estáticas para los botones del menú
  const categorias = ["Todos", "Entradas", "Platos Fuertes", "Bebidas", "Postres"];

  // Filtrado final combinando barra de búsqueda y categoría seleccionada
  const platosFiltrados = platos.filter((plato) => {
    const cumpleBusqueda = plato.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                           plato.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    
    const categoriaDelPlato = clasificarPlato(plato);
    const cumpleCategoria = categoriaSeleccionada === "Todos" || categoriaDelPlato === categoriaSeleccionada;

    return cumpleBusqueda && cumpleCategoria;
  });

  return (
    <div className="menu-container">
      <h2>Menú del Restaurante</h2>

      {/* BARRA DE BÚSQUEDA UX */}
      <div className="search-bar-container">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 ¿Qué se te antoja hoy? Busca tu plato favorito..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button className="clear-search-btn" onClick={() => setBusqueda("")}>✕</button>
        )}
      </div>

      {/* BOTONES DE CATEGORÍAS */}
      <div className="categories-container">
        {categorias.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${categoriaSeleccionada === cat ? "active" : ""}`}
            onClick={() => setCategoriaSeleccionada(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FILTRO DE RECUENTO */}
      <p className="results-count">
        Mostrando {platosFiltrados.length} {platosFiltrados.length === 1 ? "plato" : "platos"}
      </p>

      {/* GRID DE PLATOS */}
      <div className="platos-grid">
        {platosFiltrados.length > 0 ? (
          platosFiltrados.map((p) => <PlatoCard key={p.id} plato={p} />)
        ) : (
          <div className="no-results-box">
            <p className="no-results-text">No encontramos platos que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuPage;