import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(); // holds the data that you want to be accessible globally without having to pass it through every single component manually

// you just use useAuth() Instead of importing AuthContext and useContext in every component
export const useAuth = () => { 
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  } // if you accidentally try to use authentication data in a component that isn't wrapped by your AuthProvider, this error will tell you exactly what went wrong
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // If this is null, the user is logged out. If it has data, they are logged in.
  const [loading, setLoading] = useState(true); // Prevents flash of login page: By defaulting to loading: true, the app avoids briefly showing the login screen before redirecting an already authenticated user.

  useEffect(() => { // This is the "Brain" of your auth flow. It runs once when the app starts.
    // Check if user is logged in on app start
    const token = localStorage.getItem('token'); 
    const userData = localStorage.getItem('user');
    
    if (token) {
        try {
            setUser(JSON.parse(userData));
        } catch (error) {
            localStorage.removeItem('user');// Verify token is still vali
        } 
        authAPI.getMe()  // send your data to backend to verify the token is still valid
        .then(response => {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        })
        .catch(() => { // If the token has expired or is invalid, it "cleans up" by removing the dead data from localStorage and setting the user to null
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Logged in successfully');
      return { success: true }; // By returning an object, you allow the component that called login (like your LoginForm.js) to decide what to do next
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message }; 
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, ...newUserData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);
      
      toast.success('Account created successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 