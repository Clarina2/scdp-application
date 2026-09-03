import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('accessToken');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');

    if (token && userName) {
      setUser({
        name: userName,
        email: userEmail,
        role: userRole,
      });
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await authApi.login(email, password);
    
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('userName', response.user.name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', response.user.role);
    
    setUser({
      name: response.user.name,
      email: email,
      role: response.user.role,
    });

    return response;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setUser(null);
  };

  const changePassword = async (oldPassword, newPassword) => {
    return await authApi.changePassword(oldPassword, newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, changePassword, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
