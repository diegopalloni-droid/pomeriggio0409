import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
// FIX: Use Firebase v9 compat imports to address errors from using v8 syntax with a v9+ SDK.
// FIX: The `firebase/compat/app` module requires a default import to correctly resolve types from services like firestore.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { auth, db, storage } from '../firebase';
import { User, UserRole } from '../types';

interface AppContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  uploadFile: (user: User, file: File, finalFileName?: string) => Promise<void>;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
          if (userDoc.exists) {
            setUser(userDoc.data() as User);
          } else {
            setError("User data not found in database.");
            await auth.signOut();
          }
        } catch (err) {
            setError("Failed to fetch user data.");
            await auth.signOut();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      // Directly sign in with email and password, avoiding the Firestore query
      await auth.signInWithEmailAndPassword(email, pass);
      // The onAuthStateChanged listener will handle fetching user data from Firestore
    } catch (err: any) {
       // Firebase provides specific error codes for login failures.
       if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            setError("Invalid email or password.");
        } else {
            setError(err.message);
        }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await auth.signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const uploadFile = async (user: User, file: File, finalFileName?: string) => {
    setLoading(true);
    setError(null);
    try {
        const fileNameToUpload = finalFileName ? `${finalFileName}.xlsx` : file.name;
        
        // Se l'utente è Magazzino, archivia i suoi file precedenti
        if (user.role === UserRole.MAGAZZINO) {
            const batch = db.batch();
            const activeFilesQuery = db.collection('files')
                .where('uploaderUid', '==', user.uid)
                .where('role', '==', UserRole.MAGAZZINO)
                .where('isArchived', '!=', true);

            const snapshot = await activeFilesQuery.get();
            snapshot.forEach(doc => {
                batch.update(doc.ref, { isArchived: true });
            });
            await batch.commit();
        }

        // Tutti i file ora hanno un percorso univoco per prevenire sovrascritture
        const filePath = `files/${user.uid}/${Date.now()}_${fileNameToUpload}`;
        
        const storageRef = storage.ref(filePath);
        const uploadTask = await storageRef.put(file);
        const downloadURL = await uploadTask.ref.getDownloadURL();

        const fileMetadata = {
            fileName: fileNameToUpload,
            uploaderUsername: user.username,
            uploaderUid: user.uid,
            role: user.role,
            createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
            downloadURL: downloadURL,
            storagePath: filePath,
            isArchived: false // Il nuovo file è sempre attivo
        };

        // Salva i metadati in Firestore
        await db.collection('files').add(fileMetadata);
        
    } catch (err: any) {
        setError(err.message);
        throw err; // Rilancia l'errore per gestirlo nel componente
    } finally {
        setLoading(false);
    }
  };

  const value = { user, loading, error, login, logout, uploadFile, setError };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};