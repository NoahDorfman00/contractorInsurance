document.addEventListener('DOMContentLoaded', function () {
    // Initialize EmailJS
    emailjs.init("WK1jfxvbEvUnYrw7R");

    const emailTypeButtons = document.querySelectorAll('.email-type-selector button');
    const recipientSelector = document.getElementById('recipientSelector');
    const emailTemplate = document.getElementById('emailTemplate');
    const emailSubject = document.getElementById('emailSubject');
    const emailContent = document.getElementById('emailContent');
    const sendEmailBtn = document.getElementById('sendEmail');
    let applications = [];

    // Load applications from Firebase
    function loadApplications() {
        window.database.ref('applications').on('value', (snapshot) => {
            applications = [];
            snapshot.forEach((childSnapshot) => {
                applications.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            // Refresh recipient list when applications change
            loadRecipients();
            updateSelectedCount();
        });
    }

    // Email templates
    const templates = {
        welcome: {
            subject: "Thank you for your insurance estimate request",
            content: `Hi {name},

Thank you for requesting an insurance estimate for {business_name}. We have received your information and will review it shortly.

Our team will analyze your business needs and provide you with a comprehensive insurance quote within 1-2 business days.

If you have any questions in the meantime, please don't hesitate to contact us.

Best regards,
Your Insurance Team`
        },
        quote: {
            subject: "Your Insurance Quote is Ready",
            content: `Hi {name},

Thank you for your patience. We have prepared your insurance quote for {business_name}.

Please review the attached quote and let us know if you have any questions or if you'd like to proceed with the coverage.

We're here to help you make the best decision for your business.

Best regards,
Your Insurance Team`
        },
        followup: {
            subject: "Following Up - Insurance Quote",
            content: `Hi {name},

I hope this email finds you well! I wanted to follow up regarding the insurance quote we provided for {business_name}.

Have you had a chance to review the quote? I'd be happy to answer any questions you may have or discuss the coverage options in more detail.

Please let me know if you'd like to schedule a call to discuss further.

Best regards,
Your Insurance Team`
        }
    };

    // Load applications into recipient selector
    function loadRecipients() {
        const recipientSelect = document.getElementById('emailRecipient');
        recipientSelect.innerHTML = '<option value="">Select Recipient</option>';

        applications.forEach(application => {
            const option = document.createElement('option');
            option.value = JSON.stringify({
                email: application.email,
                name: application.name,
                id: application.id,
                business_name: application.business_name
            });
            option.textContent = `${application.business_name} - ${application.name} (${application.email})`;
            recipientSelect.appendChild(option);
        });
    }

    // Handle template selection
    emailTemplate.addEventListener('change', function () {
        const template = templates[this.value];
        if (template) {
            emailSubject.value = template.subject;
            emailContent.innerHTML = template.content;
        } else {
            emailSubject.value = '';
            emailContent.innerHTML = '';
        }
    });

    // Handle email type selection
    emailTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            emailTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const singleSelect = document.getElementById('emailRecipient');
            const bulkSelect = document.getElementById('bulkRecipientSelector');

            if (button.dataset.type === 'bulk') {
                singleSelect.style.display = 'none';
                bulkSelect.style.display = 'block';
                updateSelectedCount();
            } else {
                singleSelect.style.display = 'block';
                bulkSelect.style.display = 'none';
            }
        });
    });

    // Handle bulk recipient selection
    const statusCheckboxes = document.querySelectorAll('.status-checkboxes input');
    statusCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedCount);
    });

    function updateSelectedCount() {
        const selectedStatuses = Array.from(statusCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        let recipientCount = 0;
        if (applications && applications.length > 0) {
            applications.forEach(app => {
                if (selectedStatuses.includes(app.status)) {
                    recipientCount++;
                }
            });
        }

        document.querySelector('.selected-count span').textContent = recipientCount;
    }

    // Send email
    sendEmailBtn.addEventListener('click', async function () {
        const isBlukEmail = document.querySelector('.email-type-selector button[data-type="bulk"]').classList.contains('active');

        let recipients = [];
        if (isBlukEmail) {
            const selectedStatuses = Array.from(statusCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            if (selectedStatuses.length === 0) {
                alert('Please select at least one status');
                return;
            }

            recipients = applications.filter(app => selectedStatuses.includes(app.status))
                .map(app => ({
                    email: app.email,
                    name: app.name,
                    id: app.id,
                    business_name: app.business_name
                }));

            if (recipients.length === 0) {
                alert('No recipients found with selected status(es)');
                return;
            }
        } else {
            const recipientData = JSON.parse(document.getElementById('emailRecipient').value);
            if (!recipientData) {
                alert('Please select a recipient');
                return;
            }
            recipients = [recipientData];
        }

        // Check if user is authenticated
        if (!window.auth.currentUser) {
            alert('You must be logged in to send emails');
            return;
        }

        try {
            sendEmailBtn.disabled = true;
            sendEmailBtn.textContent = 'Sending...';

            for (const recipient of recipients) {
                const templateParams = {
                    to_email: recipient.email,
                    to_name: recipient.name,
                    subject: emailSubject.value,
                    message: emailContent.innerHTML
                        .replace(/{name}/g, recipient.name)
                        .replace(/{business_name}/g, recipient.business_name)
                };

                // Send email
                await emailjs.send(
                    "service_ce9wlr6",
                    "template_1x0zygs",
                    templateParams
                );

                // Record in Firebase
                const emailRecord = {
                    timestamp: new Date().toISOString(),
                    recipient: recipient.email,
                    subject: emailSubject.value,
                    content: emailContent.innerHTML,
                    applicationId: recipient.id,
                    sentBy: window.auth.currentUser.email
                };

                await window.database.ref('email_history').push(emailRecord);

                // Update status if needed
                const applicationRef = window.database.ref(`applications/${recipient.id}`);
                const snapshot = await applicationRef.once('value');
                const currentStatus = snapshot.val().status;

                if (currentStatus === 'new') {
                    await applicationRef.update({ status: 'contacted' });
                }
            }

            alert(`Email${recipients.length > 1 ? 's' : ''} sent successfully!`);
            loadEmailHistory();
        } catch (error) {
            console.error('Error:', error);
            if (error.message.includes('PERMISSION_DENIED')) {
                alert('Permission denied. Please make sure you are logged in with an authorized account.');
            } else {
                alert('Failed to send email. Please try again. Error: ' + error.message);
            }
        } finally {
            sendEmailBtn.disabled = false;
            sendEmailBtn.textContent = 'Send Email';
        }
    });

    // Load and display email history
    function loadEmailHistory() {
        const historyList = document.querySelector('.email-history-list');
        window.database.ref('email_history').orderByChild('timestamp').limitToLast(10).on('value', (snapshot) => {
            const history = [];
            snapshot.forEach((childSnapshot) => {
                history.unshift({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            historyList.innerHTML = history.map(email => `
                <div class="email-history-item">
                    <div class="email-history-header">
                        <span class="email-recipient">${email.recipient}</span>
                        <span class="email-date">${new Date(email.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="email-subject">${email.subject}</div>
                    <div class="email-content">${email.content}</div>
                </div>
            `).join('');
        });
    }

    // Initialize
    loadApplications();
    loadEmailHistory();
}); 