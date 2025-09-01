'use client';

import { useState } from 'react';
import { authenticatedClubPost } from '@/utils/api';

interface TrainingSessionFormProps {
  onSessionCreated: () => void;
}

interface TrainingSessionData {
  date: string;
  start_time: string;
  end_time: string;
}

interface TrainingSessionRequest {
  start_time: string;
  end_time: string;
}

export default function TrainingSessionForm({ onSessionCreated }: TrainingSessionFormProps) {
  // Get current date in YYYY-MM-DD format for default value
  const today = new Date().toISOString().split('T')[0];
  
  // Get current hour and next hour for default times
  const now = new Date();
  const currentHour = now.getHours();
  const nextHour = currentHour + 1;
  
  // Format hours as HH:00
  const currentTime = `${currentHour.toString().padStart(2, '0')}:00`;
  const nextTime = `${nextHour.toString().padStart(2, '0')}:00`;
  
  const [formData, setFormData] = useState<TrainingSessionData>({
    date: today,
    start_time: currentTime,
    end_time: nextTime
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert date and time inputs to ISO strings
      const startDateTime = new Date(`${formData.date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.date}T${formData.end_time}`);

      // Validate that end time is after start time
      if (endDateTime <= startDateTime) {
        setError('L\'heure de fin doit être après l\'heure de début');
        setIsSubmitting(false);
        return;
      }

             const sessionData: TrainingSessionRequest = {
         start_time: startDateTime.toISOString(),
         end_time: endDateTime.toISOString()
       };

       console.log('Creating training session with data:', sessionData);

       await authenticatedClubPost('/training-sessions/create', sessionData);

             // Reset form and close
       setFormData({
         date: today,
         start_time: currentTime,
         end_time: nextTime
       });
      setIsFormOpen(false);
      onSessionCreated();
    } catch (err) {
      console.error('Error creating training session:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la session d\'entraînement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      date: today,
      start_time: currentTime,
      end_time: nextTime
    });
    setError(null);
    setIsFormOpen(false);
  };

  if (!isFormOpen) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouvelle Session d'Entraînement
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Créer une Nouvelle Session d'Entraînement
        </h3>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Input */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
                         <input
               type="date"
               id="date"
               name="date"
               value={formData.date}
               onChange={handleInputChange}
               min={today}
               required
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
             />
          </div>

          {/* Start Time Input */}
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
              Heure de Début *
            </label>
                         <input
               type="time"
               id="start_time"
               name="start_time"
               value={formData.start_time}
               onChange={handleInputChange}
               required
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
             />
          </div>

          {/* End Time Input */}
          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
              Heure de Fin *
            </label>
                         <input
               type="time"
               id="end_time"
               name="end_time"
               value={formData.end_time}
               onChange={handleInputChange}
               required
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
             />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création...
              </div>
            ) : (
              'Créer la Session'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
