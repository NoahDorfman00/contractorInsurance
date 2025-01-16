document.addEventListener('DOMContentLoaded', function () {
    // Wait for Firebase to be ready
    if (!window.firebase || !window.database) {
        console.error('Firebase not initialized');
        return;
    }

    const applicationsGrid = document.querySelector('.applications-grid');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchApplications');

    let applications = [];

    // Load applications from Firebase
    function loadApplications() {
        const applicationsRef = window.database.ref('applications');
        applicationsRef.on('value', (snapshot) => {
            applications = [];
            snapshot.forEach((childSnapshot) => {
                applications.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            // Sort applications by timestamp, newest first
            applications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            renderApplications();
        });
    }

    // Render applications to the grid
    function renderApplications() {
        const filteredApplications = filterApplications();
        applicationsGrid.innerHTML = '';

        filteredApplications.forEach(application => {
            const card = createApplicationCard(application);
            applicationsGrid.appendChild(card);
        });
    }

    // Create an application card
    function createApplicationCard(application) {
        console.log('Timestamp:', application.timestamp);
        // Format date and time
        const applicationDate = new Date(application.timestamp);
        const formattedDateTime = applicationDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'America/New_York'
        });

        const card = document.createElement('div');
        card.className = 'application-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${application.name}</h3>
                <select class="status-select" data-id="${application.id}">
                    <option value="new" ${application.status === 'new' ? 'selected' : ''}>New</option>
                    <option value="contacted" ${application.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="enrolled" ${application.status === 'enrolled' ? 'selected' : ''}>Enrolled</option>
                    <option value="declined" ${application.status === 'declined' ? 'selected' : ''}>Declined</option>
                </select>
            </div>
            <div class="card-body">
                <p><strong>Email:</strong> ${application.email}</p>
                <p><strong>Phone:</strong> ${application.phone}</p>
                <p><strong>Applied:</strong> ${formattedDateTime}</p>
            </div>
            <div class="card-actions">
                <button class="view-details-btn" data-id="${application.id}">View Details</button>
                <button class="send-email-btn" data-id="${application.id}">Send Email</button>
            </div>
        `;

        // Add event listeners
        const statusSelect = card.querySelector('.status-select');
        statusSelect.addEventListener('change', (e) => {
            updateApplicationStatus(application.id, e.target.value);
        });

        const viewDetailsBtn = card.querySelector('.view-details-btn');
        viewDetailsBtn.addEventListener('click', () => {
            showApplicationDetails(application);
        });

        const sendEmailBtn = card.querySelector('.send-email-btn');
        sendEmailBtn.addEventListener('click', () => {
            prepareEmail(application);
        });

        return card;
    }

    // Filter applications based on status and search
    function filterApplications() {
        return applications.filter(app => {
            const matchesStatus = statusFilter.value === 'all' || app.status === statusFilter.value;
            const searchTerm = searchInput.value.toLowerCase();
            const matchesSearch = !searchTerm ||
                app.name.toLowerCase().includes(searchTerm) ||
                app.email.toLowerCase().includes(searchTerm) ||
                app.phone.toLowerCase().includes(searchTerm);
            return matchesStatus && matchesSearch;
        });
    }

    // Update application status
    function updateApplicationStatus(applicationId, newStatus) {
        window.database.ref(`applications/${applicationId}`).update({
            status: newStatus
        });
    }

    // Show application details in a modal
    function showApplicationDetails(application) {
        // Format date and time for modal
        const applicationDate = new Date(application.timestamp);
        const formattedDateTime = applicationDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'America/New_York',
            timeZoneName: 'short'
        });

        // Format how they heard about us
        const hearAboutMap = {
            facebook: 'Facebook',
            instagram: 'Instagram',
            tiktok: 'TikTok',
            family_friend: 'Family/Friend',
            other: 'Other'
        };

        const modal = document.getElementById('applicationModal');
        const modalBody = modal.querySelector('.modal-body');

        modalBody.innerHTML = `
            <div class="detail-group">
                <h3>Basic Information</h3>
                <p><strong>Name:</strong> ${application.name}</p>
                <p><strong>Email:</strong> ${application.email}</p>
                <p><strong>Phone:</strong> ${application.phone}</p>
                <p><strong>Age:</strong> ${application.age || 'N/A'}</p>
                <p><strong>Weight:</strong> ${application.weight ? application.weight + ' lbs' : 'N/A'}</p>
                <p><strong>Occupation:</strong> ${application.occupation || 'N/A'}</p>
                <p><strong>Social Media:</strong> ${application.social || 'N/A'}</p>
                <p><strong>How they heard about us:</strong> ${application.hear_about ? hearAboutMap[application.hear_about] || application.hear_about : 'N/A'}</p>
                <p><strong>Military/First Responder:</strong> ${application.military}</p>
                <p><strong>Applied:</strong> ${formattedDateTime}</p>
            </div>
            <div class="detail-group">
                <h3>Goals & Health Value</h3>
                <p><strong>Goals:</strong></p>
                <p>${application.goals}</p>
                <p><strong>Success Criteria:</strong></p>
                <p>${application.success_criteria}</p>
                <p><strong>Health Value:</strong></p>
                <p>${application.health_value}</p>
            </div>
            <div class="detail-group">
                <h3>Past Experiences</h3>
                <p><strong>Past Attempts:</strong></p>
                <p>${application.past_attempts}</p>
            </div>
            <div class="detail-group">
                <h3>Current Lifestyle</h3>
                <p><strong>Coffee & Energy Drinks:</strong> ${application.coffee_spending || 'N/A'}</p>
                <p><strong>Eating Out:</strong> ${application.eating_out || 'N/A'}</p>
                <p><strong>Alcohol:</strong> ${application.alcohol_spending || 'N/A'}</p>
                <p><strong>Smoking:</strong> ${application.smoking_spending || 'N/A'}</p>
            </div>
            <div class="detail-group">
                <h3>Commitment & Support</h3>
                <p><strong>Motivation Level:</strong> ${application.motivation}/10</p>
                <p><strong>Ready to Invest:</strong> ${application.ready_decision}</p>
                <p><strong>Monthly Investment:</strong> ${application.invest_monthly}</p>
                <p><strong>Spouse Support:</strong> ${application.spouse_support}</p>
            </div>
            <div class="detail-group">
                <h3>Change Assessment</h3>
                <p><strong>Coach Expectations:</strong></p>
                <p>${application.coach_expectations}</p>
                <p><strong>Why They Would Benefit:</strong></p>
                <p>${application.benefit_reason}</p>
                <p><strong>Good About Not Changing:</strong></p>
                <p>${application.good_no_change}</p>
                <p><strong>Bad About Changing:</strong></p>
                <p>${application.bad_change}</p>
                <p><strong>Good About Changing:</strong></p>
                <p>${application.good_change}</p>
                <p><strong>Bad About Not Changing:</strong></p>
                <p>${application.bad_no_change}</p>
                <p><strong>Future Outlook:</strong></p>
                <p>${application.future_outlook}</p>
            </div>
            <div class="detail-group">
                <h3>Next Steps</h3>
                <p><strong>Ready to Move Forward:</strong> ${application.ready_now}</p>
                <p><strong>Start Timeline:</strong> ${application.start_timeline}</p>
                <p><strong>Will Watch Video:</strong> ${application.watch_video}</p>
            </div>
            <div class="detail-group">
                <h3>Application Status</h3>
                <select class="status-select" data-id="${application.id}">
                    <option value="new" ${application.status === 'new' ? 'selected' : ''}>New</option>
                    <option value="contacted" ${application.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="enrolled" ${application.status === 'enrolled' ? 'selected' : ''}>Enrolled</option>
                    <option value="declined" ${application.status === 'declined' ? 'selected' : ''}>Declined</option>
                </select>
            </div>
        `;

        modal.classList.add('active');

        // Close modal when clicking the close button or outside the modal
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.onclick = () => modal.classList.remove('active');

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        };

        // Add event listener for status changes
        const statusSelect = modal.querySelector('.status-select');
        statusSelect.addEventListener('change', (e) => {
            updateApplicationStatus(application.id, e.target.value);
        });
    }

    // Prepare email to applicant
    function prepareEmail(application) {
        // Switch to email tab and populate fields
        const emailTab = document.getElementById('email');
        const applicationsTab = document.getElementById('applications');

        emailTab.classList.add('active');
        applicationsTab.classList.remove('active');

        // Update menu items
        document.querySelector('[data-tab="email"]').classList.add('active');
        document.querySelector('[data-tab="applications"]').classList.remove('active');

        // Scroll to email composer after a short delay
        setTimeout(() => {
            const emailComposer = document.querySelector('.email-composer');
            if (emailComposer) {
                emailComposer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);

        // Switch to single email mode
        const singleEmailButton = document.querySelector('.email-type-selector button[data-type="single"]');
        singleEmailButton.click();

        // Create recipient option value
        const recipientValue = JSON.stringify({
            email: application.email,
            name: application.name,
            id: application.id
        });

        // Populate email fields
        const recipientSelect = document.getElementById('emailRecipient');

        // Check if option already exists
        let optionExists = false;
        for (let option of recipientSelect.options) {
            if (option.value === recipientValue) {
                optionExists = true;
                option.selected = true;
                break;
            }
        }

        // If option doesn't exist, create it
        if (!optionExists) {
            const option = document.createElement('option');
            option.value = recipientValue;
            option.textContent = `${application.name} (${application.email})`;
            option.selected = true;
            recipientSelect.appendChild(option);
        }

        // Select welcome template by default for new applications
        const emailTemplate = document.getElementById('emailTemplate');
        if (application.status === 'new') {
            emailTemplate.value = 'welcome';
            // Trigger the change event to load the template
            emailTemplate.dispatchEvent(new Event('change'));
        }
    }

    // Add event listeners for filtering
    statusFilter.addEventListener('change', renderApplications);
    searchInput.addEventListener('input', renderApplications);

    // Initial load
    loadApplications();
}); 