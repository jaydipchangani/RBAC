import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User, LoginCredentials } from '../types/types';
import { getApi } from '../api/api';
import { generateToken, setToken, removeToken, isAuthenticated } from '../utils/auth';
import bcrypt from 'bcryptjs';


const initialState: AuthState = {
  isAuthenticated: isAuthenticated(),
  user: null,
  loading: false,
  error: null,
};

type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };


const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          dispatch({ type: 'LOGIN_REQUEST' });
         
          const userId = localStorage.getItem('userId');
          if (userId) {
            const response = await getApi(`/users/${userId}`);
            dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
          } else {
            dispatch({ type: 'LOGIN_FAILURE', payload: 'User not found' });
            removeToken();
          }
        } catch (error) {
          dispatch({ type: 'LOGIN_FAILURE', payload: 'Authentication failed' });
          removeToken();
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      
      const response = await getApi('/users', { email: credentials.email });
      
      const users = response.data;
      const user = users.find((u: User) => u.email === credentials.email);
      
      if (user && await bcrypt.compare(credentials.password, user.password)) {
        const token = await generateToken({ 
          id: user.id, 
          email: user.email,
          role: user.role
        });
        
        setToken(token);
        localStorage.setItem('userId', user.id.toString());
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Invalid email or password' });
      }
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: 'Login failed. Please try again.' 
      });
    }
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem('userId');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};