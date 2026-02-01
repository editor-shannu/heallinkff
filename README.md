# Heal Link - Healthcare Application

A production-ready healthcare application built with React, TypeScript, Firebase Authentication, Node.js/Express backend, and comprehensive API integration.

## Features

### 🔐 Authentication System
- **Firebase Authentication** with Google Sign-In integration
- **Email/Password authentication** with comprehensive validation
- **Face ID verification** for enhanced security
- **Session persistence** and protected routes
- **Comprehensive error handling** for all auth scenarios

### 🏥 Healthcare Features
- **Medical Records Management** with AI-powered document categorization
- **Appointment Booking System** with conflict detection and real-time validation
- **Mood-Aware AI Chatbot** with empathetic responses
- **Health Insights Dashboard** with personalized tracking
- **Real Hospital Directory** for Amalapuram area with Private/Government classification
- **Smart Notification System** for real user activities
- **Functional Search** across patients, appointments, documents, and hospitals

### 📱 Mobile-First Design
- **Responsive UI** optimized for mobile devices
- **Bottom Navigation** with 5 main sections
- **Modern Card-based Layout** with smooth animations
- **Accessibility Features** with proper ARIA labels
- **Dark/Light theme support** (configurable)

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js, RESTful APIs
- **Authentication**: Firebase Auth with Google OAuth
- **Database**: Supabase (PostgreSQL) with real-time features
- **Document Processing**: Tesseract.js OCR, AI classification
- **External APIs**: Google News, Google Places (configurable)
- **State Management**: React Hooks + Context
- **Icons**: Lucide React
- **Forms**: React Hook Form with validation
- **Build Tool**: Vite
- **Testing**: Jest (unit), Cypress (E2E)
- **Deployment**: Netlify (frontend), configurable backend hosting

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Authentication enabled
- Supabase project for data storage
- API keys for external services (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd heal-link
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Backend Setup**
   ```bash
   # Install backend dependencies
   cd server && npm install
   cd ..
   ```

4. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Firebase and Supabase credentials:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Backend API Keys (optional)
   GOOGLE_NEWS_API_KEY=your_google_news_api_key
   GOOGLE_PLACES_KEY=your_google_places_api_key
   VISION_KEY=your_google_vision_api_key
   OPENAI_KEY=your_openai_api_key
   ```

5. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication with Google and Email/Password providers
   - Add your domain to authorized domains
   - Copy configuration values to `.env`

6. **Supabase Setup**
   - Create a Supabase project at [Supabase](https://supabase.com)
   - Run the provided SQL migrations:
     ```bash
     # Run migrations
     psql -h your-supabase-host -U postgres -d postgres -f migrations/001_create_tables.sql
     
     # Seed real hospital data
     psql -h your-supabase-host -U postgres -d postgres -f seeds/real_hospitals.sql
     ```
   - Copy URL and anon key to `.env`

7. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start separately
   npm run server  # Backend on port 3001
   npm run dev     # Frontend on port 5173
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, cards, etc.)
│   ├── BottomNavigation.tsx
│   ├── ErrorBoundary.tsx
│   ├── FaceCapture.tsx
│   └── ProtectedRoute.tsx
├── hooks/              # Custom React hooks
│   ├── useFirebaseAuth.ts
│   ├── useAppointments.ts
│   └── useFaceVerification.ts
├── screens/            # Main application screens
│   ├── Login/
│   ├── Dashboard/
│   ├── MedicalRecordsScreen.tsx
│   ├── AppointmentDetailsScreen.tsx
│   ├── ChatbotScreen.tsx
│   ├── NotificationsScreen.tsx
│   └── SettingsScreen.tsx
├── services/           # External service integrations
│   ├── api.ts          # Backend API integration
│   └── faceVerification.ts
├── lib/                # Utility libraries
│   ├── supabase.ts
│   └── utils.ts
├── config/             # Configuration files
│   └── firebase.ts
└── App.tsx

server/                  # Backend API server
├── index.js            # Express server with all endpoints
└── uploads/            # Document upload directory

tests/                   # Test files
├── appointment.test.js  # Unit tests
└── setup.js

cypress/                 # E2E tests
├── e2e/
│   └── appointment-booking.cy.js
└── support/

migrations/              # Database migrations
└── 001_create_tables.sql

seeds/                   # Database seeds
└── real_hospitals.sql
```

## Key Features Implementation

### Authentication Flow
1. **Login Screen** with email/password and Google Sign-In
2. **Face ID Registration** for new users (optional but recommended)
3. **Face ID Verification** for returning users
4. **Protected Routes** that require authentication
5. **Session Management** with automatic token refresh

### Production Features

#### **Header & Navigation**
- **Real user display** with Google account name and profile photo
- **Functional search** with backend integration (`GET /api/search`)
- **Mood survey integration** with clickable "How are you feeling today?"

#### **Mood-Aware System**
- **Mood persistence** via `POST /api/user/:id/mood`
- **AI chatbot adaptation** based on user's emotional state
- **Empathetic responses** and comfort prompts

#### **Hero Section**
- **Smart content display**: Shows upcoming appointments or Google News headlines
- **Server-side caching** (10 minutes) for optimal performance
- **Real-time news integration** with source attribution

### Appointment Management
- **Real slot validation** with conflict detection
- **Comprehensive error handling** with specific error messages
- **Success confirmation** with appointment details
- **Backend validation** via `POST /api/appointments`

### Medical Records & Document Processing
- **AI-powered categorization** using OCR and NLP
- **Automatic filing** into appropriate medical categories
- **Document analysis** via `POST /api/analyze`
- **Real document viewing** and management

### Hospital Directory
- **Real Amalapuram hospitals** with authentic data
- **Private/Government classification** 
- **Contact information** and service listings
- **No fake data** - all hospitals are real establishments

## Security Features

### Authentication Security
- **Firebase Auth** handles secure token management
- **Face ID Verification** prevents account sharing
- **Account Termination** for duplicate face detection
- **Secure Session Storage** with automatic cleanup

### Data Protection
- **Row Level Security** in Supabase
- **Encrypted Face Embeddings** stored locally
- **Input Validation** on all forms
- **XSS Protection** with proper sanitization

## API Endpoints

### Core APIs
- `GET /api/search?q=...` - Universal search across all data
- `POST /api/user/:id/mood` - Save user mood data
- `GET /api/user/:id/mood` - Retrieve user mood
- `GET /api/news` - Fetch cached health news headlines
- `GET /api/hospitals` - Get real Amalapuram hospitals
- `GET /api/appointments/:userId` - User's appointments
- `POST /api/appointments` - Book new appointment
- `POST /api/analyze` - AI document analysis with OCR
- `GET /api/notifications/:userId` - Real user notifications
- `GET/PUT /api/settings/:userId` - User settings management

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Open Cypress UI
npm run test:e2e:open
```

### Test Coverage
- **Appointment booking** with validation and conflict detection
- **Document upload** and AI analysis
- **User authentication** and session management
- **API error handling** and edge cases

## Deployment

### Netlify Deployment
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your repository to Netlify
   - Set environment variables in Netlify dashboard
   - Deploy with automatic builds on push

3. **Backend Deployment**
   - Deploy server to Heroku, Railway, or similar
   - Set environment variables for API keys
   - Configure CORS for your frontend domain

4. **Configure Redirects**
   ```
   /*    /index.html   200
   ```

### Environment Variables for Production
Ensure all environment variables are set in your deployment platform:
- Firebase configuration
- Supabase credentials
- Google News API key
- Google Places API key
- Google Vision API key
- OpenAI API key

## CHANGELOG

### Files Changed
- `package.json` - Added backend dependencies and test scripts
- `server/index.js` - Complete Express.js backend with all APIs
- `src/services/api.ts` - Frontend API integration layer
- `src/screens/Dashboard/Dashboard.tsx` - Real user display, functional search, mood integration
- `src/screens/AppointmentDetailsScreen.tsx` - Fixed booking errors with backend integration
- `src/screens/MedicalRecordsScreen.tsx` - AI document analysis integration
- `src/screens/SettingsScreen.tsx` - Functional settings with backend persistence
- `src/screens/NotificationsScreen.tsx` - Real notifications from backend
- `src/screens/ChatbotScreen.tsx` - Mood-aware chatbot responses
- `tests/` - Unit tests for appointment booking and document analysis
- `cypress/` - E2E tests for complete user workflows
- `migrations/` - Database schema for production
- `seeds/` - Real hospital data for Amalapuram area

### API Endpoints Added
- Search, mood tracking, news, hospitals, appointments, document analysis, notifications, settings
- All endpoints include proper validation, error handling, and caching where appropriate

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

---

Built with ❤️ for better healthcare accessibility in Amalapuram and beyond