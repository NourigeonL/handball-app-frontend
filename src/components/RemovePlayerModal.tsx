'use client';

import React from 'react';

interface RemovePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  playerName: string;
  collectiveName: string;
  isLoading?: boolean;
}

const RemovePlayerModal: React.FC<RemovePlayerModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  playerName, 
  collectiveName,
  isLoading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Retirer un Joueur</h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">Confirmation requise</h3>
              <p className="text-red-800 text-sm">
                Êtes-vous sûr de vouloir retirer <strong>{playerName}</strong> du collectif <strong>{collectiveName}</strong> ?
              </p>
              <p className="text-red-700 text-sm mt-2">
                Cette action ne peut pas être annulée.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Suppression...
                </div>
              ) : (
                'Retirer le Joueur'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemovePlayerModal;
