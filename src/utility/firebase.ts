import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyALpicpVSqtgFkRJ9AvKsdqPg0zR2nWfTA",
    authDomain: "summit-laila.firebaseapp.com",
    projectId: "summit-laila",
    storageBucket: "summit-laila.firebasestorage.app",
    messagingSenderId: "988824887930",
    appId: "1:988824887930:web:1e945d0206dd801c3d51c3",
    measurementId: "G-5EGCNJ1DEJ"
};

const app: FirebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
// connectAuthEmulator(firebaseAuth, "http://Localhost: 9099");