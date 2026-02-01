import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideData {
  id: number;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaAction: () => void;
}

export const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: SlideData[] = [
    {
      id: 1,
      title: "Free Vaccine Camp",
      description: "Get your COVID-19 booster shot at our community health center",
      image: "https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
      ctaText: "Book Now",
      ctaAction: () => console.log('Book vaccine')
    },
    {
      id: 2,
      title: "New Heart Treatment",
      description: "Advanced cardiac care now available with latest technology",
      image: "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
      ctaText: "Learn More",
      ctaAction: () => console.log('Learn about treatment')
    },
    {
      id: 3,
      title: "Mental Health Support",
      description: "24/7 counseling services available for your wellbeing",
      image: "https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
      ctaText: "Get Support",
      ctaAction: () => console.log('Mental health support')
    }
  ];

  // Auto-scroll functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative mb-6">
      <Card className="border-0 shadow-lg overflow-hidden rounded-2xl">
        <CardContent className="p-0 relative">
          {/* Slide Content */}
          <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/90 to-blue-600/90" />
            
            <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
              <div>
                <h3 className="text-xl font-bold mb-2 font-['Inter']">
                  {slides[currentSlide].title}
                </h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  {slides[currentSlide].description}
                </p>
              </div>
              
              <button
                onClick={slides[currentSlide].ctaAction}
                className="self-start bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                {slides[currentSlide].ctaText}
              </button>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};