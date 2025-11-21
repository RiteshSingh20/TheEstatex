import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  FC,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";
import { User } from "../types";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: User) => Promise<boolean>;
  updateUserData: (userData: User) => Promise<void>;
  reloadUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkPhoneExists: (phone: string) => Promise<boolean>;
  loading: boolean;
}
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => Promise.resolve(false),
  logout: () => {},
  signup: () => Promise.resolve(false),
  updateUserData: () => Promise.resolve(),
  reloadUser: () => Promise.resolve(),
  resetPassword: () => Promise.resolve(),
  checkPhoneExists: () => Promise.resolve(false),
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Always restore user from Firebase Auth on refresh
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Add retry logic for better reliability during document updates
          let retries = 3;
          let userDoc;
          
          while (retries > 0) {
            try {
              userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
              if (userDoc.exists()) break;
              
              // If document doesn't exist, wait and retry (might be a race condition)
              await new Promise(resolve => setTimeout(resolve, 300));
              retries--;
            } catch (error) {
              retries--;
              if (retries === 0) throw error;
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
          
          if (userDoc && userDoc.exists()) {
            const data = userDoc.data();
            const userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              subscriptionLocations: data.subscriptionLocations || [],
              role: data.role || "user", // Ensure role is set, default to "user"
              ...data,
            } as User;
            setUser(userData);
            // Set cookies for user id and role
            Cookies.set("userId", userData.id, {
              sameSite: "lax",
              secure: true,
            });
            // Remove isAdmin cookie usage to avoid confusion
            Cookies.remove("isAdmin");
          } else {
            // Only sign out if this is a fresh login attempt, not during updates
            const isRecentSignup = localStorage.getItem('justSignedUp');
            if (!isRecentSignup) {
              console.warn('User document not found after retries, signing out for safety');
              await signOut(auth);
              setUser(null);
              Cookies.remove("userId");
              Cookies.remove("isAdmin");
            } else {
              // For recent signups, keep user logged in but show warning
              console.warn('User document not found but recent signup detected, keeping user logged in');
            }
          }
        } catch (error: unknown) {
          console.error("Firestore getDoc error:", error);
          // Don't automatically sign out on network errors during updates
          const isRecentSignup = localStorage.getItem('justSignedUp');
          if (!isRecentSignup) {
            toast.error(
              "Failed to fetch user data. Please check your internet connection."
            );
            setUser(null);
            Cookies.remove("userId");
            Cookies.remove("isAdmin");
          }
        }
      } else {
        setUser(null);
        Cookies.remove("userId");
        Cookies.remove("isAdmin");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);



  // Signup: create Firebase user, Firestore doc, and set context
  const signup = async (userData: User): Promise<boolean> => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      await updateProfile(firebaseUser, {
        displayName: userData.fullName,
      });
      console.log("Creating user doc for UID:", firebaseUser.uid);
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, {
        fullName: userData.fullName,
        firmName: userData.firmName,
        phone: userData.phone,
        email: userData.email,
        reraNumber: userData.reraNumber,
        state: userData.state,
        city: userData.city,
        location: userData.location,
        subscriptionLocations: userData.subscriptionLocations || [],
        role: "user", // Default role for new users
        isAdmin: false,
        createdAt: new Date().toISOString(),
      });
      Cookies.set("userId", firebaseUser.uid, {
        sameSite: "lax",
        secure: true,
      });
      Cookies.set("isAdmin", "false", { sameSite: "lax", secure: true });
      
      // Set user state immediately after signup
      const newUserData = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        fullName: userData.fullName,
        firmName: userData.firmName,
        phone: userData.phone,
        reraNumber: userData.reraNumber,
        state: userData.state,
        city: userData.city,
        location: userData.location,
        subscriptionLocations: userData.subscriptionLocations || [],
        role: "user",
        isAdmin: false,
      } as User;
      setUser(newUserData);

      return true;
    } catch (error: unknown) {
      console.error("Signup error:", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error
      ) {
        const errorCode = (error as { code?: string }).code;
        if (errorCode === "auth/email-already-in-use") {
          toast.error("Email already exists. Please use a different email or try logging in.");
          return false;
        }
      }
      toast.error("An error occurred during signup. Please try again.");
      return false;
    }
  };

  // Login: Firebase Auth, Firestore fetch handled by onAuthStateChanged
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Authenticate with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      // onAuthStateChanged will set user and cookies
      return true;
    } catch (error: unknown) {
      console.error("Login error:", error);
      // Only show generic error for actual authentication failures
      if (typeof error === "object" && error !== null && "code" in error) {
        const errorCode = (error as { code?: string }).code;
        if (errorCode === "auth/user-not-found" || errorCode === "auth/wrong-password" || errorCode === "auth/invalid-credential") {
          toast.error("Invalid email or password");
        } else {
          toast.error("An error occurred during login. Please try again.");
        }
      } else {
        toast.error("Invalid email or password");
      }
      return false;
    }
  };

  // Logout: Firebase Auth, clear context and cookies
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      Cookies.remove("userId");
      Cookies.remove("isAdmin");
      localStorage.removeItem("justSignedUp");
    } catch (error: unknown) {
      console.error("Logout error:", error);
      toast.error(
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message ||
              "An error occurred during logout. Please try again."
          : "An error occurred during logout. Please try again."
      );
    }
  };

  // Update user data in Firestore and context
  const updateUserData = async (userData: User) => {
    try {
      if (!userData.id) throw new Error("No authenticated user");
      if (!Array.isArray(userData.subscriptionLocations)) {
        throw new Error("subscriptionLocations must be an array");
      }
      userData.subscriptionLocations.forEach((loc) => {
        if (
          typeof loc !== "object" ||
          !loc.id ||
          !loc.name ||
          typeof loc.price !== "number"
        ) {
          throw new Error("Invalid subscription location object structure");
        }
      });
      const userDocRef = doc(db, "users", userData.id);
      await updateDoc(userDocRef, {
        subscriptionLocations: userData.subscriptionLocations,
        updatedAt: new Date().toISOString(),
        ...Object.fromEntries(
          Object.entries(userData).filter(
            ([key]) => key !== "subscriptionLocations"
          )
        ),
      });
      await reloadUser();
      Cookies.set("isAdmin", userData.isAdmin ? "true" : "false");
    } catch (error: unknown) {
      console.error("Update error:", error);
      if (error instanceof Error) {
        toast.error(
          error.message || "Failed to update profile. Please try again."
        );
        throw error;
      } else {
        toast.error("Failed to update profile. Please try again.");
        throw new Error("Failed to update profile. Please try again.");
      }
    }
  };

  // Force reload user from Firestore (after subscription change)
  const reloadUser = async () => {
    if (!auth.currentUser) return;
    try {
      // Add retry logic for better reliability
      let retries = 3;
      let userDoc;
      
      while (retries > 0) {
        try {
          userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) break;
          
          // If document doesn't exist, wait and retry
          await new Promise(resolve => setTimeout(resolve, 200));
          retries--;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      if (userDoc && userDoc.exists()) {
        const data = userDoc.data();
        const freshUserData = {
          id: auth.currentUser.uid,
          email: auth.currentUser.email || "",
          subscriptionLocations: data.subscriptionLocations || [],
          ...data,
        } as User;
        setUser(freshUserData);
      }
    } catch (error) {
      console.error("Failed to reload user data:", error);
      // Don't throw error to prevent auth context from signing out user
    }
  };

  // Password reset method
  const resetPassword = async (email: string): Promise<void> => {
    try {
      const actionCodeSettings = {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      };
      
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      toast.success("Password reset email sent! Please check your inbox and spam folder.");
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      
      if (error instanceof Error) {
        const errorCode = (error as any).code;
        
        switch (errorCode) {
          case 'auth/user-not-found':
            toast.error("No account found with this email address.");
            break;
          case 'auth/invalid-email':
            toast.error("Invalid email address.");
            break;
          case 'auth/too-many-requests':
            toast.error("Too many requests. Please try again later.");
            break;
          default:
            toast.error(error.message || "Failed to send password reset email.");
        }
      } else {
        toast.error("Failed to send password reset email.");
      }
      throw error;
    }
  };

  // Check if phone number already exists
  const checkPhoneExists = async (phone: string): Promise<boolean> => {
    try {
      const q = query(collection(db, "users"), where("phone", "==", phone));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking phone:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        updateUserData,
        reloadUser,
        resetPassword,
        checkPhoneExists,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
