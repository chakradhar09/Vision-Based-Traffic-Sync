import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

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
          const demoEmail = import.meta.env.VITE_DEMO_EMAIL || "operator@traffic.com";
          const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || "demo123";
          
          if (email === demoEmail && password === demoPassword) {
            // Mock user object for demo
            setCurrentUser({ email: email, uid: "demo-user" } as User);
            return;
          }
        }
        throw new Error("Auth not initialized");
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
      setCurrentUser(null);
    } catch (error) {
       console.error("Logout failed", error);
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
