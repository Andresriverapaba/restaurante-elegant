describe('Prueba de Sistema - Restaurante Elegant', () => {
  it('Debe permitir loguearse, agregar un plato y finalizar el pedido sin perder datos', () => {
    // 1. Visitar el login
    cy.visit('http://localhost:5173/login'); 

    // 2. Login con tus datos reales
    cy.get('input[type="email"]').type('andres@gmail.com'); 
    cy.get('input[type="password"]').type('1234');
    cy.get('button[type="submit"]').click();

    // 3. Agregar plato
    cy.url().should('include', '/menu');
    // Esperamos a que los platos carguen y hacemos clic en agregar
    cy.contains('Agregar', { timeout: 10000 }).first().click(); 

    // 4. NAVEGACIÓN CORRECTA (Sin recargar la página)
    // En lugar de cy.visit, hacemos clic en el botón del menú superior
    cy.get('nav').contains('Carrito').click();
    
    // 5. Finalizar pedido
    // Ahora el botón sí debería estar ahí porque no recargamos la página
    cy.contains('Finalizar pedido', { timeout: 10000 }).should('be.visible').click();

    // 6. Verificación final
    cy.contains('Pedido realizado con éxito', { timeout: 10000 }).should('be.visible');
  });
});