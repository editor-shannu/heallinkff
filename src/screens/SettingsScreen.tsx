import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Heart,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Globe,
  Smartphone,
  Plus,
  X,
  Save,
  Check,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

interface NotificationSettings {
  appointments: boolean;
  healthTips: boolean;
  emergencyAlerts: boolean;
  medicationReminders: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface HealthData {
  height: string;
  weight: string;
  bloodType: string;
  allergies: string;
  medications: string;
  medicalConditions: string;
  emergencyMedicalInfo: string;
  bloodPressure: string;
  heartRate: string;
  diabetic: boolean;
}

interface PrivacySettings {
  dataSharing: boolean;
  analyticsTracking: boolean;
  locationTracking: boolean;
  biometricAuth: boolean;
  twoFactorAuth: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack
}) => {
  const { user, logout } = useFirebaseAuth();
  const { settings: appSettings, toggleDarkMode, changeLanguage, t } = useApp();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    profilePhoto: user?.photoURL || ''
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    appointments: true,
    healthTips: true,
    emergencyAlerts: true,
    medicationReminders: true,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataSharing: false,
    analyticsTracking: true,
    locationTracking: false,
    biometricAuth: true,
    twoFactorAuth: false
  });

  // Health Data
  const [healthData, setHealthData] = useState<HealthData>({
    height: '',
    weight: '',
    bloodType: '',
    allergies: '',
    medications: '',
    medicalConditions: '',
    emergencyMedicalInfo: '',
    bloodPressure: '',
    heartRate: '',
    diabetic: false
  });

  // Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [tempContact, setTempContact] = useState<EmergencyContact>({
    id: '',
    name: '',
    phone: '',
    relation: ''
  });

  // App Settings
  const [darkMode, setDarkMode] = useState(appSettings.darkMode);
  const [language, setLanguage] = useState(appSettings.language);

  // Load settings on component mount
  React.useEffect(() => {
    loadAllSettings();
  }, [user]);

  const loadAllSettings = () => {
    try {
      const savedSettings = localStorage.getItem('heal_link_user_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setProfileData(prev => ({ ...prev, ...parsed.profile }));
        setNotificationSettings(prev => ({ ...prev, ...parsed.notifications }));
        setPrivacySettings(prev => ({ ...prev, ...parsed.privacy }));
        setHealthData(prev => ({ ...prev, ...parsed.health }));
        setEmergencyContacts(parsed.emergencyContacts || []);
        setDarkMode(parsed.darkMode || appSettings.darkMode);
        setLanguage(parsed.language || appSettings.language);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveAllSettings = async () => {
    setLoading(true);
    setSaveStatus(null);
    
    try {
      const settingsData = {
        profile: profileData,
        notifications: notificationSettings,
        privacy: privacySettings,
        health: healthData,
        emergencyContacts,
        darkMode,
        language,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem('heal_link_user_settings', JSON.stringify(settingsData));
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const addEmergencyContact = () => {
    if (tempContact.name && tempContact.phone && tempContact.relation) {
      const newContact = { ...tempContact, id: Date.now().toString() };
      setEmergencyContacts(prev => [...prev, newContact]);
      setTempContact({ id: '', name: '', phone: '', relation: '' });
      setActiveModal(null);
      saveAllSettings();
    }
  };

  const removeEmergencyContact = (id: string) => {
    setEmergencyContacts(prev => prev.filter(contact => contact.id !== id));
    saveAllSettings();
  };

  const updateHealthData = (field: keyof HealthData, value: string | boolean) => {
    setHealthData(prev => ({ ...prev, [field]: value }));
  };

  const updateNotificationSetting = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const updatePrivacySetting = (key: keyof PrivacySettings, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  const getUserName = () => {
    if (profileData.displayName) return profileData.displayName;
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'telugu': return 'తెలుగు';
      case 'hindi': return 'हिंदी';
      case 'english': return 'English';
      default: return 'English';
    }
  };

  const settingsGroups = [
    {
      title: t('settings.account'),
      items: [
        { id: 'profile', label: t('settings.profile_settings'), icon: User, action: () => setActiveModal('profile') },
        { id: 'notifications', label: t('settings.notifications'), icon: Bell, action: () => setActiveModal('notifications') },
        { id: 'privacy', label: t('settings.privacy_security'), icon: Shield, action: () => setActiveModal('privacy') }
      ]
    },
    {
      title: t('settings.health'),
      items: [
        { id: 'health-data', label: t('settings.health_data'), icon: Heart, action: () => setActiveModal('health') },
        { id: 'emergency', label: t('settings.emergency_contacts'), icon: Smartphone, action: () => setActiveModal('emergency') }
      ]
    },
    {
      title: t('settings.app_settings'),
      items: [
        { id: 'theme', label: t('settings.dark_mode'), icon: Moon, action: () => { 
          toggleDarkMode(); 
          setDarkMode(!darkMode); 
          saveAllSettings(); 
        }, toggle: true },
        { id: 'language', label: `Language (${getLanguageLabel(language)})`, icon: Globe, action: () => setActiveModal('language') }
      ]
    },
    {
      title: t('settings.support'),
      items: [
        { id: 'help', label: t('settings.help_support'), icon: HelpCircle, action: () => setActiveModal('help') }
      ]
    }
  ];

  return (
    <div className={`min-h-screen ${appSettings.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${appSettings.darkMode ? 'bg-gray-800' : 'bg-white'} px-4 py-4 flex items-center justify-between shadow-sm`}>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className={`w-5 h-5 ${appSettings.darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          </Button>
          <h1 className={`text-xl font-semibold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'} font-['Inter']`}>
            {t('settings.title')}
          </h1>
        </div>
        
        {/* Save Status */}
        {saveStatus && (
          <div className={`flex items-center space-x-1 text-sm ${
            saveStatus === 'saved' 
              ? (appSettings.darkMode ? 'text-green-400' : 'text-green-600')
              : (appSettings.darkMode ? 'text-red-400' : 'text-red-600')
          }`}>
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-4 h-4" />
                <span>{t('settings.saved')}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>{t('settings.error')}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="p-4 pb-24">
        {/* User Profile Card */}
        <Card className={`border-0 shadow-sm rounded-2xl mb-6 ${appSettings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={profileData.profilePhoto || user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserName())}&background=3bacd6&color=fff&size=64`}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                />
                <button 
                  onClick={() => setActiveModal('profile')}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                >
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'} font-['Inter']`}>
                  {getUserName()}
                </h3>
                <p className={`${appSettings.darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{profileData.email || user?.email}</p>
                {profileData.phone && (
                  <p className={`${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>{profileData.phone}</p>
                )}
              </div>
              <ChevronRight className={`w-5 h-5 ${appSettings.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            <h3 className={`text-sm font-semibold ${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide mb-3 px-2`}>
              {group.title}
            </h3>
            <Card className={`border-0 shadow-sm rounded-2xl ${appSettings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <CardContent className="p-0">
                {group.items.map((item, itemIndex) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={item.id}>
                      <button
                        onClick={item.action}
                        className={`w-full p-4 flex items-center justify-between ${appSettings.darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors text-left`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 ${appSettings.darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                            <IconComponent className={`w-5 h-5 ${appSettings.darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                          </div>
                          <span className={`font-medium ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {item.label}
                          </span>
                        </div>
                        {item.id === 'theme' ? (
                          <div className={`w-12 h-6 rounded-full transition-colors ${
                            appSettings.darkMode ? 'bg-blue-600' : 'bg-gray-300'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              appSettings.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                            } mt-0.5`} />
                          </div>
                        ) : (
                          <ChevronRight className={`w-5 h-5 ${appSettings.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        )}
                      </button>
                      {itemIndex < group.items.length - 1 && (
                        <div className={`border-b ${appSettings.darkMode ? 'border-gray-700' : 'border-gray-100'} ml-14`} />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Logout Button */}
        <Card className={`border-0 shadow-sm rounded-2xl ${appSettings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <CardContent className="p-0">
            <button
              onClick={handleLogout}
              className={`w-full p-4 flex items-center space-x-4 ${appSettings.darkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'} transition-colors text-left`}
            >
              <div className={`w-10 h-10 ${appSettings.darkMode ? 'bg-red-900/30' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                <LogOut className={`w-5 h-5 ${appSettings.darkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <span className={`flex-1 font-medium ${appSettings.darkMode ? 'text-red-400' : 'text-red-600'}`}>
                {t('settings.sign_out')}
              </span>
            </button>
          </CardContent>
        </Card>

        {/* App Version */}
        <div className="text-center mt-8">
          <p className={`${appSettings.darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Heal Link v1.0.0</p>
          <p className={`${appSettings.darkMode ? 'text-gray-500' : 'text-gray-400'} text-xs mt-1`}>© 2024 Heal Link. All rights reserved.</p>
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-md ${appSettings.darkMode ? 'bg-gray-800' : 'bg-white'} max-h-[80vh] overflow-y-auto`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${appSettings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {activeModal === 'profile' && 'Profile Settings'}
                  {activeModal === 'notifications' && 'Notification Settings'}
                  {activeModal === 'privacy' && 'Privacy & Security'}
                  {activeModal === 'health' && 'Health Data'}
                  {activeModal === 'emergency' && 'Emergency Contacts'}
                  {activeModal === 'language' && 'Language Settings'}
                  {activeModal === 'help' && 'Help & Support'}
                  {activeModal === 'add-contact' && 'Add Emergency Contact'}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveModal(null)} className="p-2">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Profile Settings Modal */}
              {activeModal === 'profile' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="displayName">Full Name</Label>
                    <Input
                      id="displayName"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      type="email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 9876543210"
                      type="tel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      type="date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={profileData.gender}
                      onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <textarea
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter your address"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <Button onClick={saveAllSettings} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              )}

              {/* Notifications Modal */}
              {activeModal === 'notifications' && (
                <div className="space-y-4">
                  <div className="space-y-4">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {key === 'appointments' && 'Get notified about upcoming appointments'}
                            {key === 'healthTips' && 'Receive daily health tips and advice'}
                            {key === 'emergencyAlerts' && 'Critical health and safety alerts'}
                            {key === 'medicationReminders' && 'Reminders to take medications'}
                            {key === 'pushNotifications' && 'Push notifications on your device'}
                            {key === 'emailNotifications' && 'Email notifications to your inbox'}
                            {key === 'smsNotifications' && 'SMS notifications to your phone'}
                          </p>
                        </div>
                        <div 
                          onClick={() => updateNotificationSetting(key as keyof NotificationSettings, !value)}
                          className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                            value ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-0.5'
                          } mt-0.5`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={saveAllSettings} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                    {loading ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                </div>
              )}

              {/* Privacy Modal */}
              {activeModal === 'privacy' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg mb-4">
                    <h4 className="font-medium text-blue-800 mb-2">Your Privacy Matters</h4>
                    <p className="text-sm text-blue-700">Control how your data is used and shared. All settings are secure and encrypted.</p>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(privacySettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {key === 'dataSharing' && 'Share anonymized data for research'}
                            {key === 'analyticsTracking' && 'Help improve app performance'}
                            {key === 'locationTracking' && 'Use location for nearby hospitals'}
                            {key === 'biometricAuth' && 'Use Face ID/fingerprint for login'}
                            {key === 'twoFactorAuth' && 'Extra security with 2FA'}
                          </p>
                        </div>
                        <div 
                          onClick={() => updatePrivacySetting(key as keyof PrivacySettings, !value)}
                          className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                            value ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-0.5'
                          } mt-0.5`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Data Protection</h4>
                    <p className="text-sm text-green-700">Your health data is encrypted and stored securely. We never sell your personal information.</p>
                  </div>
                  
                  <Button onClick={saveAllSettings} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                    {loading ? 'Saving...' : 'Save Privacy Settings'}
                  </Button>
                </div>
              )}

              {/* Health Data Modal */}
              {activeModal === 'health' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        value={healthData.height}
                        onChange={(e) => updateHealthData('height', e.target.value)}
                        placeholder="170"
                        type="number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        value={healthData.weight}
                        onChange={(e) => updateHealthData('weight', e.target.value)}
                        placeholder="70"
                        type="number"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bloodPressure">Blood Pressure</Label>
                      <Input
                        id="bloodPressure"
                        value={healthData.bloodPressure}
                        onChange={(e) => updateHealthData('bloodPressure', e.target.value)}
                        placeholder="120/80"
                      />
                    </div>
                    <div>
                      <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                      <Input
                        id="heartRate"
                        value={healthData.heartRate}
                        onChange={(e) => updateHealthData('heartRate', e.target.value)}
                        placeholder="72"
                        type="number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <select
                      id="bloodType"
                      value={healthData.bloodType}
                      onChange={(e) => updateHealthData('bloodType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Diabetic</p>
                      <p className="text-sm text-gray-600">Do you have diabetes?</p>
                    </div>
                    <div 
                      onClick={() => updateHealthData('diabetic', !healthData.diabetic)}
                      className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                        healthData.diabetic ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        healthData.diabetic ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    <textarea
                      id="allergies"
                      value={healthData.allergies}
                      onChange={(e) => updateHealthData('allergies', e.target.value)}
                      placeholder="List any allergies..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="medications">Current Medications</Label>
                    <textarea
                      id="medications"
                      value={healthData.medications}
                      onChange={(e) => updateHealthData('medications', e.target.value)}
                      placeholder="List current medications..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="medicalConditions">Medical Conditions</Label>
                    <textarea
                      id="medicalConditions"
                      value={healthData.medicalConditions}
                      onChange={(e) => updateHealthData('medicalConditions', e.target.value)}
                      placeholder="List any medical conditions..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="emergencyMedicalInfo">Emergency Medical Info</Label>
                    <textarea
                      id="emergencyMedicalInfo"
                      value={healthData.emergencyMedicalInfo}
                      onChange={(e) => updateHealthData('emergencyMedicalInfo', e.target.value)}
                      placeholder="Critical medical information for emergencies..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  
                  <Button onClick={saveAllSettings} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                    {loading ? 'Saving...' : 'Save Health Data'}
                  </Button>
                </div>
              )}

              {/* Emergency Contacts Modal */}
              {activeModal === 'emergency' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Emergency Contacts</h4>
                    <Button
                      size="sm"
                      onClick={() => setActiveModal('add-contact')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {emergencyContacts.length === 0 ? (
                    <div className="text-center py-8">
                      <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No emergency contacts added</p>
                      <p className="text-gray-400 text-xs mt-1">Add contacts for emergency situations</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {emergencyContacts.map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{contact.name}</p>
                              <p className="text-sm text-gray-600">{contact.phone}</p>
                              <p className="text-xs text-blue-600">{contact.relation}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEmergencyContact(contact.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Add Contact Modal */}
              {activeModal === 'add-contact' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactName">Name</Label>
                    <Input
                      id="contactName"
                      value={tempContact.name}
                      onChange={(e) => setTempContact({...tempContact, name: e.target.value})}
                      placeholder="Contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input
                      id="contactPhone"
                      value={tempContact.phone}
                      onChange={(e) => setTempContact({...tempContact, phone: e.target.value})}
                      placeholder="+91 9876543210"
                      type="tel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactRelation">Relation</Label>
                    <select
                      id="contactRelation"
                      value={tempContact.relation}
                      onChange={(e) => setTempContact({...tempContact, relation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Relation</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Friend">Friend</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setActiveModal('emergency')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addEmergencyContact}
                      disabled={!tempContact.name || !tempContact.phone || !tempContact.relation}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Add Contact
                    </Button>
                  </div>
                </div>
              )}

              {/* Language Modal */}
              {activeModal === 'language' && (
                <div className="space-y-4">
                  <p className={`${appSettings.darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>Choose your preferred language for the app interface.</p>
                  <div className="space-y-3">
                    {['english', 'telugu', 'hindi'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          changeLanguage(lang as 'english' | 'telugu' | 'hindi');
                          setLanguage(lang);
                          saveAllSettings();
                          setActiveModal(null);
                        }}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          language === lang
                            ? (appSettings.darkMode ? 'border-blue-400 bg-blue-900/20' : 'border-blue-500 bg-blue-50')
                            : (appSettings.darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300')
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${appSettings.darkMode ? 'text-white' : 'text-gray-800'} capitalize`}>
                              {getLanguageLabel(lang)}
                            </p>
                            <p className={`text-sm ${appSettings.darkMode ? 'text-gray-300' : 'text-gray-600'} capitalize`}>
                              {lang}
                            </p>
                          </div>
                          {language === lang && (
                            <Check className={`w-5 h-5 ${appSettings.darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <p className={`text-sm ${appSettings.darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                        Language changes will take effect after restarting the app.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Help Modal */}
              {activeModal === 'help' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Contact Support</h4>
                    <div className="space-y-2 text-sm text-blue-700">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>support@heallink.com</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>+91 1800-123-4567</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>24/7 Support Available</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-800">Frequently Asked Questions</h4>
                    <div className="space-y-2">
                      <details className="p-3 bg-gray-50 rounded-lg">
                        <summary className="font-medium cursor-pointer text-sm">How do I book an appointment?</summary>
                        <p className="text-sm text-gray-600 mt-2">Go to Home → Top Hospitals → Select Hospital → Book Appointment. Fill in your details and select a convenient time slot.</p>
                      </details>
                      <details className="p-3 bg-gray-50 rounded-lg">
                        <summary className="font-medium cursor-pointer text-sm">How do I upload medical records?</summary>
                        <p className="text-sm text-gray-600 mt-2">Go to Records tab → Click + button → Upload your documents. Our AI will automatically categorize them for you.</p>
                      </details>
                      <details className="p-3 bg-gray-50 rounded-lg">
                        <summary className="font-medium cursor-pointer text-sm">Is my health data secure?</summary>
                        <p className="text-sm text-gray-600 mt-2">Yes, all your health data is encrypted and stored securely. We follow strict privacy guidelines and never share your personal information.</p>
                      </details>
                      <details className="p-3 bg-gray-50 rounded-lg">
                        <summary className="font-medium cursor-pointer text-sm">How do I change my language?</summary>
                        <p className="text-sm text-gray-600 mt-2">Go to Settings → Language → Select your preferred language (English, Telugu, or Hindi).</p>
                      </details>
                      <details className="p-3 bg-gray-50 rounded-lg">
                        <summary className="font-medium cursor-pointer text-sm">How do I add emergency contacts?</summary>
                        <p className="text-sm text-gray-600 mt-2">Go to Settings → Emergency Contacts → Add Contact. These contacts will be notified in case of medical emergencies.</p>
                      </details>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Quick Tips</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Keep your health data updated for better care</li>
                      <li>• Enable notifications for appointment reminders</li>
                      <li>• Add emergency contacts for safety</li>
                      <li>• Use Face ID for secure and quick access</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};