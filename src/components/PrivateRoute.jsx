import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
  const { user, accessToken, loading } = useAuth(); // Get loading from useAuth

  // If authentication context is still loading, render nothing
  if (loading) {
    return null; // Or a loading spinner component
  }

  // If not loading and no access token, redirect to login
  if (!accessToken) {
    console.log("PrivateRoute: Redirecting to login - no accessToken");
    return <Navigate to="/login" replace />;
  }

  // If roles are required, check if user object and role exist and match
  // Added a log here to see if this check is causing unexpected redirects.
  if (roles && (!user || !user.userRole || !roles.includes(user.userRole))) {
    console.log("PrivateRoute: Redirecting to / - role check failed or user/role missing", { user, roles });
    // Redirect to an unauthorized page, or show an unauthorized message
    // For now, I'll navigate back to the home or login page as a fallback
    return <Navigate to="/" replace />;
  }

  // If authenticated, authorized, and not loading, render the child components
  console.log("PrivateRoute: Access granted");
  return children;
};

export default PrivateRoute; 