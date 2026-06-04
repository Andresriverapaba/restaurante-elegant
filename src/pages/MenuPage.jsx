import  { useEffect, useState } from "react";
import axios from "axios";
import PlatoCard from "../components/PlatoCard.jsx";
import "../css/MenuPage.css";


function MenuPage() {
  const [platos, setPlatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // URL de la API publicada en Azure
  const API_URL = "https://api-restaurant-elegant-frdxh8dxbrhgcfcz.mexicocentral-01.azurewebsites.net/api/platos";

  useEffect(() => {
    axios
      .get(API_URL)
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

  if (cargando) return <p>Cargando platos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="menu-container">
      <h2>Menú del Restaurante</h2>
      <div className="platos-grid">
        {platos.length > 0 ? (
          platos.map((p) => <PlatoCard key={p.id} plato={p} />)
        ) : (
          <p>No hay platos disponibles.</p>
        )}
      </div>
    </div>
  );
}

export default MenuPage;
