// Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyA1IodR_M-78Xnj0fg2cbA5Wva_bq38jVw",
    authDomain: "contractorinsurance-dfeb3.firebaseapp.com",
    projectId: "contractorinsurance-dfeb3",
    storageBucket: "contractorinsurance-dfeb3.firebasestorage.app",
    messagingSenderId: "179762739872",
    appId: "1:179762739872:web:fb738a1d3d4276002067c5",
    measurementId: "G-V5G8H60C7G"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Enable persistence
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((error) => {
        console.error('Persistence error:', error);
    });

window.database = firebase.database();
window.auth = firebase.auth();

// Initialize database reference
const applicationsRef = window.database.ref('applications');

// Test database connection
applicationsRef.once('value')
    .then(() => console.log('Database connection successful'))
    .catch(error => console.error('Database connection failed:', error));

// List of authorized admin emails
const AUTHORIZED_EMAILS = [
    'n.dorfman00@gmail.com'  // Add your Google email here
];

// Check if user is authorized
window.isAuthorizedUser = function (email) {
    return AUTHORIZED_EMAILS.includes(email);
} 