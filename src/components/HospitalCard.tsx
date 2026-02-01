import React from "react";
import { Card, CardContent } from "./ui/card";
import { Star } from "lucide-react";

interface HospitalCardProps {
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  image: string;
  onClick?: () => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  name,
  specialty,
  rating,
  reviews,
  image,
  onClick
}) => {
  return (
    <Card 
      className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
            <img 
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[#1d2366] text-lg mb-1 truncate">
              {name}
            </h4>
            <p className="text-[#3bacd6] text-sm mb-2 capitalize">{specialty}</p>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-sm">{rating}</span>
              </div>
              <span className="text-[#3bacd6] text-sm">
                ({reviews} Reviews)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};