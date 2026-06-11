import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (plato) => {
    setCart((prev) => {
      const found = prev.find((item) => item.id === plato.id);

      if (found) {
        return prev.map((item) =>
          item.id === plato.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...plato, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const updateQuantity = (id, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  // Cargar un pedido completo nuevamente al carrito
  const loadOrderIntoCart = (detalles) => {
    const nuevosItems = detalles
      .filter((d) => d.plato)
      .map((detalle) => ({
        id: detalle.plato.id,
        nombre: detalle.plato.nombre,
        descripcion: detalle.plato.descripcion,
        precio: detalle.plato.precio,
        imagenUrl: detalle.plato.imagenUrl,
        quantity: detalle.cantidad,
      }));

    setCart(nuevosItems);
  };

  // Totales
  const totalItems = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const total = cart.reduce(
    (acc, item) => acc + item.precio * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loadOrderIntoCart,
        total,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);