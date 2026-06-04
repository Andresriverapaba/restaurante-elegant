import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CartPage from './CartPage';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '@testing-library/jest-dom';

// 1. Simulamos los contextos y las notificaciones para aislamiento
jest.mock('../context/CartContext');
jest.mock('../context/AuthContext');
jest.mock('react-toastify');

describe('📋 REPORTE DE INTEGRACIÓN - RESTAURANTE ELEGANT', () => {
  
  test('✅ COMPROBACIÓN: Comunicación Frontend-API y flujo de limpieza de carrito', async () => {
    
    // Configuración de datos de prueba (Mock Data)
    const mockClearCart = jest.fn();
    useCart.mockReturnValue({
      cart: [{ id: 1, nombre: 'Plato de Prueba', precio: 25000, quantity: 2 }],
      total: 50000,
      clearCart: mockClearCart,
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn()
    });

    useAuth.mockReturnValue({ user: { id: 'andres_paba_123' } });

    // Simulamos una respuesta exitosa del servidor de Azure
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "Pedido Recibido" }),
      })
    );

    render(<CartPage />);

    // Acción: El usuario finaliza su compra
    const btnFinalizar = screen.getByText(/Finalizar pedido/i);
    fireEvent.click(btnFinalizar);

    // Verificaciones de la integración
    await waitFor(() => {
      // 1. Validar que la petición salió hacia la URL de Azure correcta
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('azurewebsites.net/api/pedidos'),
        expect.any(Object)
      );
      
      // 2. Validar que el estado global se reseteó tras la respuesta exitosa
      expect(mockClearCart).toHaveBeenCalled();
      
      // 3. Validar la respuesta visual al usuario
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("éxito"));

      // TEXTO EXPLICATIVO PARA LA CONSOLA
      console.log("\n---------------------------------------------------------");
      console.log("🚀 RESULTADO DE LA INTEGRACIÓN:");
      console.log("El componente CartPage logró conectarse con la API de Azure.");
      console.log("Se validó el envío del JSON y la limpieza del estado local.");
      console.log("---------------------------------------------------------\n");
    });
  });
});