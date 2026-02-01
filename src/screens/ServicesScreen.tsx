import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  ArrowLeft, 
  Calendar, 
  Stethoscope, 
  Heart, 
  Brain,
  Eye,
  Pill,
  Activity,
  Phone,
  MapPin
} from 'lucide-react';

interface ServicesScreenProps {
  onBack: () => void;
  onServiceSelect: (service: string) => void;
}

export const ServicesScreen: React.FC<ServicesScreenProps> = ({
  onBack,
  onServiceSelect
}) => {
  const services = [
    {
      id: 'appointment',
      name: 'Book Appointment',
      description: 'Schedule appointments with doctors',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'general',
      name: 'General Medicine',
      description: 'General health checkups and consultations',
      icon: Stethoscope,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'cardiology',
      name: 'Cardiology',
      description: 'Heart and cardiovascular care',
      icon: Heart,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'neurology',
      name: 'Neurology',
      description: 'Brain and nervous system care',
      icon: Brain,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'ophthalmology',
      name: 'Eye Care',
      description: 'Eye examinations and treatments',
      icon: Eye,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 'pharmacy',
      name: 'Pharmacy',
      description: 'Medicine delivery and prescriptions',
      icon: Pill,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 'wellness',
      name: 'Wellness Programs',
      description: 'Health monitoring and fitness plans',
      icon: Activity,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'emergency',
      name: 'Emergency Services',
      description: '24/7 emergency medical assistance',
      icon: Phone,
      color: 'bg-red-100 text-red-600'
    }
  ];

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
          Our Services
        </h1>
      </div>

      {/* Services Grid */}
      <div className="p-4 pb-24">
        <div className="grid grid-cols-1 gap-4">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card 
                key={service.id}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer rounded-2xl"
                onClick={() => onServiceSelect(service.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${service.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-base mb-1 font-['Inter']">
                        {service.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {service.description}
                      </p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Emergency Contact */}
        <Card className="mt-6 border-0 shadow-sm rounded-2xl bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-red-800 text-sm">Emergency Hotline</h4>
                <p className="text-red-600 text-sm">Call 911 for immediate assistance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};