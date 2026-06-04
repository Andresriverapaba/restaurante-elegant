import { render, screen } from '@testing-library/react';
import CartPage from './CartPage';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '@testing-library/jest-dom';

// 1. Simulamos los hooks de los contextos
jest.mock('../context/CartContext');
jest.mock('../context/AuthContext');

describe('Pruebas Unitarias - CartPage', () => {
  test('Debe mostrar mensaje de error si el carrito está vacío', () => {
    // 2. Definimos qué devuelve el carrito (vacío en este caso)
    useCart.mockReturnValue({
      cart: [],
      total: 0,
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn()
    });

    useAuth.mockReturnValue({ user: null });

    // 3. Renderizamos el componente
    render(<CartPage />);

    // 4. Verificamos que el texto esperado esté en pantalla
    const mensajeElement = screen.getByText(/No hay productos en el carrito/i);
    expect(mensajeElement).toBeInTheDocument();
  });
});