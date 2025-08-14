import { GoogleUserProfile } from '@/types/auth';

/**
 * Decode a Google ID token (JWT) to extract user profile information
 * Note: This only decodes the token, it doesn't verify the signature
 * For production, you should verify the token on your backend
 * 
 * @param idToken - The Google ID token from the sign-in response
 * @returns Decoded user profile information
 */
export function decodeGoogleIdToken(idToken: string): GoogleUserProfile | null {
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64 and parse JSON
    const decodedPayload = JSON.parse(atob(paddedPayload));
    
    // Extract and validate required fields
    if (!decodedPayload.sub || !decodedPayload.email) {
      console.error('Missing required fields in Google ID token');
      return null;
    }

    return {
      sub: decodedPayload.sub,
      name: decodedPayload.name || '',
      given_name: decodedPayload.given_name || '',
      family_name: decodedPayload.family_name || '',
      picture: decodedPayload.picture || '',
      email: decodedPayload.email,
      email_verified: decodedPayload.email_verified || false,
      locale: decodedPayload.locale || 'en',
    };
  } catch (error) {
    console.error('Error decoding Google ID token:', error);
    return null;
  }
}

/**
 * Extract user-friendly display information from Google profile
 * @param profile - Google user profile
 * @returns Formatted display information
 */
export function formatGoogleUserDisplay(profile: GoogleUserProfile) {
  return {
    fullName: profile.name || `${profile.given_name} ${profile.family_name}`.trim(),
    firstName: profile.given_name || profile.name?.split(' ')[0] || '',
    lastName: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '',
    email: profile.email,
    picture: profile.picture,
    initials: getInitials(profile.given_name, profile.family_name, profile.name),
  };
}

/**
 * Generate initials from user names
 * @param firstName - First name
 * @param lastName - Last name
 * @param fullName - Fallback full name
 * @returns User initials (e.g., "JD" for "John Doe")
 */
function getInitials(firstName?: string, lastName?: string, fullName?: string): string {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  
  if (fullName) {
    const names = fullName.split(' ').filter(name => name.length > 0);
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
  }
  
  return '?';
}

/**
 * Validate if a Google ID token has the required scopes
 * @param idToken - The Google ID token
 * @param requiredScopes - Array of required scopes
 * @returns True if all required scopes are present
 */
export function validateGoogleScopes(idToken: string, requiredScopes: string[]): boolean {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return false;
    
    const payload = parts[1];
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = JSON.parse(atob(paddedPayload));
    
    const tokenScopes = decodedPayload.scope?.split(' ') || [];
    
    return requiredScopes.every(scope => tokenScopes.includes(scope));
  } catch (error) {
    console.error('Error validating Google scopes:', error);
    return false;
  }
}
