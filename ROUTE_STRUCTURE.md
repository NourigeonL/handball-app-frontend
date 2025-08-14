# Handball Club Manager - Route Structure

## Overview
This application is focused exclusively on **club management for authenticated users**. There are no public routes - all functionality requires authentication.

## Authentication Required Routes

### `/` - Main Dashboard
- **Protected by:** `ProtectedRoute` component
- User profile overview
- User club information
- Quick action buttons
- Main hub for club management

### `/clubs` - All Clubs
- **Protected by:** `ProtectedRoute` component
- Browse all handball clubs in the system
- Club management and information
- Accessible only to authenticated users

### `/profile` - User Profile
- **Protected by:** `ProtectedRoute` component
- Detailed user profile management
- Personal information and settings
- Club switching options for multi-club users

## Club Selection System

### **Multi-Club Users**
- Users with multiple club memberships must select one club to work with
- Club selection modal appears automatically after login
- Selected club is displayed in navigation and dashboard
- Users can switch clubs at any time from profile

### **Single-Club Users**
- Automatically assigned to their single club
- No club selection required
- Streamlined experience

### **Club Session Management**
- Selected club persists for the entire session
- Users can only interact with their selected club
- Club selection stored in localStorage

## Navigation Structure

### **Authenticated Navigation Only**
- Dashboard (main hub)
- All Clubs (browse and manage)
- Profile (user settings and club switching)

### **Club Status Display**
- Green badge showing currently selected club
- Only visible when a club is selected

## Component Architecture

### `ProtectedRoute`
- Wraps ALL pages
- Handles authentication checks
- Redirects unauthenticated users to login
- Shows loading states during auth checks

### `ClubSelectionWrapper`
- Global component for club selection
- Shows modal immediately after login for multi-club users
- Handles club selection logic globally

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

1. **User must authenticate** → No public access
2. **After login** → Check if user has multiple clubs
3. **If multiple clubs** → Show club selection modal immediately
4. **If single club** → Automatically assign
5. **Club selection persists** → For entire session
6. **All routes protected** → Require authentication + club selection

## Sign-Out Options

### **Single Club Users**
- Direct logout to login page

### **Multi-Club Users**
- **Club Logout:** Remove club selection, stay signed in
- **Complete Logout:** Sign out entirely, redirect to login
- Modal appears when clicking sign out button

## Key Differences from Public App

- **No public routes** - Everything requires authentication
- **Focused on management** - Not browsing or discovery
- **Club-centric workflow** - All actions relate to selected club
- **Streamlined navigation** - Only essential management features
- **Professional interface** - Designed for club administrators and members
