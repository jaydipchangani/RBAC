import * as jose from 'jose';

// Secret key for JWT signing (in a real app, this would be an environment variable)
const SECRET_KEY = new TextEncoder().encode('your-secret-key-for-jwt-signing');

// Generate JWT token
export const generateToken = async (payload: any): Promise<string> => {
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(SECRET_KEY);
  
  return jwt;
};

// Verify JWT token
export const verifyToken = async (token: string): Promise<any> => {
  try {
    const { payload } = await jose.jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
};

// Set token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('accessToken');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};