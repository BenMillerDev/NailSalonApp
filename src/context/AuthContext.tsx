import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { GoogleSignin } from "../services/googleSignIn";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  salonName: string;
  phone: string;
  role: "owner";
  createdAt: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
    salonName: string,
    phone: string,
  ) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  logOut: () => Promise<AuthResult>;
}

// ─────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Configure Google Sign-In when the app loads
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

    // Listen for auth state changes (login, logout, app restart)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profileDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data() as UserProfile);
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up a new owner account
  const signUp = async (
    email: string,
    password: string,
    name: string,
    salonName: string,
    phone: string,
  ): Promise<AuthResult> => {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await setDoc(doc(db, "users", newUser.uid), {
        uid: newUser.uid,
        email,
        name,
        salonName,
        phone,
        role: "owner",
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: getFriendlyError(error.code) };
    }
  };

  // Sign in with email and password
  const signIn = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: getFriendlyError(error.code) };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<AuthResult> => {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const credential = GoogleAuthProvider.credential(idToken);
      const { user: firebaseUser } = await signInWithCredential(
        auth,
        credential,
      );

      const profileDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!profileDoc.exists()) {
        await setDoc(doc(db, "users", firebaseUser.uid), {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          salonName: "",
          phone: "",
          role: "owner",
          createdAt: new Date().toISOString(),
        });
      }

      return { success: true };
    } catch (_) {
      return {
        success: false,
        error:
          "Google sign-in is not available in Expo Go. It will work in the full build.",
      };
    }
  };

  // Sign out
  const logOut = async (): Promise<AuthResult> => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getFriendlyError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists";
    case "auth/invalid-email":
      return "Please enter a valid email address";
    case "auth/weak-password":
      return "Password should be at least 6 characters";
    case "auth/user-not-found":
      return "No account found with this email";
    case "auth/wrong-password":
      return "Incorrect password";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later";
    default:
      return "Something went wrong. Please try again";
  }
}
