import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
console.log("Initializing Firebase with Project ID:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth Helpers
export const signUp = async (email: string, pass: string) => {
  console.log("Starting signup for:", email);
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  console.log("Auth user created with UID:", user.uid);
  
  try {
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      role: 'user', // Default role
      created_at: serverTimestamp()
    });
    console.log("Firestore user document created successfully for UID:", user.uid);
  } catch (error) {
    console.error("Error creating Firestore user document:", error);
    // We still return the user because auth succeeded, 
    // but the UI will catch this if we re-throw or handle it
    handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
  }
  
  return user;
};

export const login = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const logout = () => signOut(auth);
