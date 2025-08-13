'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GoogleLogin: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleLoaded(true);
      initializeGoogleSignIn();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isGoogleLoaded) {
      initializeGoogleSignIn();
    }
  }, [isGoogleLoaded]);

  const initializeGoogleSignIn = () => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id',
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Render the button
    const buttonElement = document.getElementById('google-signin-button');
    if (buttonElement) {
      window.google.accounts.id.renderButton(buttonElement, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: 300,
      });
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      // Extract the ID token from the response
      const { credential } = response;
      
      // Send the token to your backend
      await login(credential);
      
      console.log('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="text-center p-4">
        <p className="text-green-600 font-medium">You are logged in!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Welcome to Handball App</h2>
      <p className="text-gray-600 text-center">
        Sign in with your Google account to continue
      </p>
      
      <div id="google-signin-button" className="mt-4"></div>
      
      <p className="text-xs text-gray-500 text-center mt-4">
        By signing in, you agree to our terms of service and privacy policy
      </p>
    </div>
  );
};

export default GoogleLogin;
