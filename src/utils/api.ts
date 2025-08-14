/**
 * Utility functions for making authenticated API calls
 */

/**
 * Makes an authenticated GET request with the access token
 */
export const authenticatedGet = async (url: string, token: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Makes an authenticated POST request with the access token
 */
export const authenticatedPost = async (url: string, token: string, data?: any) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Makes an authenticated PUT request with the access token
 */
export const authenticatedPut = async (url: string, token: string, data?: any) => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Makes an authenticated DELETE request with the access token
 */
export const authenticatedDelete = async (url: string, token: string) => {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Make an authenticated request that requires both access token and club ID
 * @param endpoint - The API endpoint (without base URL)
 * @param options - Fetch options (method, body, etc.)
 * @returns Promise with the response data
 */
export async function authenticatedClubRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get access token from localStorage
  const accessToken = localStorage.getItem('access');
  if (!accessToken) {
    throw new Error('Token d\'accès non trouvé. Veuillez vous reconnecter.');
  }

  // Get selected club from localStorage
  const selectedClubData = localStorage.getItem('selectedClub');
  if (!selectedClubData) {
    throw new Error('Aucun club sélectionné. Veuillez sélectionner un club.');
  }

  let selectedClub;
  try {
    selectedClub = JSON.parse(selectedClubData);
  } catch (error) {
    throw new Error('Données du club invalides. Veuillez sélectionner un club.');
  }

  if (!selectedClub.club_id) {
    throw new Error('ID du club manquant. Veuillez sélectionner un club.');
  }

  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    'X-Club-ID': selectedClub.club_id,
    ...options.headers,
  };

  // Prepare request options
  const requestOptions: RequestInit = {
    ...options,
    headers,
  };

  // Make the request
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, requestOptions);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Token d\'accès expiré. Veuillez vous reconnecter.');
    }
    if (response.status === 403) {
      throw new Error('Accès refusé. Vérifiez vos permissions pour ce club.');
    }
    if (response.status === 404) {
      throw new Error('Ressource non trouvée.');
    }
    
    const errorText = await response.text();
    throw new Error(`Erreur ${response.status}: ${errorText || 'Erreur inconnue'}`);
  }

  // Try to parse JSON response
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    // If response is not JSON, return the text
    const text = await response.text();
    return text as T;
  }
}

/**
 * Make a GET request that requires both access token and club ID
 * @param endpoint - The API endpoint (without base URL)
 * @returns Promise with the response data
 */
export async function authenticatedClubGet<T = any>(endpoint: string): Promise<T> {
  return authenticatedClubRequest<T>(endpoint, { method: 'GET' });
}

/**
 * Make a POST request that requires both access token and club ID
 * @param endpoint - The API endpoint (without base URL)
 * @param body - Request body
 * @returns Promise with the response data
 */
export async function authenticatedClubPost<T = any>(endpoint: string, body: any): Promise<T> {
  return authenticatedClubRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Make a PUT request that requires both access token and club ID
 * @param endpoint - The API endpoint (without base URL)
 * @param body - Request body
 * @returns Promise with the response data
 */
export async function authenticatedClubPut<T = any>(endpoint: string, body: any): Promise<T> {
  return authenticatedClubRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Make a DELETE request that requires both access token and club ID
 * @param endpoint - The API endpoint (without base URL)
 * @returns Promise with the response data
 */
export async function authenticatedClubDelete<T = any>(endpoint: string): Promise<T> {
  return authenticatedClubRequest<T>(endpoint, { method: 'DELETE' });
}

/**
 * Make a PATCH request that requires both access token and club ID
 * @param endpoint - The API endpoint (without base URL)
 * @param body - Request body
 * @returns Promise with the response data
 */
export async function authenticatedClubPatch<T = any>(endpoint: string, body: any): Promise<T> {
  return authenticatedClubRequest<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
