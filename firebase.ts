// FIX: Use Firebase v9 compat imports to address errors from using v8 syntax with a v9+ SDK.
// FIX: The `firebase/compat/app` module requires a default import, not a namespace import, for services to attach correctly.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAE8pJj3LPkQAIzwq7UzsibAXj_q5cIjG0",
  authDomain: "exel-analysis-dashboard-v2.firebaseapp.com",
  projectId: "exel-analysis-dashboard-v2",
  storageBucket: "exel-analysis-dashboard-v2.appspot.com",
  messagingSenderId: "599022634028",
  appId: "1:599022634028:web:02dd6e0832ff0373047d89"
};

// Inizializza Firebase solo se non è già stato fatto
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Esporta le istanze dei servizi Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

export { auth, db, storage };