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
                <h3>${application.business_name}</h3>
                <select class="status-select" data-id="${application.id}">
                    <option value="new" ${application.status === 'new' ? 'selected' : ''}>New</option>
                    <option value="contacted" ${application.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="quoted" ${application.status === 'quoted' ? 'selected' : ''}>Quoted</option>
                    <option value="declined" ${application.status === 'declined' ? 'selected' : ''}>Declined</option>
                </select>
            </div>
            <div class="card-body">
                <p><strong>Contact:</strong> ${application.name}</p>
                <p><strong>Email:</strong> ${application.email}</p>
                <p><strong>Phone:</strong> ${application.phone}</p>
                <p><strong>Business Type:</strong> ${application.business_type}</p>
                <p><strong>Submitted:</strong> ${formattedDateTime}</p>
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
                app.business_name.toLowerCase().includes(searchTerm) ||
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

        const modal = document.getElementById('applicationModal');
        const modalBody = modal.querySelector('.modal-body');

        modalBody.innerHTML = `
            <div class="detail-group">
                <h3>Business Information</h3>
                <p><strong>Business Name:</strong> ${application.business_name}</p>
                <p><strong>Business Type:</strong> ${application.business_type}</p>
                <p><strong>Years in Business:</strong> ${application.years_in_business}</p>
                <p><strong>Annual Revenue:</strong> ${application.annual_revenue}</p>
            </div>
            <div class="detail-group">
                <h3>Contact Information</h3>
                <p><strong>Name:</strong> ${application.name}</p>
                <p><strong>Email:</strong> ${application.email}</p>
                <p><strong>Phone:</strong> ${application.phone}</p>
                <p><strong>Business Address:</strong> ${application.business_address}</p>
                <p><strong>Submitted:</strong> ${formattedDateTime}</p>
            </div>
            <div class="detail-group">
                <h3>Coverage Details</h3>
                <p><strong>Number of Employees:</strong> ${application.employees}</p>
                <p><strong>Equipment Value:</strong> ${application.equipment_value}</p>
                <p><strong>Coverage Needs:</strong> ${application.coverage_needs.join(', ')}</p>
            </div>
            <div class="detail-group">
                <h3>Additional Information</h3>
                <p><strong>Previous Claims:</strong> ${application.previous_claims}</p>
                <p><strong>Claims Details:</strong> ${application.claims_details || 'N/A'}</p>
                <p><strong>Additional Information:</strong> ${application.additional_info || 'N/A'}</p>
            </div>
            <div class="detail-group">
                <h3>Estimate Status</h3>
                <select class="status-select" data-id="${application.id}">
                    <option value="new" ${application.status === 'new' ? 'selected' : ''}>New</option>
                    <option value="contacted" ${application.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="quoted" ${application.status === 'quoted' ? 'selected' : ''}>Quoted</option>
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
        document.querySelector('[data-tab="applications"]').classList.remove('active');
        document.querySelector('[data-tab="email"]').classList.add('active');

        // Set recipient
        const recipientSelect = document.getElementById('emailRecipient');
        recipientSelect.value = application.id;

        // Set default subject and content based on status
        const subjectInput = document.getElementById('emailSubject');
        const contentEditor = document.getElementById('emailContent');

        if (application.status === 'new') {
            subjectInput.value = `Thank you for your insurance estimate request - ${application.business_name}`;
            contentEditor.innerHTML = `
                <p>Dear ${application.name},</p>
                <p>Thank you for requesting an insurance estimate for ${application.business_name}. We have received your information and will review it shortly.</p>
                <p>Our team will analyze your business needs and provide you with a comprehensive insurance quote within 1-2 business days.</p>
                <p>If you have any questions in the meantime, please don't hesitate to contact us.</p>
                <p>Best regards,<br>Your Insurance Team</p>
            `;
        } else if (application.status === 'quoted') {
            subjectInput.value = `Your Insurance Quote - ${application.business_name}`;
            contentEditor.innerHTML = `
                <p>Dear ${application.name},</p>
                <p>Thank you for your patience. We have prepared your insurance quote for ${application.business_name}.</p>
                <p>Please review the attached quote and let us know if you have any questions or if you'd like to proceed with the coverage.</p>
                <p>We're here to help you make the best decision for your business.</p>
                <p>Best regards,<br>Your Insurance Team</p>
            `;
        }
    }

    // Initialize
    loadApplications();

    // Add event listeners for filtering
    statusFilter.addEventListener('change', renderApplications);
    searchInput.addEventListener('input', renderApplications);
}); 