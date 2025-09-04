// FIX: Use Firebase v9 compat imports to address errors from using v8 syntax with a v9+ SDK.
// FIX: The `firebase/compat/app` module requires a default import to correctly resolve types from services like firestore.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

export enum UserRole {
  MAGAZZINO = 'magazzino',
  FORZA_VENDITA = 'forza_vendita',
  RESPONSABILE = 'responsabile',
}

export interface User {
  uid: string;
  email: string; // The actual email used for Firebase Auth
  username: string; // The display name and login identifier
  role: UserRole;
}

export interface ExcelRow {
  [key: string]: any;
  tot?: number;
}

export interface FileData {
  fileName: string;
  data: ExcelRow[];
}

export interface FileMetadata {
  id: string;
  fileName: string;
  uploaderUsername: string;
  uploaderUid: string;
  role: UserRole;
  createdAt: firebase.firestore.Timestamp;
  downloadURL: string;
  storagePath: string; // Aggiunto per il download sicuro tramite SDK
  isArchived?: boolean; // Aggiunto per il sistema di archiviazione
}

// StoredFile is no longer needed as we fetch data and metadata separately
// export interface StoredFile { ... }