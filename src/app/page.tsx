'use client';

import ClubsList from '@/components/ClubsList';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to Handball App
          </h1>
          <p className="text-xl text-gray-600">
            Connect with your handball community
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors duration-200"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/clubs"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors duration-200"
            >
              Browse Clubs
            </Link>
          </div>
        </div>
        
        {/* Public Clubs List */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Featured Clubs
          </h2>
          <ClubsList />
        </div>
      </div>
    </div>
  );
}
