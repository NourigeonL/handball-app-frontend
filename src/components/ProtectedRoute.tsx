'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import GoogleLogin from './GoogleLogin';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show login state if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">H</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestionnaire de Clubs</h1>
            <p className="text-gray-600">Veuillez vous connecter pour accéder à vos clubs</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-700 mb-6">
              Cette application nécessite une authentification pour gérer les clubs de handball.
            </p>
            
            {/* Login Button - Using the same component as navigation */}
            <div className="flex justify-center">
              <GoogleLogin />
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Connectez-vous avec votre compte Google pour commencer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
