import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useRealHospitals } from '../hooks/useRealHospitals';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Star, 
  MapPin,
  Heart,
  Stethoscope,
  Eye,
  Brain,
  Zap
} from 'lucide-react';

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

interface HospitalListScreenProps {
  onBack: () => void;
  onHospitalSelect: (hospital: RealHospital) => void;
}

export const HospitalListScreen: React.FC<HospitalListScreenProps> = ({
  onBack,
  onHospitalSelect
}) => {
  const { hospitals, loading } = useRealHospitals();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'Private' | 'Government'>('all');

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'cardiology':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'dental':
        return <Stethoscope className="w-4 h-4 text-blue-500" />;
      case 'neurology':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'emergency':
        return <Zap className="w-4 h-4 text-orange-500" />;
      default:
        return <Eye className="w-4 h-4 text-green-500" />;
    }
  };

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hospital.services.some(service => 
                           service.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    const matchesFilter = selectedFilter === 'all' || hospital.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-4 py-4 flex items-center space-x-4 shadow-sm">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-800 font-['Inter']">
            Hospital Directory
          </h1>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
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
          Hospital Directory
        </h1>
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-white border-b border-gray-100">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search hospitals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-gray-200"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'Private', label: 'Private' },
            { key: 'Government', label: 'Government' }
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={selectedFilter === filter.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.key as any)}
              className={`rounded-full ${
                selectedFilter === filter.key 
                  ? 'bg-blue-600 text-white' 
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Hospital List */}
      <div className="p-4 space-y-4 pb-24">
        {filteredHospitals.map((hospital) => (
          <Card 
            key={hospital.id}
            className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer rounded-2xl"
            onClick={() => onHospitalSelect(hospital)}
          >
            <CardContent className="p-4">
              <div className="flex space-x-4">
                {/* Hospital Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <img 
                    src={hospital.image}
                    alt={hospital.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Hospital Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-base mb-1 font-['Inter']">
                        {hospital.name}
                      </h3>
                      <p className="text-blue-600 text-sm">
                        {hospital.type} Hospital
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hospital.type === 'Private' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {hospital.type}
                    </span>
                  </div>

                  {/* Rating and Distance */}
                  <div className="flex items-center justify-between mb-3">
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

                  {/* Services */}
                  <div className="flex items-center space-x-2">
                    {hospital.services.slice(0, 4).map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full"
                      >
                        {getServiceIcon(service.toLowerCase())}
                      </div>
                    ))}
                    {hospital.services.length > 4 && (
                      <span className="text-xs text-gray-500">
                        +{hospital.services.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};