import React, { createContext, useState, useEffect } from "react";

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminData, setAdminData] = useState(null);
  const [token, setToken] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  // Load data from localStorage on page load
  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("adminData");
      const storedToken = localStorage.getItem("token");
      const storedApiKey = localStorage.getItem("apiKey");

      if (storedAdmin) {
        setAdminData(JSON.parse(storedAdmin));
      }
      if (storedToken) {
        setToken(storedToken);
      }
      if (storedApiKey) {
        setApiKey(storedApiKey);
      }
    } catch (error) {
      console.error('Error loading auth data:', error);

      localStorage.removeItem("adminData");
      localStorage.removeItem("toke");
      localStorage.removeItem("apiKey");

    }
  }, []);

  // Login function — store to both state and localStorage
  const login = (admin, jwtToken, apiKey) => {
    try {
      if (admin) {
        localStorage.setItem("adminData", JSON.stringify(admin));
        setAdminData(admin);
      }
      if (jwtToken) {
        localStorage.setItem("token", jwtToken);
        setToken(jwtToken);
      }
      if (apiKey) {
        localStorage.setItem("apiKey", apiKey);
        setApiKey(apiKey);
      }
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  // Logout function — clear both state and storage
  const logout = () => {
    localStorage.removeItem("adminData");
    localStorage.removeItem("token");
    localStorage.removeItem("apiKey");
    setAdminData(null);
    setToken(null);
    setApiKey(null);
  };

  return (
    <AuthContext.Provider value={{ adminData, token, apiKey, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
