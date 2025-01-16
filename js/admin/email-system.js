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
            subject: "Welcome to ShapeShift Coaching!",
            content: `Hi {name},

Thank you for applying to ShapeShift Coaching! I'm excited to help you on your transformation journey.

I've reviewed your application and would love to schedule a consultation call to discuss your goals in detail.

Please click the link below to schedule your FREE consultation:
[Insert Calendly Link]

Looking forward to speaking with you!

Best regards,
Coach Matt`
        },
        followup: {
            subject: "Following Up - ShapeShift Coaching Application",
            content: `Hi {name},

I hope this email finds you well! I noticed you recently applied to ShapeShift Coaching, and I wanted to follow up.

I'd love to learn more about your goals and discuss how we can work together to achieve them.

Would you be interested in scheduling a quick consultation call?

Please click here to schedule: [Insert Calendly Link]

Best regards,
Coach Matt`
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
                id: application.id
            });
            option.textContent = `${application.name} (${application.email})`;
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
                    id: app.id
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
                    message: emailContent.innerHTML.replace('{name}', recipient.name)
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
                </div>
            `).join('');
        });
    }

    // Initial load
    loadApplications();
    loadRecipients();
    loadEmailHistory();
}); 