import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin,
  User,
  Phone,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';

interface AppointmentListScreenProps {
  onBack: () => void;
}

export const AppointmentListScreen: React.FC<AppointmentListScreenProps> = ({
  onBack
}) => {
  const { appointments, loading, cancelAppointment, formatAppointmentDate } = useAppointments();
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      await cancelAppointment(appointmentId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-4 py-4 flex items-center space-x-4 shadow-sm">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-800 font-['Inter']">
            My Appointments
          </h1>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center space-x-4 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-800 font-['Inter']">
          My Appointments
        </h1>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'scheduled', label: 'Scheduled' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map((filterOption) => (
            <Button
              key={filterOption.key}
              variant={filter === filterOption.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption.key as any)}
              className={`rounded-full ${
                filter === filterOption.key 
                  ? 'bg-blue-600 text-white' 
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              {filterOption.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="p-4 space-y-4 pb-24">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No appointments found
            </h3>
            <p className="text-gray-500 text-sm">
              {filter === 'all' 
                ? 'You haven\'t booked any appointments yet.' 
                : `No ${filter} appointments found.`
              }
            </p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card 
              key={appointment.id}
              className="border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl"
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Doctor Avatar */}
                  <div className="flex-shrink-0">
                    <img
                      src={appointment.doctor_avatar || "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face"}
                      alt={appointment.doctor_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                    />
                  </div>

                  {/* Appointment Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-base mb-1">
                          {appointment.doctor_name}
                        </h4>
                        <p className="text-sm text-blue-600 mb-1">
                          {appointment.doctor_specialty}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(appointment.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{appointment.hospital_name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>{formatAppointmentDate(appointment.appointment_date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="w-3 h-3" />
                        <span>{appointment.patient_name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{appointment.patient_phone}</span>
                      </div>
                    </div>

                    {appointment.symptoms && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <p className="text-sm text-gray-700">
                          <strong>Symptoms:</strong> {appointment.symptoms}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {appointment.status === 'scheduled' && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          Reschedule
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};