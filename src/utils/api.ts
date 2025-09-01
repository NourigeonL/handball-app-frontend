/**
 * Utility functions for making authenticated API calls using session cookies
 */

/**
 * Makes an authenticated GET request using session cookies
 */
export const authenticatedGet = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Makes an authenticated POST request using session cookies
 */
export const authenticatedPost = async (url: string, data?: any) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include', // Include cookies
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Makes an authenticated PUT request using session cookies
 */
export const authenticatedPut = async (url: string, data?: any) => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include', // Include cookies
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Makes an authenticated DELETE request using session cookies
 */
export const authenticatedDelete = async (url: string) => {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Make an authenticated request that requires both session authentication and club ID
 * @param endpoint - The API endpoint (without base URL)
 * @param options - Fetch options (method, body, etc.)
 * @returns Promise with the response data
 */
export async function authenticatedClubRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get selected club from localStorage
  const selectedClubData = localStorage.getItem('selectedClub');
  if (!selectedClubData) {
    throw new Error('Aucun club sélectionné. Veuillez sélectionner un club.');
  }

  const selectedClub = JSON.parse(selectedClubData);
  console.log('Selected club data:', selectedClub);
  
  const clubId = selectedClub.club_id || selectedClub.id;
  console.log('Club ID extracted:', clubId);

  if (!clubId) {
    throw new Error('ID du club manquant dans les données stockées.');
  }

  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Club-ID': clubId.toString(),
    ...options.headers,
  };

  // Make the request
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  });

  // Handle common HTTP status codes with French error messages
  if (!response.ok) {
    switch (response.status) {
      case 401:
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      case 403:
        throw new Error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
      case 404:
        throw new Error('Ressource non trouvée.');
      default:
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
  }

  return response.json();
}

/**
 * Helper function for GET requests requiring club authentication
 */
export const authenticatedClubGet = async <T = any>(endpoint: string): Promise<T> => {
  return authenticatedClubRequest<T>(endpoint, { method: 'GET' });
};

/**
 * Helper function for POST requests requiring club authentication
 */
export const authenticatedClubPost = async <T = any>(endpoint: string, data?: any): Promise<T> => {
  return authenticatedClubRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(data) });
};

/**
 * Helper function for PUT requests requiring club authentication
 */
export const authenticatedClubPut = async <T = any>(endpoint: string, data?: any): Promise<T> => {
  return authenticatedClubRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) });
};

/**
 * Helper function for DELETE requests requiring club authentication
 */
export const authenticatedClubDelete = async <T = any>(endpoint: string): Promise<T> => {
  return authenticatedClubRequest<T>(endpoint, { method: 'DELETE' });
};

/**
 * Helper function for PATCH requests requiring club authentication
 */
export const authenticatedClubPatch = async <T = any>(endpoint: string, data?: any): Promise<T> => {
  return authenticatedClubRequest<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) });
};
