import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent } from './ui/card';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';

interface UpcomingAppointmentCardProps {
  onTap?: () => void;
}

export const UpcomingAppointmentCard: React.FC<UpcomingAppointmentCardProps> = ({ onTap }) => {
  const { t, settings } = useApp();
  const { getNextAppointment, formatAppointmentDate, loading, appointments } = useAppointments();
  
  const nextAppointment = getNextAppointment();

  console.log('UpcomingAppointmentCard - appointments:', appointments);
  console.log('UpcomingAppointmentCard - nextAppointment:', nextAppointment);
  console.log('UpcomingAppointmentCard - loading:', loading);

  if (loading) {
    return (
      <Card className={`border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer rounded-2xl ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'} font-['Inter']`}>
              {t('dashboard.upcoming_appointment')}
            </h3>
            <div className="flex items-center space-x-1">
              <Calendar className={`w-4 h-4 ${settings.darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <ChevronRight className={`w-4 h-4 ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>
          <div className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full`}></div>
              <div className="flex-1">
                <div className={`h-4 ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2`}></div>
                <div className={`h-3 ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2 w-3/4`}></div>
                <div className={`h-3 ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2`}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nextAppointment) {
    return (
      <Card className={`border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer rounded-2xl ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'} font-['Inter']`}>
              {t('dashboard.upcoming_appointment')}
            </h3>
            <div className="flex items-center space-x-1">
              <Calendar className={`w-4 h-4 ${settings.darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <ChevronRight className={`w-4 h-4 ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>
          <div className="text-center py-8">
            <Calendar className={`w-12 h-12 ${settings.darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-3`} />
            <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{t('dashboard.no_appointments')}</p>
            <p className={`${settings.darkMode ? 'text-gray-500' : 'text-gray-400'} text-xs mt-1`}>{t('dashboard.book_appointment')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer rounded-2xl ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}
      onClick={onTap}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'} font-['Inter']`}>
            {t('dashboard.upcoming_appointment')}
          </h3>
          <div className="flex items-center space-x-1">
            <Calendar className={`w-4 h-4 ${settings.darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <ChevronRight className={`w-4 h-4 ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Doctor Avatar */}
          <div className="flex-shrink-0">
            <img
              src={nextAppointment.doctor_avatar || "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face"}
              alt={nextAppointment.doctor_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face";
              }}
            />
          </div>

          {/* Appointment Details */}
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'} text-base mb-1`}>
              {nextAppointment.doctor_name}
            </h4>
            <p className={`text-sm ${settings.darkMode ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
              {nextAppointment.doctor_specialty}
            </p>
            
            <div className="space-y-1">
              <div className={`flex items-center space-x-2 text-sm ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <MapPin className="w-3 h-3" />
                <span>{nextAppointment.hospital_name}</span>
              </div>
              <div className={`flex items-center space-x-2 text-sm ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <Clock className="w-3 h-3" />
                <span>{formatAppointmentDate(nextAppointment.appointment_date)} at {nextAppointment.appointment_time}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-4">
          <button className={`flex-1 ${settings.darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors`}>
            View Details
          </button>
          <button className={`flex-1 border ${settings.darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} py-2 px-4 rounded-lg text-sm font-medium transition-colors`}>
            Reschedule
          </button>
        </div>
      </CardContent>
    </Card>
  );
};