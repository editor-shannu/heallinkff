import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppSettings {
  darkMode: boolean;
  language: 'english' | 'telugu' | 'hindi';
}

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toggleDarkMode: () => void;
  changeLanguage: (language: 'english' | 'telugu' | 'hindi') => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
  english: {
    // Navigation
    'nav.home': 'Home',
    'nav.records': 'Records',
    'nav.chatbot': 'Chatbot',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.greeting': 'Hello',
    'dashboard.mood_question': 'How are you feeling today?',
    'dashboard.search_placeholder': 'Search...',
    'dashboard.health_insights': 'Health Insights',
    'dashboard.upcoming_appointment': 'Upcoming Appointment',
    'dashboard.top_hospitals': 'Top Hospitals',
    'dashboard.see_all': 'See all',
    'dashboard.no_appointments': 'No upcoming appointments',
    'dashboard.book_appointment': 'Book an appointment to see it here',
    
    // Settings
    'settings.title': 'Settings',
    'settings.account': 'Account',
    'settings.profile_settings': 'Profile Settings',
    'settings.notifications': 'Notifications',
    'settings.privacy_security': 'Privacy & Security',
    'settings.health': 'Health',
    'settings.health_data': 'Health Data',
    'settings.emergency_contacts': 'Emergency Contacts',
    'settings.app_settings': 'App Settings',
    'settings.dark_mode': 'Dark Mode',
    'settings.language': 'Language',
    'settings.support': 'Support',
    'settings.help_support': 'Help & Support',
    'settings.sign_out': 'Sign Out',
    'settings.saved': 'Saved',
    'settings.error': 'Error',
    
    // Profile
    'profile.full_name': 'Full Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone Number',
    'profile.date_of_birth': 'Date of Birth',
    'profile.gender': 'Gender',
    'profile.address': 'Address',
    'profile.save_profile': 'Save Profile',
    
    // Appointments
    'appointments.title': 'My Appointments',
    'appointments.book_appointment': 'Book Appointment',
    'appointments.select_date': 'Select Date',
    'appointments.select_time': 'Select Time',
    'appointments.patient_info': 'Patient Information',
    'appointments.confirm_appointment': 'Confirm Appointment',
    'appointments.appointment_confirmed': 'Appointment Confirmed!',
    'appointments.today': 'Today',
    'appointments.tomorrow': 'Tomorrow',
    
    // Medical Records
    'records.title': 'Medical Records',
    'records.upload_documents': 'Upload Medical Documents',
    'records.no_documents': 'No documents uploaded',
    'records.emergency_record': 'Emergency Medical Record (EMR)',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.done': 'Done',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  
  telugu: {
    // Navigation
    'nav.home': 'హోమ్',
    'nav.records': 'రికార్డులు',
    'nav.chatbot': 'చాట్‌బాట్',
    'nav.notifications': 'నోటిఫికేషన్లు',
    'nav.settings': 'సెట్టింగ్స్',
    
    // Dashboard
    'dashboard.greeting': 'నమస్కారం',
    'dashboard.mood_question': 'మీరు ఈరోజు ఎలా అనిపిస్తున్నారు?',
    'dashboard.search_placeholder': 'వెతకండి...',
    'dashboard.health_insights': 'ఆరోగ్య అంతర్దృష్టులు',
    'dashboard.upcoming_appointment': 'రాబోయే అపాయింట్‌మెంట్',
    'dashboard.top_hospitals': 'టాప్ హాస్పిటల్స్',
    'dashboard.see_all': 'అన్నీ చూడండి',
    'dashboard.no_appointments': 'రాబోయే అపాయింట్‌మెంట్లు లేవు',
    'dashboard.book_appointment': 'దీన్ని ఇక్కడ చూడటానికి అపాయింట్‌మెంట్ బుక్ చేయండి',
    
    // Settings
    'settings.title': 'సెట్టింగ్స్',
    'settings.account': 'ఖాతా',
    'settings.profile_settings': 'ప్రొఫైల్ సెట్టింగ్స్',
    'settings.notifications': 'నోటిఫికేషన్లు',
    'settings.privacy_security': 'గోప్యత & భద్రత',
    'settings.health': 'ఆరోగ్యం',
    'settings.health_data': 'ఆరోగ్య డేటా',
    'settings.emergency_contacts': 'అత్యవసర పరిచయాలు',
    'settings.app_settings': 'యాప్ సెట్టింగ్స్',
    'settings.dark_mode': 'డార్క్ మోడ్',
    'settings.language': 'భాష',
    'settings.support': 'మద్దతు',
    'settings.help_support': 'సహాయం & మద్దతు',
    'settings.sign_out': 'సైన్ అవుట్',
    'settings.saved': 'సేవ్ చేయబడింది',
    'settings.error': 'లోపం',
    
    // Profile
    'profile.full_name': 'పూర్తి పేరు',
    'profile.email': 'ఇమెయిల్',
    'profile.phone': 'ఫోన్ నంబర్',
    'profile.date_of_birth': 'పుట్టిన తేదీ',
    'profile.gender': 'లింగం',
    'profile.address': 'చిరునామా',
    'profile.save_profile': 'ప్రొఫైల్ సేవ్ చేయండి',
    
    // Appointments
    'appointments.title': 'నా అపాయింట్‌మెంట్లు',
    'appointments.book_appointment': 'అపాయింట్‌మెంట్ బుక్ చేయండి',
    'appointments.select_date': 'తేదీ ఎంచుకోండి',
    'appointments.select_time': 'సమయం ఎంచుకోండి',
    'appointments.patient_info': 'రోగి సమాచారం',
    'appointments.confirm_appointment': 'అపాయింట్‌మెంట్ నిర్ధారించండి',
    'appointments.appointment_confirmed': 'అపాయింట్‌మెంట్ నిర్ధారించబడింది!',
    'appointments.today': 'ఈరోజు',
    'appointments.tomorrow': 'రేపు',
    
    // Medical Records
    'records.title': 'వైద్య రికార్డులు',
    'records.upload_documents': 'వైద్య పత్రాలను అప్‌లోడ్ చేయండి',
    'records.no_documents': 'పత్రాలు అప్‌లోడ్ చేయబడలేదు',
    'records.emergency_record': 'అత్యవసర వైద్య రికార్డు (EMR)',
    
    // Common
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.save': 'సేవ్ చేయండి',
    'common.cancel': 'రద్దు చేయండి',
    'common.confirm': 'నిర్ధారించండి',
    'common.back': 'వెనుకకు',
    'common.next': 'తదుపరి',
    'common.done': 'పూర్తయింది',
    'common.error': 'లోపం',
    'common.success': 'విజయం',
  },
  
  hindi: {
    // Navigation
    'nav.home': 'होम',
    'nav.records': 'रिकॉर्ड',
    'nav.chatbot': 'चैटबॉट',
    'nav.notifications': 'सूचनाएं',
    'nav.settings': 'सेटिंग्स',
    
    // Dashboard
    'dashboard.greeting': 'नमस्ते',
    'dashboard.mood_question': 'आज आप कैसा महसूस कर रहे हैं?',
    'dashboard.search_placeholder': 'खोजें...',
    'dashboard.health_insights': 'स्वास्थ्य अंतर्दृष्टि',
    'dashboard.upcoming_appointment': 'आगामी अपॉइंटमेंट',
    'dashboard.top_hospitals': 'टॉप अस्पताल',
    'dashboard.see_all': 'सभी देखें',
    'dashboard.no_appointments': 'कोई आगामी अपॉइंटमेंट नहीं',
    'dashboard.book_appointment': 'इसे यहाँ देखने के लिए अपॉइंटमेंट बुक करें',
    
    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.account': 'खाता',
    'settings.profile_settings': 'प्रोफाइल सेटिंग्स',
    'settings.notifications': 'सूचनाएं',
    'settings.privacy_security': 'गोपनीयता और सुरक्षा',
    'settings.health': 'स्वास्थ्य',
    'settings.health_data': 'स्वास्थ्य डेटा',
    'settings.emergency_contacts': 'आपातकालीन संपर्क',
    'settings.app_settings': 'ऐप सेटिंग्स',
    'settings.dark_mode': 'डार्क मोड',
    'settings.language': 'भाषा',
    'settings.support': 'सहायता',
    'settings.help_support': 'मदद और सहायता',
    'settings.sign_out': 'साइन आउट',
    'settings.saved': 'सहेजा गया',
    'settings.error': 'त्रुटि',
    
    // Profile
    'profile.full_name': 'पूरा नाम',
    'profile.email': 'ईमेल',
    'profile.phone': 'फोन नंबर',
    'profile.date_of_birth': 'जन्म तिथि',
    'profile.gender': 'लिंग',
    'profile.address': 'पता',
    'profile.save_profile': 'प्रोफाइल सहेजें',
    
    // Appointments
    'appointments.title': 'मेरे अपॉइंटमेंट',
    'appointments.book_appointment': 'अपॉइंटमेंट बुक करें',
    'appointments.select_date': 'तारीख चुनें',
    'appointments.select_time': 'समय चुनें',
    'appointments.patient_info': 'मरीज़ की जानकारी',
    'appointments.confirm_appointment': 'अपॉइंटमेंट की पुष्टि करें',
    'appointments.appointment_confirmed': 'अपॉइंटमेंट की पुष्टि हो गई!',
    'appointments.today': 'आज',
    'appointments.tomorrow': 'कल',
    
    // Medical Records
    'records.title': 'मेडिकल रिकॉर्ड',
    'records.upload_documents': 'मेडिकल दस्तावेज़ अपलोड करें',
    'records.no_documents': 'कोई दस्तावेज़ अपलोड नहीं किया गया',
    'records.emergency_record': 'आपातकालीन मेडिकल रिकॉर्ड (EMR)',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.confirm': 'पुष्टि करें',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.done': 'पूर्ण',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    language: 'english'
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('heal_link_app_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        
        // Apply dark mode immediately
        if (parsed.darkMode) {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
        }
      }
    } catch (error) {
      console.error('Error loading app settings:', error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('heal_link_app_settings', JSON.stringify(settings));
      
      // Apply dark mode
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error saving app settings:', error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const changeLanguage = (language: 'english' | 'telugu' | 'hindi') => {
    setSettings(prev => ({ ...prev, language }));
  };

  const t = (key: string): string => {
    return translations[settings.language][key] || key;
  };

  return (
    <AppContext.Provider value={{
      settings,
      updateSettings,
      toggleDarkMode,
      changeLanguage,
      t
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};