# Google Auth Setup Guide

## Prerequisites

1. **Google Cloud Console Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Add `http://localhost:3000` to the authorized JavaScript origins
   - Add `http://localhost:3000/auth/callback` to the authorized redirect URIs
   - Copy the Client ID

2. **Environment Configuration**
   Create a `.env.local` file in the root directory with:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

## Backend Requirements

Your backend at `localhost:8000` should have a `/auth/frontend` endpoint that:

1. Accepts POST requests with an `id_token` in the request body
2. Verifies the Google ID token
3. Returns a response with:
   ```json
   {
     "user": {
       "id": "user_id",
       "email": "user@example.com",
       "name": "User Name",
       "picture": "https://profile-picture-url.com"
     },
     "token": "your-jwt-token"
   }
   ```

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Features

- Google OAuth authentication
- Persistent login state (localStorage)
- User profile display
- Logout functionality
- Responsive design with Tailwind CSS

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Main page with login/profile
│   └── globals.css         # Global styles
├── components/
│   ├── GoogleLogin.tsx     # Google sign-in component
│   └── UserProfile.tsx     # User profile display
├── contexts/
│   └── AuthContext.tsx     # Authentication state management
└── types/
    └── auth.ts             # TypeScript interfaces
```

## Troubleshooting

1. **Google Sign-in button not appearing**: Check that your Google Client ID is correctly set in `.env.local`
2. **CORS errors**: Ensure your backend allows requests from `localhost:3000`
3. **Authentication fails**: Verify your backend endpoint is working and returning the expected response format
