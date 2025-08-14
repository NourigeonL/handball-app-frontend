'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
  const { logout, logoutFromClub, selectedClub } = useAuth();

  if (!isOpen) return null;

  const handleLogoutFromClub = () => {
    logoutFromClub();
    onClose();
  };

  const handleCompleteLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Options de Déconnexion</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Travaille actuellement avec :</h3>
              <p className="text-blue-800">{selectedClub?.name || 'Aucun club sélectionné'}</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleLogoutFromClub}
                className="w-full p-4 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Se Déconnecter du Club</h3>
                    <p className="text-sm text-gray-600">Rester connecté mais passer à aucun club</p>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              <button
                onClick={handleCompleteLogout}
                className="w-full p-4 border border-red-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-red-900">Se Déconnecter Complètement</h3>
                    <p className="text-sm text-red-600">Se déconnecter complètement de l'application</p>
                  </div>
                  <div className="text-red-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
