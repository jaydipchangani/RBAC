import * as jose from 'jose';

const SECRET_KEY = new TextEncoder().encode('your-secret-key-for-jwt-signing');

export const generateToken = async (payload: any): Promise<string> => {
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(SECRET_KEY);
  
  return jwt;
};

export const verifyToken = async (token: string): Promise<any> => {
  try {
    const { payload } = await jose.jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
};

export const setToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const removeToken = (): void => {
  localStorage.removeItem('accessToken');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};