import React, { useEffect } from 'react';
import { Heart } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="mb-8 animate-pulse">
          <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Heart className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold text-white mb-2 font-['Inter']">
          Heal Link
        </h1>
        <p className="text-blue-100 text-lg">
          Connecting you to better healthcare
        </p>

        {/* Loading Animation */}
        <div className="mt-8">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};