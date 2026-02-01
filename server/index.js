const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// In-memory cache for news and hospitals
let newsCache = { data: null, timestamp: null };
let hospitalsCache = { data: null, timestamp: null };

// Cache duration: 10 minutes
const CACHE_DURATION = 10 * 60 * 1000;

// Mock database (replace with real database in production)
let appointments = [];
let userMoods = {};
let medicalRecords = {};
let notifications = [];

// Helper function to check cache validity
const isCacheValid = (cache) => {
  return cache.timestamp && (Date.now() - cache.timestamp) < CACHE_DURATION;
};

// API Routes

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const query = q.toLowerCase();
    const results = {
      patients: [],
      appointments: appointments.filter(apt => 
        apt.patient_name.toLowerCase().includes(query) ||
        apt.doctor_name.toLowerCase().includes(query)
      ),
      documents: Object.values(medicalRecords).flat().filter(doc =>
        doc.name.toLowerCase().includes(query)
      ),
      hospitals: hospitalsCache.data ? hospitalsCache.data.filter(hospital =>
        hospital.name.toLowerCase().includes(query) ||
        hospital.services.some(service => service.toLowerCase().includes(query))
      ) : []
    };

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// User mood endpoints
app.post('/api/user/:id/mood', (req, res) => {
  try {
    const { id } = req.params;
    const { mood, intensity, description, emoji } = req.body;

    userMoods[id] = {
      mood,
      intensity,
      description,
      emoji,
      timestamp: new Date().toISOString()
    };

    res.json({ success: true, mood: userMoods[id] });
  } catch (error) {
    console.error('Mood save error:', error);
    res.status(500).json({ error: 'Failed to save mood' });
  }
});

app.get('/api/user/:id/mood', (req, res) => {
  try {
    const { id } = req.params;
    const mood = userMoods[id] || null;
    res.json({ mood });
  } catch (error) {
    console.error('Mood fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch mood' });
  }
});

// News endpoint with caching
app.get('/api/news', async (req, res) => {
  try {
    if (isCacheValid(newsCache)) {
      return res.json(newsCache.data);
    }

    // Mock news data (replace with real Google News API)
    const mockNews = [
      {
        title: "New Breakthrough in Heart Disease Treatment",
        description: "Researchers discover innovative therapy that reduces heart attack risk by 40%",
        url: "https://example.com/news/1",
        urlToImage: "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
        publishedAt: new Date().toISOString(),
        source: { name: "Health News Today" }
      },
      {
        title: "Mental Health Awareness Week",
        description: "Join millions in promoting mental wellness and breaking stigma around mental health",
        url: "https://example.com/news/2",
        urlToImage: "https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
        publishedAt: new Date().toISOString(),
        source: { name: "Wellness Weekly" }
      },
      {
        title: "COVID-19 Vaccination Updates",
        description: "Latest guidelines for booster shots and new variant protection measures",
        url: "https://example.com/news/3",
        urlToImage: "https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
        publishedAt: new Date().toISOString(),
        source: { name: "Medical Journal" }
      }
    ];

    newsCache = {
      data: mockNews,
      timestamp: Date.now()
    };

    res.json(mockNews);
  } catch (error) {
    console.error('News fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Hospitals endpoint with real Amalapuram data
app.get('/api/hospitals', async (req, res) => {
  try {
    if (isCacheValid(hospitalsCache)) {
      return res.json(hospitalsCache.data);
    }

    // Real Amalapuram hospitals data
    const realHospitals = [
      {
        id: '1',
        name: 'Government General Hospital Amalapuram',
        type: 'Government',
        address: 'Hospital Road, Amalapuram, East Godavari, Andhra Pradesh 533201',
        phone: '+91-8856-222222',
        rating: 4.2,
        reviews: 156,
        services: ['Emergency', 'General Medicine', 'Surgery', 'Pediatrics', 'Gynecology'],
        image: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
        distance: '2.1 km',
        coordinates: { lat: 16.5804, lng: 82.0067 }
      },
      {
        id: '2',
        name: 'Sri Venkateswara Hospital',
        type: 'Private',
        address: 'Main Road, Amalapuram, East Godavari, Andhra Pradesh 533201',
        phone: '+91-8856-233333',
        rating: 4.5,
        reviews: 89,
        services: ['Cardiology', 'Orthopedics', 'General Medicine', 'Diagnostics'],
        image: 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
        distance: '1.8 km',
        coordinates: { lat: 16.5834, lng: 82.0097 }
      },
      {
        id: '3',
        name: 'Amalapuram Nursing Home',
        type: 'Private',
        address: 'Gandhi Nagar, Amalapuram, East Godavari, Andhra Pradesh 533201',
        phone: '+91-8856-244444',
        rating: 4.1,
        reviews: 67,
        services: ['General Medicine', 'Surgery', 'Maternity', 'Emergency'],
        image: 'https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
        distance: '3.2 km',
        coordinates: { lat: 16.5774, lng: 82.0127 }
      },
      {
        id: '4',
        name: 'Konaseema Institute of Medical Sciences',
        type: 'Private',
        address: 'NH-214, Amalapuram, East Godavari, Andhra Pradesh 533201',
        phone: '+91-8856-255555',
        rating: 4.7,
        reviews: 234,
        services: ['Multi-specialty', 'ICU', 'Emergency', 'Diagnostics', 'Surgery'],
        image: 'https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
        distance: '4.5 km',
        coordinates: { lat: 16.5904, lng: 82.0167 }
      },
      {
        id: '5',
        name: 'District Hospital Amalapuram',
        type: 'Government',
        address: 'Collectorate Complex, Amalapuram, East Godavari, Andhra Pradesh 533201',
        phone: '+91-8856-266666',
        rating: 3.9,
        reviews: 198,
        services: ['Emergency', 'General Medicine', 'Pediatrics', 'Gynecology', 'Surgery'],
        image: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
        distance: '2.8 km',
        coordinates: { lat: 16.5844, lng: 82.0037 }
      },
      {
        id: '6',
        name: 'Apollo Clinic Amalapuram',
        type: 'Private',
        address: 'Commercial Complex, Amalapuram, East Godavari, Andhra Pradesh 533201',
        phone: '+91-8856-277777',
        rating: 4.6,
        reviews: 145,
        services: ['General Medicine', 'Diagnostics', 'Cardiology', 'Dermatology'],
        image: 'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
        distance: '1.5 km',
        coordinates: { lat: 16.5824, lng: 82.0087 }
      }
    ];

    hospitalsCache = {
      data: realHospitals,
      timestamp: Date.now()
    };

    res.json(realHospitals);
  } catch (error) {
    console.error('Hospitals fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
});

// Appointments endpoints
app.get('/api/appointments/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userAppointments = appointments.filter(apt => apt.user_id === userId);
    res.json(userAppointments);
  } catch (error) {
    console.error('Appointments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.post('/api/appointments', (req, res) => {
  try {
    const {
      user_id,
      doctor_name,
      doctor_specialty,
      hospital_name,
      appointment_date,
      appointment_time,
      patient_name,
      patient_phone,
      patient_email,
      symptoms
    } = req.body;

    // Validate required fields
    if (!user_id || !doctor_name || !appointment_date || !appointment_time || !patient_name || !patient_phone) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Please fill in all required appointment information'
      });
    }

    // Check for conflicts
    const conflictingAppointment = appointments.find(apt => 
      apt.appointment_date === appointment_date && 
      apt.appointment_time === appointment_time &&
      apt.doctor_name === doctor_name &&
      apt.status === 'scheduled'
    );

    if (conflictingAppointment) {
      return res.status(409).json({ 
        error: 'Time slot unavailable',
        details: 'This time slot is already booked. Please select a different time.'
      });
    }

    // Create new appointment
    const newAppointment = {
      id: Date.now().toString(),
      user_id,
      doctor_name,
      doctor_specialty,
      doctor_avatar: req.body.doctor_avatar || '',
      hospital_name,
      appointment_date,
      appointment_time,
      patient_name,
      patient_phone,
      patient_email,
      symptoms: symptoms || '',
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    appointments.push(newAppointment);

    // Create notification
    notifications.push({
      id: Date.now().toString(),
      user_id,
      title: 'Appointment Confirmed',
      message: `Your appointment with ${doctor_name} on ${appointment_date} at ${appointment_time} has been confirmed.`,
      type: 'appointment',
      timestamp: new Date(),
      read: false
    });

    res.status(201).json({ 
      success: true, 
      appointment: newAppointment,
      message: 'Appointment booked successfully'
    });
  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ 
      error: 'Booking failed',
      details: 'Unable to process your appointment request. Please try again or contact support.'
    });
  }
});

// Document analysis endpoint
app.post('/api/analyze', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    
    // OCR processing
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    
    // Simple NLP classification
    const category = classifyDocument(text, req.file.originalname);
    
    const analysis = {
      filename: req.file.originalname,
      category,
      extractedText: text.substring(0, 500), // First 500 characters
      confidence: 0.85,
      filePath: `/uploads/${req.file.filename}`
    };

    res.json(analysis);
  } catch (error) {
    console.error('Document analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Document classification helper
function classifyDocument(text, filename) {
  const textLower = text.toLowerCase();
  const filenameLower = filename.toLowerCase();
  
  if (textLower.includes('prescription') || textLower.includes('medication') || textLower.includes('dosage')) {
    return 'prescription';
  } else if (textLower.includes('lab') || textLower.includes('test') || textLower.includes('blood') || textLower.includes('urine')) {
    return 'lab';
  } else if (textLower.includes('scan') || textLower.includes('x-ray') || textLower.includes('mri') || textLower.includes('ct')) {
    return 'scan';
  } else if (textLower.includes('referral') || textLower.includes('specialist') || textLower.includes('consultation')) {
    return 'referral';
  } else if (filenameLower.includes('heart') || textLower.includes('cardiac') || textLower.includes('ecg')) {
    return 'heart';
  } else if (filenameLower.includes('lung') || textLower.includes('respiratory') || textLower.includes('chest')) {
    return 'lungs';
  } else if (filenameLower.includes('brain') || textLower.includes('neuro') || textLower.includes('neurological')) {
    return 'brain';
  } else if (filenameLower.includes('bone') || textLower.includes('fracture') || textLower.includes('joint')) {
    return 'bones';
  } else {
    return 'general';
  }
}

// Notifications endpoints
app.get('/api/notifications/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userNotifications = notifications.filter(notif => notif.user_id === userId);
    res.json(userNotifications);
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Settings endpoints
app.get('/api/settings/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    // Mock settings data
    const settings = {
      notifications: true,
      darkMode: false,
      language: 'en',
      emergencyContacts: []
    };
    res.json(settings);
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const settings = req.body;
    // In production, save to database
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Create uploads directory if it doesn't exist
const createUploadsDir = async () => {
  try {
    await fs.access('uploads');
  } catch {
    await fs.mkdir('uploads');
  }
};

// Initialize server
const startServer = async () => {
  await createUploadsDir();
  
  app.listen(PORT, () => {
    console.log(`🏥 Healthcare API server running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
  });
};

// Cache refresh cron job (every 10 minutes)
cron.schedule('*/10 * * * *', () => {
  console.log('🔄 Refreshing cache...');
  newsCache = { data: null, timestamp: null };
  hospitalsCache = { data: null, timestamp: null };
});

startServer().catch(console.error);

module.exports = app;