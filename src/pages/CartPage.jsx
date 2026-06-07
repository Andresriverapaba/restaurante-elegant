import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "../css/CartPage.css"; 

const API_URL =
  "https://api-restaurant-elegant-frdxh8dxbrhgcfcz.mexicocentral-01.azurewebsites.net/api/pedidos";

function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();

  const finalizarPedido = async () => {
    // Validación 1: Carrito no debe tener 0 ítems
    if (cart.length === 0) {
      toast.warning("Tu carrito está vacío. Agrega platos antes de hacer un pedido.");
      return;
    }

    // Validación 2: El total no puede ser 0 o menor
    if (total <= 0) {
      toast.error("El total del pedido debe ser mayor a $0.");
      return;
    }

    if (!user) {
      toast.error("Debes iniciar sesión para hacer un pedido");
      return;
    }

    try {
      const pedido = {
        usuarioId: user.id,
        fecha: new Date().toISOString(),
        estado: "Pendiente",
        total,
        detalles: cart.map((item) => ({
          platoId: item.id,
          cantidad: item.quantity,
          unitPrice: item.precio,
        })),
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      });

      if (res.ok) {
        toast.success("✅ Pedido realizado con éxito");
        clearCart();
      } else {
        const errorData = await res.json();
        toast.error(`❌ ${errorData.message || "Error al enviar el pedido"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión con la API");
    }
  };

  return (
    <div className="cart-container">
      <h2>🛒 Tu Carrito</h2>

      {cart.length === 0 ? (
        <p>No hay productos en el carrito.</p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.imagenUrl} alt={item.nombre} />
                <div className="cart-item-info">
                  <h3>{item.nombre}</h3>
                  <p>${item.precio}</p>

                  <div className="cart-item-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>

                <button
                  className="btn-eliminar"
                  onClick={() => removeFromCart(item.id)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>

          <h3 className="cart-total">Total: ${total}</h3>

          <div className="cart-actions">
            <button onClick={clearCart} className="btn-vaciar">
              🧹 Vaciar carrito
            </button>
            <button onClick={finalizarPedido} className="btn-finalizar">
              ✅ Finalizar pedido
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;