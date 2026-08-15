import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

const firebaseSdkConfig: FirebaseOptions = {
    "projectId": "velvet-dusk",
    "appId": "1:982803979937:web:f91908bc384bab0be51ae0",
    "storageBucket": "velvet-dusk.firebasestorage.app",
    "apiKey": "AIzaSyA-S3rADr17P_eCk6wbE1R7X7Dk8iTvkSA",
    "authDomain": "velvet-dusk.firebaseapp.com",
    "messagingSenderId": "982803979937",
    "measurementId": "G-E3561HQXLN"
};

const app: FirebaseApp = initializeApp(firebaseSdkConfig);

export const firebaseAuth = getAuth(app);
// connectAuthEmulator(firebaseAuth, "http://Localhost: 9099");