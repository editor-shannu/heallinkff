import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Clock,
  Heart,
  Stethoscope,
  Eye,
  Brain,
  Zap,
  Calendar
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

interface HospitalDetailsScreenProps {
  hospital: RealHospital;
  onBack: () => void;
  onBookAppointment: (doctor: Doctor) => void;
}

export const HospitalDetailsScreen: React.FC<HospitalDetailsScreenProps> = ({
  hospital,
  onBack,
  onBookAppointment
}) => {
  const doctors: Doctor[] = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      experience: "15 years",
      rating: 4.9,
      avatar: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
      available: true
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Neurologist",
      experience: "12 years",
      rating: 4.8,
      avatar: "https://images.pexels.com/photos/6129967/pexels-photo-6129967.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
      available: true
    },
    {
      id: 3,
      name: "Dr. Emily Davis",
      specialty: "Dentist",
      experience: "8 years",
      rating: 4.7,
      avatar: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
      available: false
    }
  ];

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'cardiology':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'dental':
        return <Stethoscope className="w-5 h-5 text-blue-500" />;
      case 'neurology':
        return <Brain className="w-5 h-5 text-purple-500" />;
      case 'emergency':
        return <Zap className="w-5 h-5 text-orange-500" />;
      default:
        return <Eye className="w-5 h-5 text-green-500" />;
    }
  };

  const getServiceName = (service: string) => {
    return service.charAt(0).toUpperCase() + service.slice(1);
  };

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
          Hospital Details
        </h1>
      </div>

      <div className="pb-24">
        {/* Hospital Hero */}
        <div className="bg-white">
          <div className="h-48 overflow-hidden">
            <img
              src={hospital.image}
              alt={hospital.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1 font-['Inter']">
                  {hospital.name}
                </h2>
                <p className="text-blue-600 text-base">
                  {hospital.type} Hospital
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                hospital.type === 'Private' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {hospital.type}
              </span>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-800">
                  {hospital.rating}
                </span>
                <span className="text-gray-500">
                  ({hospital.reviews} reviews)
                </span>
              </div>
            </div>

        {/* Book Appointment CTA */}
        <div className="p-4 mt-4">
          <Button
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
            onClick={() => onBookAppointment({
              id: 1,
              name: "General Consultation",
              specialty: "General Medicine",
              experience: "Available",
              rating: 4.5,
              avatar: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
              available: true
            })}
          >
            Book Appointment
          </Button>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};