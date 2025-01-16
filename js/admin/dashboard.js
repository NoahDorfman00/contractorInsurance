document.addEventListener('DOMContentLoaded', function () {
    const loadingOverlay = document.getElementById('loadingOverlay');

    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    // Wait for Firebase to be initialized
    if (!window.firebase || !window.auth) {
        console.error('Firebase is not initialized');
        window.location.href = 'login.html';
        return;
    }

    // Check if we're on the dashboard page
    if (window.location.pathname.includes('dashboard.html')) {
        showLoading();
        // Check authentication state
        auth.onAuthStateChanged(function (user) {
            if (!user) {
                // Not logged in
                window.location.href = 'login.html';
                return;
            }

            if (!isAuthorizedUser(user.email)) {
                // Not authorized
                auth.signOut().then(() => {
                    window.location.href = 'login.html';
                });
                return;
            }

            // User is logged in and authorized
            initializeDashboard(user);
            hideLoading();
        });
    }

    function initializeDashboard(user) {
        // Display user email
        const userEmailElement = document.getElementById('userEmail');
        userEmailElement.textContent = user.email;

        // Handle sign out
        const signOutBtn = document.getElementById('signOut');
        signOutBtn.addEventListener('click', function () {
            auth.signOut().then(() => {
                window.location.href = 'login.html';
            }).catch((error) => {
                console.error('Error signing out:', error);
            });
        });

        // Handle tab switching
        document.querySelectorAll('.admin-menu li').forEach(item => {
            item.addEventListener('click', () => {
                // Update menu items
                document.querySelectorAll('.admin-menu li').forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Update tab content
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                const tabId = item.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');

                // If switching to email tab, scroll to email composer after a short delay
                if (tabId === 'email') {
                    setTimeout(() => {
                        const emailComposer = document.querySelector('.email-composer');
                        if (emailComposer) {
                            emailComposer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 100);
                }
            });
        });
    }
}); 