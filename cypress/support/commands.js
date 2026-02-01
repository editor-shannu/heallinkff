// Custom Cypress commands
Cypress.Commands.add('login', (email = 'test@example.com') => {
  cy.window().then((win) => {
    win.localStorage.setItem('authToken', 'mock-token');
    win.localStorage.setItem('user', JSON.stringify({
      uid: 'test-user-123',
      email: email,
      displayName: 'Test User'
    }));
  });
});

Cypress.Commands.add('mockApiResponse', (method, url, response) => {
  cy.intercept(method, url, response).as('apiCall');
});