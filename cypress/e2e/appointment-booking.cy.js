describe('Appointment Booking E2E', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', 'mock-token');
    });
    
    cy.visit('/');
    cy.wait(2000); // Wait for app to load
  });

  it('should book an appointment and show in upcoming appointments', () => {
    // Navigate to hospitals
    cy.get('[data-testid="hospital-list-button"]').click();
    
    // Select a hospital
    cy.get('[data-testid="hospital-card"]').first().click();
    
    // Click book appointment
    cy.get('[data-testid="book-appointment-button"]').click();
    
    // Fill appointment form
    cy.get('[data-testid="date-selector"]').first().click();
    cy.get('[data-testid="time-selector"]').first().click();
    
    cy.get('input[name="patientName"]').type('Test Patient');
    cy.get('input[name="patientPhone"]').type('+91-9876543210');
    cy.get('input[name="patientEmail"]').type('test@example.com');
    cy.get('textarea[name="symptoms"]').type('Regular checkup');
    
    // Submit appointment
    cy.get('[data-testid="confirm-appointment-button"]').click();
    
    // Verify success message
    cy.contains('Appointment Confirmed!').should('be.visible');
    
    // Navigate back to dashboard
    cy.wait(3000); // Wait for auto-redirect
    
    // Verify appointment appears in upcoming appointments
    cy.get('[data-testid="upcoming-appointments"]').should('contain', 'Test Patient');
  });

  it('should handle appointment booking errors gracefully', () => {
    // Navigate to booking
    cy.get('[data-testid="hospital-list-button"]').click();
    cy.get('[data-testid="hospital-card"]').first().click();
    cy.get('[data-testid="book-appointment-button"]').click();
    
    // Try to submit without required fields
    cy.get('[data-testid="confirm-appointment-button"]').click();
    
    // Verify error message
    cy.contains('Please fill in all required fields').should('be.visible');
  });
});