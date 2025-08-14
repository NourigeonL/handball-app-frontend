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
  const [buttonId] = useState(`google-signin-button-${Math.random().toString(36).substr(2, 9)}`);

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

    // Check if we have a valid client ID
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'your-google-client-id') {
      console.error('Google Client ID not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env file');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the button with unique ID
      const buttonElement = document.getElementById(buttonId);
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'medium',
          text: 'signin',
          shape: 'rectangular',
          width: 120,
        });
      }
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
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
      alert('Échec de la connexion. Veuillez réessayer.');
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
        <p className="text-green-600 font-medium">Vous êtes connecté !</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div id={buttonId}></div>
    </div>
  );
};

export default GoogleLogin;
