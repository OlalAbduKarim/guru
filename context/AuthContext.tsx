import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signOut, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db, googleProvider } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp, runTransaction, arrayUnion, arrayRemove, DocumentReference, onSnapshot, updateDoc } from "firebase/firestore";
import type { AppUser } from '../types';

interface AuthContextType {
  currentUser: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (fullName: string, email: string, password: string, role: 'Student' | 'Coach') => Promise<any>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
  toggleFollow: (otherUserId: string) => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const mapFirebaseUserToAppUser = (firebaseUser: FirebaseUser, firestoreData: any): AppUser => {
    return {
        id: firebaseUser.uid,
        name: firestoreData.fullName,
        email: firestoreData.email,
        role: firestoreData.role as AppUser['role'],
        avatarUrl: firestoreData.avatarUrl,
        country: firestoreData.country,
        skillLevel: firestoreData.skillLevel as AppUser['skillLevel'],
        bio: firestoreData.bio || '',
        followers: firestoreData.followers || [],
        following: firestoreData.following || [],
        enrolledCourses: firestoreData.enrolledCourses || [],
    }
  }

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }

  const signup = async (fullName: string, email: string, password: string, role: 'Student' | 'Coach') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      fullName,
      email,
      role,
      createdAt: serverTimestamp(),
      skillLevel: 'Beginner',
      country: 'Not set',
      avatarUrl: `https://i.pravatar.cc/150?u=${user.uid}`,
      bio: role === 'Coach' ? 'Experienced chess coach ready to help you level up.' : 'Passionate chess student, eager to learn.',
      followers: [],
      following: [],
      enrolledCourses: [],
    });
    return userCredential;
  }

  const logout = () => {
    return signOut(auth);
  }

  const googleSignIn = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
       await setDoc(userDocRef, {
        uid: user.uid,
        fullName: user.displayName,
        email: user.email,
        role: 'Student', // Default role
        createdAt: serverTimestamp(),
        skillLevel: 'Beginner',
        country: 'Not set',
        avatarUrl: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
        bio: 'Passionate chess student, eager to learn.',
        followers: [],
        following: [],
        enrolledCourses: [],
      });
    }
    return userCredential;
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  }
  
  const toggleFollow = async (otherUserId: string) => {
      if (!currentUser) throw new Error("No user logged in");
      
      const currentUserId = currentUser.id;
      const currentUserDocRef = doc(db, 'users', currentUserId);
      const otherUserDocRef = doc(db, 'users', otherUserId);

      try {
        await runTransaction(db, async (transaction) => {
            const currentUserDoc = await transaction.get(currentUserDocRef);
            if (!currentUserDoc.exists()) {
                throw "Current user document does not exist!";
            }
            const isFollowing = currentUserDoc.data().following?.includes(otherUserId);
            
            if (isFollowing) {
                // Unfollow
                transaction.update(currentUserDocRef, { following: arrayRemove(otherUserId) });
                transaction.update(otherUserDocRef, { followers: arrayRemove(currentUserId) });
            } else {
                // Follow
                transaction.update(currentUserDocRef, { following: arrayUnion(otherUserId) });
                transaction.update(otherUserDocRef, { followers: arrayUnion(currentUserId) });
            }
        });
        console.log("Follow/Unfollow transaction successfully committed!");
      } catch (e) {
        console.error("Follow/Unfollow transaction failed: ", e);
      }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!currentUser) throw new Error("No user logged in");
    const userDocRef = doc(db, 'users', currentUser.id);
    await updateDoc(userDocRef, {
        enrolledCourses: arrayUnion(courseId)
    });
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        // Set up a real-time listener for the user's document
        const unsubUserDoc = onSnapshot(userDocRef, (userDoc) => {
            if(userDoc.exists()) {
                const userData = userDoc.data();
                setCurrentUser(mapFirebaseUserToAppUser(user, userData));
            } else {
                // This case might happen if a user is created in Auth but not in Firestore yet.
                // It's handled by signup/googleSignIn, but as a fallback:
                 setDoc(userDocRef, { /* initial data */ });
            }
        });
        // We might want to return this unsubUserDoc from the outer unsubscribe
        // to clean it up properly, but for now this should work.
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    googleSignIn,
    resetPassword,
    toggleFollow,
    enrollInCourse
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};