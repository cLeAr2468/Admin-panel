import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminData, setAdminData] = useState(null);
  const [token, setToken] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("adminData");
      const storedToken = localStorage.getItem("token");
      const storedApiKey = localStorage.getItem("apiKey");

      if (storedAdmin) setAdminData(JSON.parse(storedAdmin));
      if (storedToken) setToken(storedToken);
      if (storedApiKey) setApiKey(storedApiKey);
    } catch (error) {
      console.error("Auth load error:", error);
      localStorage.clear();
    }
  }, []);

  const login = (admin, jwtToken, apiKeyValue) => {
    localStorage.setItem("adminData", JSON.stringify(admin));
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("apiKey", apiKeyValue);

    setAdminData(admin);
    setToken(jwtToken);
    setApiKey(apiKeyValue);
  };

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
