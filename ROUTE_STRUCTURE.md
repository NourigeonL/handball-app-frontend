# Handball App Route Structure

## Public Routes (No Authentication Required)

### `/` - Home Page
- Welcome message and introduction
- Featured clubs list
- Call-to-action buttons for dashboard and clubs
- Accessible to everyone

### `/clubs` - Clubs Directory
- Browse all handball clubs
- Public clubs information
- Shows sign-in prompt for unauthenticated users
- Accessible to everyone

## Protected Routes (Authentication Required)

### `/dashboard` - User Dashboard
- **Protected by:** `ProtectedRoute` component
- User profile overview
- User club information
- Quick action buttons
- Main hub for authenticated users
- **Club Selection:** Automatically shows club selection modal for users with multiple clubs

### `/profile` - User Profile
- **Protected by:** `ProtectedRoute` component
- Detailed user profile management
- Personal information and settings
- **Club Management:** Options to switch between clubs for multi-club users

## Club Selection System

### **Multi-Club Users**
- Users with multiple club memberships must select one club to work with
- Club selection modal appears automatically after login
- Selected club is displayed in navigation and dashboard
- Users can switch clubs at any time from profile or dashboard

### **Single-Club Users**
- Automatically assigned to their single club
- No club selection required
- Streamlined experience

### **Club Session Management**
- Selected club persists for the entire session
- Users can only interact with their selected club
- Club selection stored in localStorage

## Navigation Structure

### Public Navigation
- Home
- Clubs

### Authenticated Navigation
- Home
- Clubs
- Dashboard (highlighted when active)
- Profile

### **Club Status Display**
- Green badge showing currently selected club
- Only visible when a club is selected

## Component Architecture

### `ProtectedRoute`
- Wraps protected pages
- Handles authentication checks
- Redirects unauthenticated users to home
- Shows loading states during auth checks

### `ClubSelectionModal`
- Modal for users to select which club to work with
- Shows all user's club memberships
- Displays club names and user roles
- Automatically appears for multi-club users

### `LogoutModal`
- Options for different logout types:
  - **Sign Out from Club:** Stay signed in but remove club selection
  - **Sign Out Completely:** Full logout from the application
- Only shows for users with multiple clubs

### `LoadingSpinner`
- Reusable loading component
- Multiple sizes (sm, md, lg)
- Consistent styling across the app

## Authentication Flow

1. **Unauthenticated users** can access:
   - Home page
   - Clubs directory (limited view)

2. **Authenticated users** can access:
   - All public routes
   - Dashboard (main private area)
   - Profile management

3. **Club Selection Flow:**
   - After login, check if user has multiple clubs
   - If multiple clubs: show club selection modal
   - If single club: automatically assign
   - Club selection persists for session

4. **Route Protection:**
   - Uses `ProtectedRoute` wrapper
   - Automatic redirects for unauthorized access
   - Loading states during authentication checks

## Sign-Out Options

### **Single Club Users**
- Direct logout to home page

### **Multi-Club Users**
- **Club Logout:** Remove club selection, stay signed in
- **Complete Logout:** Sign out entirely, redirect to home
- Modal appears when clicking sign out button
