import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { logger } from '../utils/logger';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    // Input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      throw new Error("Invalid email address");
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    try {
      if (auth) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Demo mode fallback - only in development
        if (import.meta.env.DEV) {
          const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
          const demoPassword = import.meta.env.VITE_DEMO_PASSWORD;
          
          // Use defaults only in development
          const validEmail = demoEmail || "operator@traffic.com";
          const validPassword = demoPassword || "demo123";
          
          if (email === validEmail && password === validPassword) {
            // Create proper mock user object matching User interface
            const mockUser: User = {
              email: email,
              uid: "demo-user",
              displayName: null,
              photoURL: null,
              emailVerified: false,
              isAnonymous: false,
              metadata: {},
              providerData: [],
              refreshToken: '',
              tenantId: null,
              delete: async () => {},
              getIdToken: async () => 'mock-token',
              getIdTokenResult: async () => ({
                token: 'mock-token',
                signInProvider: 'password',
                claims: {},
                authTime: new Date().toISOString(),
                issuedAtTime: new Date().toISOString(),
                expirationTime: new Date().toISOString(),
                signInSecondFactor: null,
              }),
              reload: async () => {},
              toJSON: () => ({}),
              phoneNumber: null,
              providerId: 'firebase',
            };
            setCurrentUser(mockUser);
            logger.info("Demo login successful", { email });
            return;
          }
        }
        throw new Error("Auth not initialized");
      }
    } catch (error) {
      logger.error("Login failed", error, { email });
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
      setCurrentUser(null);
      logger.info("User logged out");
    } catch (error) {
       logger.error("Logout failed", error);
       // Always clear user state even if logout fails
       setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
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
