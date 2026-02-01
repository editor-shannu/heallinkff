import React from "react";
import { AppProvider } from "./contexts/AppContext";
import { Login } from "./screens/Login";
import { Dashboard } from "./screens/Dashboard";
import { useFirebaseAuth } from "./hooks/useFirebaseAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";

export const App = (): JSX.Element => {
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

  return (
    <AppProvider>
      <ErrorBoundary>
        <ProtectedRoute fallback={<Login />}>
          <Dashboard />
        </ProtectedRoute>
      </ErrorBoundary>
    </AppProvider>
  );
};