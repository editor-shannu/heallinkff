import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { Button } from "../../components/ui/button";
import { useFirebaseAuth } from "../../hooks/useFirebaseAuth";
import { searchAPI, moodAPI, newsAPI, hospitalsAPI } from "../../services/api";
import { supabase } from "../../lib/supabase";
import { MoodSurvey, MoodData } from "../../components/MoodSurvey";
import { HealthInsightsCard } from "../../components/HealthInsightsCard";
import { UpcomingAppointmentCard } from "../../components/UpcomingAppointmentCard";
import { HospitalPreviewCard } from "../../components/HospitalPreviewCard";
import { SplashScreen } from "../SplashScreen";
import { HospitalListScreen } from "../HospitalListScreen";
import { HospitalDetailsScreen } from "../HospitalDetailsScreen";
import { AppointmentDetailsScreen } from "../AppointmentDetailsScreen";
import { AppointmentListScreen } from "../AppointmentListScreen";
import { MedicalRecordsScreen } from "../MedicalRecordsScreen";
import { ServicesScreen } from "../ServicesScreen";
import { ChatbotScreen } from "../ChatbotScreen";
import { NotificationsScreen } from "../NotificationsScreen";
import { SettingsScreen } from "../SettingsScreen";
import { BottomNavigation } from "../../components/BottomNavigation";
import { 
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink
} from "lucide-react";

type Screen = 'splash' | 'home' | 'hospital-list' | 'hospital-details' | 'appointment-details' | 'appointment-list' | 'records' | 'services' | 'chatbot' | 'notifications' | 'settings';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  avatar: string;
  available: boolean;
}

interface RealHospital {
  id: string;
  name: string;
  type: 'Private' | 'Government';
  address: string;
  phone: string;
  rating: number;
  reviews: number;
  services: string[];
  image: string;
  distance: string;
}

export const Dashboard = (): JSX.Element => {
  const { user } = useFirebaseAuth();
  const { t, settings } = useApp();
  const [hospitals, setHospitals] = useState<RealHospital[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [selectedHospital, setSelectedHospital] = useState<RealHospital | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showMoodSurvey, setShowMoodSurvey] = useState(false);
  const [userMood, setUserMood] = useState<MoodData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize database and load data
  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize notifications in localStorage
        if (user?.uid) {
          const existing = localStorage.getItem('heal_link_notifications');
          if (!existing) {
            const welcomeNotifications = [
              {
                id: 'welcome-1',
                user_id: user.uid,
                title: 'Welcome to Heal Link!',
                message: 'Your healthcare companion is ready to help you manage appointments, records, and health insights.',
                type: 'system',
                timestamp: new Date().toISOString(),
                read: false
              }
            ];
            localStorage.setItem('heal_link_notifications', JSON.stringify(welcomeNotifications));
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    if (user) {
      initializeApp();
    }
  }, [user]);
  // Initialize notifications on first load
  React.useEffect(() => {
    const initializeNotifications = () => {
      const existing = localStorage.getItem('heal_link_notifications');
      if (!existing) {
        const welcomeNotifications = [
          {
            id: 'welcome-1',
            user_id: user?.uid || 'anonymous',
            title: 'Welcome to Heal Link!',
            message: 'Your healthcare companion is ready to help you manage appointments, records, and health insights.',
            type: 'system',
            timestamp: new Date().toISOString(),
            read: false
          }
        ];
        localStorage.setItem('heal_link_notifications', JSON.stringify(welcomeNotifications));
      }
    };

    if (user) {
      initializeNotifications();
    }
  }, [user]);

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [hospitalsData, newsData] = await Promise.all([
          hospitalsAPI.getHospitals(),
          newsAPI.getNews()
        ]);
        setHospitals(hospitalsData);
        setNews(newsData);
        
        // Load user mood if exists
        if (user?.uid) {
          const moodData = await moodAPI.getMood(user.uid);
          setUserMood(moodData.mood);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Auto-scroll for news slider
  React.useEffect(() => {
    if (news.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % news.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [news.length]);

  const handleMoodSelect = (mood: MoodData) => {
    setUserMood(mood);
    
    // Save mood to backend
    if (user?.uid) {
      moodAPI.saveMood(user.uid, mood).catch(console.error);
    }
  };

  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const formatUserName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        // Search in localStorage for now
        let results = { patients: [], appointments: [], documents: [], hospitals: [] };
        
        // Search appointments in localStorage
        if (user?.uid) {
          const saved = localStorage.getItem('heal_link_appointments');
          const allAppointments = saved ? JSON.parse(saved) : [];
          const userAppointments = allAppointments.filter((apt: any) => apt.user_id === user.uid);
          
          results.appointments = userAppointments.filter((apt: any) =>
            apt.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.hospital_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (apt.symptoms && apt.symptoms.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        
        // Search hospitals
        const hospitalsData = await hospitalsAPI.getHospitals();
        results.hospitals = hospitalsData.filter(hospital =>
          hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hospital.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase())) ||
          hospital.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults({ patients: [], appointments: [], documents: [], hospitals: [] });
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % news.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + news.length) % news.length);
  };

  const handleNewsClick = (url: string) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  // Splash Screen
  if (currentScreen === 'splash') {
    return (
      <SplashScreen 
        onComplete={() => setCurrentScreen('home')} 
      />
    );
  }

  // Hospital List Screen
  if (currentScreen === 'hospital-list') {
    return (
      <HospitalListScreen
        onBack={() => setCurrentScreen('home')}
        onHospitalSelect={(hospital) => {
          setSelectedHospital(hospital);
          setCurrentScreen('hospital-details');
        }}
      />
    );
  }

  // Hospital Details Screen
  if (currentScreen === 'hospital-details' && selectedHospital) {
    return (
      <HospitalDetailsScreen
        hospital={selectedHospital}
        onBack={() => setCurrentScreen('hospital-list')}
        onBookAppointment={(doctor) => {
          setSelectedDoctor(doctor);
          setCurrentScreen('appointment-details');
        }}
      />
    );
  }

  // Appointment Details Screen
  if (currentScreen === 'appointment-details' && selectedDoctor) {
    return (
      <AppointmentDetailsScreen
        doctor={selectedDoctor}
        hospital={selectedHospital}
        onBack={() => setCurrentScreen('hospital-details')}
        onConfirm={() => setCurrentScreen('home')}
      />
    );
  }

  // Appointment List Screen
  if (currentScreen === 'appointment-list') {
    return (
      <AppointmentListScreen
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

  // Medical Records Screen
  if (currentScreen === 'records') {
    return (
      <MedicalRecordsScreen
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

  // Services Screen
  if (currentScreen === 'services') {
    return (
      <ServicesScreen
        onBack={() => setCurrentScreen('home')}
        onServiceSelect={(service) => {
          if (service === 'appointment') {
            setCurrentScreen('hospital-list');
          } else {
            // Handle other services
            console.log('Selected service:', service);
          }
        }}
      />
    );
  }

  // Chatbot Screen
  if (currentScreen === 'chatbot') {
    return (
      <ChatbotScreen
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

  // Notifications Screen
  if (currentScreen === 'notifications') {
    return (
      <NotificationsScreen
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

  // Settings Screen
  if (currentScreen === 'settings') {
    return (
      <SettingsScreen
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

  // Main Home Screen
  return (
    <>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40`}>
        <div className="flex items-center space-x-3">
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserName())}&background=3bacd6&color=fff&size=48`}
            alt="Profile"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-blue-100"
          />
          <div>
            <h1 className={`text-base sm:text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'} font-['Inter'] truncate max-w-[120px] sm:max-w-none`}>
              {t('dashboard.greeting')} {user?.displayName || formatUserName(getUserName())}
            </h1>
            <button 
              onClick={() => setShowMoodSurvey(true)}
              className={`${settings.darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} text-xs sm:text-sm transition-colors cursor-pointer truncate max-w-[120px] sm:max-w-none`}
            >
              {t('dashboard.mood_question')} {userMood && userMood.emoji}
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder={t('dashboard.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className={`pl-8 pr-4 py-2 border ${settings.darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32 sm:w-48`}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearch}
              disabled={isSearching}
              className="p-2"
              style={{ position: 'absolute', left: '4px', top: '50%', transform: 'translateY(-50%)' }}
            >
              <Search className={`w-4 h-4 ${settings.darkMode ? 'text-gray-300' : 'text-gray-400'} ${isSearching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className={`px-4 py-2 ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border-b relative z-30`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>Search Results</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchResults(null);
                setSearchQuery('');
              }}
              className={settings.darkMode ? 'text-gray-400' : 'text-gray-500'}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
            {/* Hospitals */}
            {searchResults.hospitals?.length > 0 && (
              <div>
                <h4 className={`text-sm font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Hospitals</h4>
                {searchResults.hospitals.map((hospital: any) => (
                  <div
                    key={hospital.id}
                    className={`p-2 ${settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg cursor-pointer`}
                    onClick={() => {
                      setSelectedHospital(hospital);
                      setCurrentScreen('hospital-details');
                      setSearchResults(null);
                      setSearchQuery('');
                    }}
                  >
                    <p className={`font-medium text-sm ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{hospital.name}</p>
                    <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{hospital.type} Hospital</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Appointments */}
            {searchResults.appointments?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-1">Appointments</h4>
                {searchResults.appointments.map((appointment: any) => (
                  <div key={appointment.id} className="p-2 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm">{appointment.doctor_name}</p>
                    <p className="text-xs text-gray-600">{appointment.appointment_date} at {appointment.appointment_time}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Documents */}
            {searchResults.documents?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-1">Documents</h4>
                {searchResults.documents.map((document: any, index: number) => (
                  <div key={index} className="p-2 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm">{document.name}</p>
                    <p className="text-xs text-gray-600">{document.category}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* No Results */}
            {(!searchResults.hospitals?.length && !searchResults.appointments?.length && !searchResults.documents?.length) && (
              <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm text-center py-4`}>No results found for "{searchQuery}"</p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`px-4 py-4 sm:py-6 pb-24 overflow-x-hidden ${settings.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* News/Hero Slider */}
        {!loading && news.length > 0 && (
          <div className="relative mb-6">
            <div className="border-0 shadow-lg overflow-hidden rounded-2xl">
              <div className="p-0 relative">
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
                  <img
                    src={news[currentSlide]?.urlToImage || 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop'}
                    alt={news[currentSlide]?.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/90 to-blue-600/90" />
                  
                  <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                    <div>
                      <div className="flex items-center space-x-2 mb-2 flex-wrap">
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          {news[currentSlide]?.source?.name}
                        </span>
                        <span className="text-xs opacity-75">
                          {new Date(news[currentSlide]?.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold mb-2 line-clamp-2">
                        {news[currentSlide]?.title}
                      </h3>
                      <p className="text-sm opacity-90 line-clamp-2">
                        {news[currentSlide]?.description}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        handleNewsClick(news[currentSlide]?.url);
                      }}
                      className="self-start bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors flex items-center space-x-1"
                    >
                      <span>Read More</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                    aria-label="Previous news"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                    aria-label="Next news"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {news.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-white' : 'bg-white/50'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Health Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
          <HealthInsightsCard />
          <UpcomingAppointmentCard 
            onTap={() => setCurrentScreen('appointment-list')}
          />
        </div>

        {/* Top Hospitals Section */}
        {!loading && hospitals.length > 0 && (
          <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg sm:text-xl font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'} font-['Inter']`}>
              {t('dashboard.top_hospitals')}
            </h3>
            <Button 
              variant="ghost" 
              className={`${settings.darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}
              onClick={() => setCurrentScreen('hospital-list')}
            >
              {t('dashboard.see_all')}
            </Button>
          </div>

          <div className="space-y-4">
            {hospitals.slice(0, 2).map((hospital) => (
              <HospitalPreviewCard
                key={hospital.id}
                hospital={hospital}
                onClick={() => {
                  setSelectedHospital(hospital);
                  setCurrentScreen('hospital-details');
                }}
              />
            ))}
          </div>
        </div>
        )}
      </div>

      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={currentScreen === 'home' ? 'home' : activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'home') {
            setCurrentScreen('home');
          } else {
            setCurrentScreen(tab as Screen);
          }
        }}
      />

      {/* Mood Survey Modal */}
      <MoodSurvey
        isOpen={showMoodSurvey}
        onClose={() => setShowMoodSurvey(false)}
        onMoodSelect={handleMoodSelect}
      />
    </>
  );
};