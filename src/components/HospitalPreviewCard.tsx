import React from 'react';
import { Card, CardContent } from './ui/card';
import { Star, MapPin } from 'lucide-react';

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

interface HospitalPreviewCardProps {
  hospital: RealHospital;
  onClick?: () => void;
}

export const HospitalPreviewCard: React.FC<HospitalPreviewCardProps> = ({ 
  hospital, 
  onClick 
}) => {
  return (
    <Card 
      className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer rounded-2xl"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Hospital Image */}
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
            <img 
              src={hospital.image}
              alt={hospital.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop";
              }}
            />
          </div>

          {/* Hospital Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 text-base mb-1 truncate font-['Inter']">
              {hospital.name}
            </h4>
            <p className="text-blue-600 text-sm mb-2">
              {hospital.type} Hospital
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-sm text-gray-800">
                  {hospital.rating}
                </span>
                <span className="text-gray-500 text-sm">
                  ({hospital.reviews})
                </span>
              </div>
              
                <div className="flex items-center space-x-1 text-gray-500 text-sm">
                  <MapPin className="w-3 h-3" />
                  <span>{hospital.distance}</span>
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};