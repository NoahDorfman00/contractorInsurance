document.addEventListener('DOMContentLoaded', function () {
    // Wait for Firebase to be initialized
    if (!window.firebase) {
        showError('Firebase is not initialized. Please refresh the page.');
        return;
    }

    // Check if we're already on the login page
    if (window.location.pathname.includes('login.html')) {
        // Check if user is already logged in
        auth.onAuthStateChanged(function (user) {
            if (user && isAuthorizedUser(user.email)) {
                window.location.href = 'dashboard.html';
            }
        });
    }

    // Google Sign In
    const googleSignInBtn = document.getElementById('googleSignIn');
    googleSignInBtn.addEventListener('click', function () {
        if (!window.firebase || !firebase.auth) {
            showError('Authentication is not ready. Please refresh the page.');
            return;
        }

        const provider = new firebase.auth.GoogleAuthProvider();

        // Clear any existing errors
        const errorDiv = document.getElementById('loginError');
        errorDiv.style.display = 'none';

        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                if (isAuthorizedUser(user.email)) {
                    window.location.href = 'dashboard.html';
                } else {
                    auth.signOut().then(() => {
                        showError('You are not authorized to access this area.');
                    });
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                if (error.code === 'auth/operation-not-supported-in-this-environment') {
                    showError('Please access this page through a web server (http/https).');
                } else if (error.code === 'auth/popup-blocked') {
                    showError('Please allow popups for this site to sign in.');
                } else {
                    showError('Failed to sign in. Please try again. ' + error.message);
                }
            });
    });

    function showError(message) {
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}); 