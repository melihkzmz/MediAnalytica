import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBPcwGb9N_fHXA6TPaztHbn9Dg-8lvoq2I",
  authDomain: "medianalytica-71c1d.firebaseapp.com",
  projectId: "medianalytica-71c1d",
  storageBucket: "medianalytica-71c1d.firebasestorage.app",
  messagingSenderId: "965944324546",
  appId: "1:965944324546:web:d0731f60ec2b28748fa65b",
  measurementId: "G-61JFBSYM94"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const storage = getStorage(app)
export const db = getFirestore(app)

export default app

