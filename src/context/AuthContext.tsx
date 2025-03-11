import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import LoadingScreen from "../pages/Loading";

interface AuthUser {
  uid: string;
  email: string | null;
  role: "admin" | "ambassador";
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
  
      if (user) {
        // Fetch the user's role from Firestore
        const userDocRef = doc(db, "staffs", user.uid);
        const userDoc = await getDoc(userDocRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role;
  
  
          const authUser: AuthUser = {
            uid: user.uid,
            email: user.email,
            role: role,
          };
  
          setCurrentUser(authUser);
          localStorage.setItem("authUser", JSON.stringify(authUser));
        } else {
          console.error("User document not found in Firestore.");
          setCurrentUser(null);
          localStorage.removeItem("authUser");
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem("authUser");
      }
  
      setIsLoading(false);
    });
  
    return () => unsubscribe();
  }, []);
  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("authUser");
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    currentUser,
    isLoading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};