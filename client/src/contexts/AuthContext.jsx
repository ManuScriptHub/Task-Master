"use client";

import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { JWT_TOKEN_KEY } from "@/lib/constants";
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from "@/lib/api";

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading
  const navigate = useNavigate();

  const setUserAndToken = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    if (authToken) {
      localStorage.setItem(JWT_TOKEN_KEY, authToken);
    } else {
      localStorage.removeItem(JWT_TOKEN_KEY);
    }
  }, []);
  
  // Effect to load token and potentially user details on initial app load
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem(JWT_TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
        // We have a backend, so let's fetch the user data
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to fetch user details:", error);
          // Don't clear the token here, as it might be valid but the getCurrentUser might be having issues
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false); // No token, not loading
      }
    };
    
    fetchUserData();
  }, []);


  const login = useCallback(async (newToken, userData) => { 
    setUserAndToken(userData, newToken);
    navigate("/"); 
  }, [navigate, setUserAndToken]);

  const logout = useCallback(() => {
    setUserAndToken(null, null);
    navigate("/login");
  }, [navigate, setUserAndToken]);
  
  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

  const contextValue = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setUserAndToken,
  }), [user, token, isAuthenticated, isLoading, login, logout, setUserAndToken]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
