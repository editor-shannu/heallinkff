import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAppointments } from '../hooks/useAppointments';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  avatar: string;
  available: boolean;
}

interface Hospital {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  image: string;
  distance: string;
  services: string[];
  type: 'private' | 'government';
}

interface AppointmentDetailsScreenProps {
  doctor: Doctor;
  hospital?: Hospital;
  onBack: () => void;
  onConfirm: () => void;
}

export const AppointmentDetailsScreen: React.FC<AppointmentDetailsScreenProps> = ({
  doctor,
  hospital,
  onBack,
  onConfirm
}) => {
  const { user, logout } = useFirebaseAuth();
  const { createAppointment } = useAppointments();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [patientName, setPatientName] = useState(user?.displayName || user?.email?.split('@')[0] || '');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [symptoms, setSymptoms] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableDates = [
    { date: new Date().toISOString().split('T')[0], label: 'Today' },
    { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], label: 'Tomorrow' },
    { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], label: 'Mon, Sep 22' },
    { date: new Date(Date.now() + 259200000).toISOString().split('T')[0], label: 'Tue, Sep 23' },
    { date: new Date(Date.now() + 345600000).toISOString().split('T')[0], label: 'Wed, Sep 24' }
  ];

  function getDateLabel(daysFromNow: number): string {
    const date = new Date(Date.now() + (daysFromNow * 86400000));
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  const availableTimes = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const handleConfirm = async () => {
    setError(null);
    if (!selectedDate || !selectedTime || !patientName || !patientPhone) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (patientEmail && patientEmail.trim() && !emailRegex.test(patientEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(patientPhone.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const appointmentData = {
        doctor_name: doctor?.name || 'General Consultation',
        doctor_specialty: doctor.specialty,
        doctor_avatar: doctor.avatar,
        hospital_name: hospital?.name || 'City General Hospital',
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        patient_name: patientName,
        patient_phone: patientPhone,
        patient_email: patientEmail,
        symptoms: symptoms
      };

      console.log('Submitting appointment:', appointmentData);
      const result = await createAppointment(appointmentData);
      
      if (result) {
        console.log('Appointment created successfully:', result);
        setShowSuccess(true);
        setTimeout(() => {
          onConfirm();
        }, 2000);
      } else {
        throw new Error('Failed to create appointment');
      }
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      const errorMessage = error?.message || 'Failed to book appointment. Please try again.';
      
      // Handle session-related errors by logging out and redirecting
      if (errorMessage.includes('No active session found') || 
          errorMessage.includes('Please log in again') ||
          errorMessage.includes('session')) {
        console.log('Session error detected, logging out user');
        await logout();
        // ProtectedRoute will automatically redirect to login
        return;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 font-['Inter']">
              Appointment Confirmed!
            </h2>
            <p className="text-gray-600 mb-4">
              Your appointment with {doctor.name} has been successfully booked.
            </p>
            <div className="bg-blue-50 p-4 rounded-xl mb-6">
              <p className="text-sm text-blue-800">
                <strong>Date:</strong> {selectedDate}<br/>
                <strong>Time:</strong> {selectedTime}<br/>
                <strong>Doctor:</strong> {doctor.name}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              You will receive a confirmation email shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center space-x-4 shadow-sm">
        <Button
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-800 font-['Inter']">
          Book Appointment
        </h1>
      </div>

      <div className="p-4 pb-24 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Date Selection */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800 font-['Inter']">
                Select Date
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {availableDates.map((dateOption) => (
                <Button
                  key={dateOption.date}
                  variant={selectedDate === dateOption.date ? "default" : "outline"}
                  className={`p-3 h-auto ${
                    selectedDate === dateOption.date
                      ? 'bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-700'
                  } rounded-xl`}
                  onClick={() => setSelectedDate(dateOption.date)}
                >
                  {dateOption.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Selection */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800 font-['Inter']">
                Select Time
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  className={`${
                    selectedTime === time
                      ? 'bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-700'
                  } rounded-lg`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Patient Information */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800 font-['Inter']">
                Patient Information
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name"
                  className="mt-1 rounded-lg border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="mt-1 rounded-lg border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="mt-1 rounded-lg border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="symptoms" className="text-sm font-medium text-gray-700">
                  Symptoms / Reason for Visit
                </Label>
                <textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms or reason for visit"
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirm Button */}
        <Button
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedTime || !patientName || !patientPhone || isSubmitting}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Booking Appointment...</span>
            </div>
          ) : (
            'Confirm Appointment'
          )}
        </Button>
      </div>
    </div>
  );
};