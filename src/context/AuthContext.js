// src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case ActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { addNotification } = useNotifications();

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (state.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  };

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('expenseflow_token');
        const userData = localStorage.getItem('expenseflow_user');

        if (token && userData) {
          // Verify token with backend
          const response = await fetch(`${API_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const { user } = await response.json();
            dispatch({
              type: ActionTypes.LOGIN_SUCCESS,
              payload: { user, token },
            });
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('expenseflow_token');
            localStorage.removeItem('expenseflow_user');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('expenseflow_token');
        localStorage.removeItem('expenseflow_user');
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  // Auth actions
  const login = async (email, password) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      const data = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Store token and user data
      localStorage.setItem('expenseflow_token', data.token);
      localStorage.setItem('expenseflow_user', JSON.stringify(data.user));

      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: { user: data.user, token: data.token },
      });

      addNotification({
        type: 'success',
        message: `Welcome back, ${data.user.name}!`,
        duration: 3000,
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      addNotification({
        type: 'error',
        message: error.message,
        duration: 5000,
      });
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      const data = await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      // Store token and user data
      localStorage.setItem('expenseflow_token', data.token);
      localStorage.setItem('expenseflow_user', JSON.stringify(data.user));

      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: { user: data.user, token: data.token },
      });

      addNotification({
        type: 'success',
        message: `Welcome to ExpenseFlow, ${data.user.name}!`,
        duration: 3000,
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      addNotification({
        type: 'error',
        message: error.message,
        duration: 5000,
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('expenseflow_token');
    localStorage.removeItem('expenseflow_user');
    dispatch({ type: ActionTypes.LOGOUT });
    addNotification({
      type: 'info',
      message: 'You have been logged out',
      duration: 3000,
    });
  };

  const updateProfile = async (updates) => {
    try {
      const data = await apiCall('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      dispatch({ type: ActionTypes.UPDATE_USER, payload: data.user });
      localStorage.setItem('expenseflow_user', JSON.stringify(data.user));

      addNotification({
        type: 'success',
        message: 'Profile updated successfully',
        duration: 3000,
      });

      return { success: true };
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message,
        duration: 5000,
      });
      return { success: false, error: error.message };
    }
  };

  const contextValue = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    apiCall,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}