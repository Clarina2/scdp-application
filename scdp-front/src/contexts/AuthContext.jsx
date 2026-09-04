import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi, adminApi } from "../api/client";
import { DEMO_MODE, DEMO_USER } from "../config/demo";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEMO_MODE ? DEMO_USER : null);
  const [viewAsUser, setViewAsUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(() => {
    if (DEMO_MODE) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('accessToken');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    const viewAsData = localStorage.getItem('viewAsUser');

    if (token && userName) {
      setUser({
        name: userName,
        email: userEmail,
        role: userRole,
      });
      
      // Restore view-as context if present
      if (viewAsData) {
        try {
          setViewAsUser(JSON.parse(viewAsData));
        } catch (e) {
          console.error('Failed to parse view-as data:', e);
          localStorage.removeItem('viewAsUser');
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const authTimer = window.setTimeout(() => {
      checkAuth();
    }, 0);

    return () => window.clearTimeout(authTimer);
  }, [checkAuth]);

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
    if (DEMO_MODE) {
      return;
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('viewAsUser');
    setUser(null);
    setViewAsUser(null);
  };

  const changePassword = async (oldPassword, newPassword) => {
    return await authApi.changePassword(oldPassword, newPassword);
  };

  const viewAs = async (userId) => {
    const response = await adminApi.viewAsUser(userId);
    
    // Store view-as context
    localStorage.setItem('viewAsUser', JSON.stringify(response.viewAsUser));
    setViewAsUser(response.viewAsUser);
    
    return response;
  };

  const exitViewAs = async () => {
    const response = await adminApi.exitViewAs();
    
    // Clear view-as context
    localStorage.removeItem('viewAsUser');
    setViewAsUser(null);
    
    return response;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      viewAsUser, 
      loading, 
      login, 
      logout, 
      changePassword, 
      checkAuth,
      viewAs,
      exitViewAs
    }}>
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
