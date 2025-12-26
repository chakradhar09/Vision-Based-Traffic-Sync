import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { logger } from '../utils/logger';

// Mock user type for demo mode - matches Firebase User interface structure
interface MockUser {
  email: string | null;
  uid: string;
  displayName?: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
}

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
    if (!email || typeof email !== 'string' || !email.includes('@')) {
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
          
          // Fail fast if demo credentials are not configured in production
          if (import.meta.env.PROD) {
            throw new Error("Authentication not configured. Please set up Firebase Auth.");
          }
          
          // Use defaults only in development
          const validEmail = demoEmail || "operator@traffic.com";
          const validPassword = demoPassword || "demo123";
          
          if (email === validEmail && password === validPassword) {
            // Create proper mock user object matching User interface
            const mockUser: MockUser = {
              email: email,
              uid: "demo-user",
              displayName: null,
              photoURL: null,
              emailVerified: false,
            };
            setCurrentUser(mockUser as User);
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
