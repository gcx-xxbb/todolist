import { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../services';
import { message } from 'antd';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const data = await userApi.getMe();
      setUser(data.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await userApi.login({ email, password });
    localStorage.setItem('token', data.data.token);
    setUser(data.data.user);
    setIsAuthenticated(true);
    message.success('登录成功');
    return data;
  };

  const register = async (username, email, password) => {
    const data = await userApi.register({ username, email, password });
    localStorage.setItem('token', data.data.token);
    setUser(data.data.user);
    setIsAuthenticated(true);
    message.success('注册成功');
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    message.success('已退出登录');
  };

  const updateUser = userData => {
    setUser({ ...user, ...userData });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
