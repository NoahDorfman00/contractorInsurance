// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB2OGb_aHpI9FOfROJTm2gn4YgdbUyoLW0",
    authDomain: "shapeshift-bc4ae.firebaseapp.com",
    projectId: "shapeshift-bc4ae",
    storageBucket: "shapeshift-bc4ae.firebasestorage.app",
    messagingSenderId: "33652450246",
    appId: "1:33652450246:web:1930a52ba0486300dfc8c7",
    measurementId: "G-5CZP7Y047J"
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