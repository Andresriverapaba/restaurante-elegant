import "./PlatoCard.css";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify"; 

function PlatoCard({ plato }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(plato);
    toast.success(`${plato.nombre} agregado al carrito 🛒`, {
      theme: "colored",
    });
  };

  return (
    <div className="plato-card">
      <img src={plato.imagenUrl} alt={plato.nombre} />
      <h3>{plato.nombre}</h3>
      <p>{plato.descripcion}</p>
      <p className="precio">${plato.precio}</p>

      <button onClick={handleAdd} className="btn-agregar">
        🛒 Agregar al carrito
      </button>
    </div>
  );
}

export default PlatoCard;
