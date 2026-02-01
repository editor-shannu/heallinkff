import { useState, useEffect } from 'react';

export interface Hospital {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  image: string;
  address?: string;
  phone?: string;
  distance?: string;
}

export const useHospitals = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchHospitals = async () => {
      setLoading(true);
      
      // Mock data - in real app, this would be an API call
      const mockHospitals: Hospital[] = [
        {
          id: 1,
          name: "City General Hospital",
          specialty: "Multi-specialty",
          rating: 4.9,
          reviews: 280,
          image: "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          address: "123 Main St, City Center",
          phone: "+1 (555) 123-4567",
          distance: "2.5 km"
        },
        {
          id: 2,
          name: "Heart Care Center",
          specialty: "Cardiology",
          rating: 4.8,
          reviews: 195,
          image: "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          address: "456 Oak Ave, Downtown",
          phone: "+1 (555) 987-6543",
          distance: "1.8 km"
        },
        {
          id: 3,
          name: "Dental Excellence Clinic",
          specialty: "Dentistry",
          rating: 4.9,
          reviews: 342,
          image: "https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          address: "789 Pine St, Medical District",
          phone: "+1 (555) 456-7890",
          distance: "3.2 km"
        },
        {
          id: 4,
          name: "Children's Hospital",
          specialty: "Pediatrics",
          rating: 4.7,
          reviews: 156,
          image: "https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          address: "321 Elm St, Family District",
          phone: "+1 (555) 234-5678",
          distance: "4.1 km"
        },
        {
          id: 5,
          name: "Wellness Medical Center",
          specialty: "General Medicine",
          rating: 4.6,
          reviews: 198,
          image: "https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          address: "555 Health Ave, Wellness District",
          phone: "+1 (555) 345-6789",
          distance: "3.8 km"
        },
        {
          id: 6,
          name: "Emergency Care Plus",
          specialty: "Emergency Medicine",
          rating: 4.8,
          reviews: 267,
          image: "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          address: "777 Emergency Blvd, Central",
          phone: "+1 (555) 911-0000",
          distance: "1.2 km"
        }
      ];

      // Simulate network delay
      setTimeout(() => {
        setHospitals(mockHospitals);
        setLoading(false);
      }, 1000);
    };

    fetchHospitals();
  }, []);

  const getHospitalById = (id: number) => {
    return hospitals.find(hospital => hospital.id === id);
  };

  const getHospitalsBySpecialty = (specialty: string) => {
    return hospitals.filter(hospital => 
      hospital.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  };

  return {
    hospitals,
    loading,
    getHospitalById,
    getHospitalsBySpecialty
  };
};