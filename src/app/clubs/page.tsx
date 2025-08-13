'use client';

import ClubsList from '@/components/ClubsList';

export default function ClubsPage() {

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Handball Clubs Directory</h1>
          <p className="text-gray-600">Discover and explore handball clubs in your area</p>
        </div>
        
        <ClubsList />
      </div>
    </div>
  );
}
