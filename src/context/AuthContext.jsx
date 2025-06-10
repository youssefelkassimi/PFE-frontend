import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for API calls

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Or initial state from localStorage
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken')); // Initialize from localStorage
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken')); // Initialize from localStorage
  const [loading, setLoading] = useState(true); // Add loading state

  // Effect to initialize user from localStorage and set loading to false
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedUserId = localStorage.getItem('userId');
    const storedUserRole = localStorage.getItem('userRole');

    if (storedAccessToken && storedUserId && storedUserRole) {
      setUser({
        userId: storedUserId,
        userRole: storedUserRole,
      });
      // accessToken and refreshToken are already initialized from localStorage
    }

    setLoading(false); // Set loading to false after initial check

  }, []); // Empty dependency array means this effect runs once on mount

  // Login function to handle API call and set state
  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password,
      });

      const data = response.data;

      setUser({
        userId: data.userId,
        userRole: data.userRole,
      });
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      // Store in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userRole', data.userRole);

      return data; // Return data for redirection logic in components
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw error to be caught in the component
    }
  };

  // Basic logout function
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 