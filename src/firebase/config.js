import { getAuth } from 'firebase/auth';
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDTnOKsrWz8ELA0jU0PzZaylOyzfnPs8kk",
  authDomain: "mywork-d2674.firebaseapp.com",
  projectId: "mywork-d2674",
  storageBucket: "mywork-d2674.firebasestorage.app",
  messagingSenderId: "658311912305",
  appId: "1:658311912305:web:abeb1817100ae7b3bc74d0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);