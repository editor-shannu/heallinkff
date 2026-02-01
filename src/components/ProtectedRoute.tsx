import React from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { user, loading } = useFirebaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#3bacd6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-['Oswald']">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || null;
  }

  return <>{children}</>;
};