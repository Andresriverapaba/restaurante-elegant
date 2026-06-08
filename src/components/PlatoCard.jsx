import "./PlatoCard.css";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify"; 

function PlatoCard({ plato }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(plato);
    toast.success(`${plato.nombre} agregado al carrito 🛒`, {
      theme: "dark", // En armonía con el tema oscuro
    });
  };

  return (
    <div className="plato-card">
      {/* Contenedor optimizado para la imagen */}
      <div className="plato-card-img-container">
        <img 
          src={plato.imagenUrl} 
          alt={plato.nombre} 
          className="plato-img" 
          loading="lazy" 
        />
      </div>
      <h3>{plato.nombre}</h3>
      <p className="plato-descripcion">{plato.descripcion}</p>
      <p className="precio">${plato.precio.toLocaleString()}</p>

      <button onClick={handleAdd} className="btn-agregar">
        🛒 Agregar al carrito
      </button>
    </div>
  );
}

export default PlatoCard;