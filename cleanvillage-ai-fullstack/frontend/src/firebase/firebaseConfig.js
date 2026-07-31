// SIMULATION ONLY.
//
// This project is wired for a Firebase/Firestore backend but ships with no
// live credentials — every read/write goes through binsService.js, which
// mimics the Firestore SDK's shape (collection/doc/onSnapshot-style
// callbacks) over an in-memory store. To go live:
//
//   1. npm install firebase
//   2. Fill in the config below with your Firebase project's values
//      (Project Settings -> General -> Your apps -> SDK setup and config)
//   3. Uncomment the initializeApp/getFirestore lines
//   4. Swap the bodies of the functions in binsService.js for the real
//      Firestore calls (collection(), addDoc(), updateDoc(), onSnapshot()...)
//      — the function signatures were designed to match 1:1, so nothing
//      that imports binsService.js needs to change.

export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'cleanvillage-ai.firebaseapp.com',
  projectId: 'cleanvillage-ai',
  storageBucket: 'cleanvillage-ai.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
}

// import { initializeApp } from 'firebase/app'
// import { getFirestore } from 'firebase/firestore'
// export const app = initializeApp(firebaseConfig)
// export const db = getFirestore(app)

export const FIREBASE_MODE = 'simulation' // 'simulation' | 'live'
