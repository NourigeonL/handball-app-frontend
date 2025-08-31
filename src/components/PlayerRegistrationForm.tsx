'use client';

import { useState } from 'react';
import { authenticatedPost } from '@/utils/api';
import { PlayerRegistrationData } from '@/types/clubs';

interface PlayerRegistrationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PlayerRegistrationForm({ onSuccess, onCancel }: PlayerRegistrationFormProps) {
  const [formData, setFormData] = useState<PlayerRegistrationData>({
    first_name: '',
    last_name: '',
    gender: 'M',
    date_of_birth: '',
    license_number: '',
    license_type: 'A'
  });
  
  const [errors, setErrors] = useState<Partial<PlayerRegistrationData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<PlayerRegistrationData> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Le prénom est requis';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Le nom de famille est requis';
    }
    
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'La date de naissance est requise';
    }
    
    if (!formData.license_number.trim()) {
      newErrors.license_number = 'Le numéro de licence est requis';
    }
    
    if (!formData.license_type) {
      newErrors.license_type = 'Le type de licence est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await authenticatedPost(
        `${process.env.NEXT_PUBLIC_API_URL}/players/register`,
        formData
      );
      
      onSuccess();
    } catch (error) {
      console.error('Error registering player:', error);
      alert('Erreur lors de l\'inscription du joueur. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof PlayerRegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Inscrire un nouveau joueur</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label htmlFor="first_name" className="block text-sm font-semibold text-gray-800 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 placeholder-gray-500 ${
                      errors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Prénom du joueur"
                  />
                  {errors.first_name && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.first_name}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="last_name" className="block text-sm font-semibold text-gray-800 mb-2">
                    Nom de famille *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 placeholder-gray-500 ${
                      errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nom de famille du joueur"
                  />
                  {errors.last_name && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.last_name}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-gray-800 mb-2">
                    Genre *
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value as 'M' | 'F')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 bg-white"
                  >
                    <option value="M">Homme</option>
                    <option value="F">Femme</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-semibold text-gray-800 mb-2">
                    Date de naissance *
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 ${
                      errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.date_of_birth && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.date_of_birth}</p>
                  )}
                </div>
              </div>
            </div>

            {/* License Information Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations de licence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* License Number */}
                <div>
                  <label htmlFor="license_number" className="block text-sm font-semibold text-gray-800 mb-2">
                    Numéro de licence *
                  </label>
                  <input
                    type="text"
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => handleInputChange('license_number', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 placeholder-gray-500 ${
                      errors.license_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Numéro de licence"
                  />
                  {errors.license_number && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.license_number}</p>
                  )}
                </div>

                {/* License Type */}
                <div>
                  <label htmlFor="license_type" className="block text-sm font-semibold text-gray-800 mb-2">
                    Type de licence *
                  </label>
                  <select
                    id="license_type"
                    value={formData.license_type}
                    onChange={(e) => handleInputChange('license_type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 bg-white"
                  >
                    <option value="A">A - Première demande et renouvellement</option>
                    <option value="B">B - Mutation en période officielle</option>
                    <option value="C">C - Transfert international et mutation janvier-mai</option>
                    <option value="D">D - Mutation hors période officielle</option>
                  </select>
                  <div className="mt-2 text-xs text-gray-600">
                    <details className="group">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                        Voir les détails des types de licence
                      </summary>
                      <div className="mt-2 space-y-2 text-gray-700">
                        <div>
                          <strong className="text-gray-800">Licence A :</strong> Première demande de licence, renouvellement de licence A dans le même club, mutation entre le 1er juin et le 31 décembre avec retour au club quitté, mutation d'un joueur avec statut professionnel, renouvellement d'une licence B ou D
                        </div>
                        <div>
                          <strong className="text-gray-800">Licence B :</strong> Mutation en période officielle (entre le 1er juin et le 31 août), mutation hors période officielle (entre le 1er septembre et le 31 décembre) sous réserve de justification, renouvellement d'une licence C
                        </div>
                        <div>
                          <strong className="text-gray-800">Licence C :</strong> Transfert international et mutation entre le 1er janvier et le 31 mai (hors ProD2, LFH et LNH). Ne permet pas d'évoluer en championnat de France
                        </div>
                        <div>
                          <strong className="text-gray-800">Licence D :</strong> Mutation entre le 1er septembre et le 31 décembre avec seulement l'accord du club quitté ou sans justificatif pour les licenciés de 17 ans et plus, ou sans justificatif pour les licenciés de moins de 17 ans. Ne permet pas d'évoluer en championnat de France
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-base font-medium bg-white"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Inscription...
                  </div>
                ) : (
                  'Inscrire le joueur'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
