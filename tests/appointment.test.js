const request = require('supertest');
const app = require('../server/index');

describe('Appointment Booking', () => {
  test('should book appointment successfully', async () => {
    const appointmentData = {
      user_id: 'test-user-123',
      doctor_name: 'Dr. Test Doctor',
      doctor_specialty: 'Cardiology',
      hospital_name: 'Test Hospital',
      appointment_date: '2024-01-15',
      appointment_time: '10:00 AM',
      patient_name: 'Test Patient',
      patient_phone: '+91-9876543210',
      patient_email: 'test@example.com',
      symptoms: 'Chest pain'
    };

    const response = await request(app)
      .post('/api/appointments')
      .send(appointmentData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.appointment).toMatchObject({
      doctor_name: appointmentData.doctor_name,
      patient_name: appointmentData.patient_name,
      status: 'scheduled'
    });
  });

  test('should reject appointment with missing fields', async () => {
    const incompleteData = {
      user_id: 'test-user-123',
      doctor_name: 'Dr. Test Doctor'
      // Missing required fields
    };

    const response = await request(app)
      .post('/api/appointments')
      .send(incompleteData)
      .expect(400);

    expect(response.body.error).toBe('Missing required fields');
  });

  test('should detect appointment conflicts', async () => {
    const appointmentData = {
      user_id: 'test-user-123',
      doctor_name: 'Dr. Test Doctor',
      doctor_specialty: 'Cardiology',
      hospital_name: 'Test Hospital',
      appointment_date: '2024-01-15',
      appointment_time: '10:00 AM',
      patient_name: 'Test Patient',
      patient_phone: '+91-9876543210',
      patient_email: 'test@example.com'
    };

    // Book first appointment
    await request(app)
      .post('/api/appointments')
      .send(appointmentData)
      .expect(201);

    // Try to book conflicting appointment
    const conflictingData = {
      ...appointmentData,
      user_id: 'different-user-456',
      patient_name: 'Different Patient'
    };

    const response = await request(app)
      .post('/api/appointments')
      .send(conflictingData)
      .expect(409);

    expect(response.body.error).toBe('Time slot unavailable');
  });
});

describe('Document Analysis', () => {
  test('should analyze uploaded document', async () => {
    // Mock file upload test
    const response = await request(app)
      .post('/api/analyze')
      .attach('document', Buffer.from('Test prescription content'), 'prescription.pdf')
      .expect(200);

    expect(response.body).toHaveProperty('category');
    expect(response.body).toHaveProperty('extractedText');
    expect(response.body).toHaveProperty('confidence');
  });
});