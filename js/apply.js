// Wait for both Firebase and EmailJS to be ready
function waitForDependencies() {
    return new Promise((resolve, reject) => {
        if (window.firebase && window.database && window.emailjs) {
            resolve();
        } else {
            const timeout = setTimeout(() => {
                reject(new Error('Dependencies initialization timeout'));
            }, 5000); // 5 second timeout

            const checkDependencies = setInterval(() => {
                if (window.firebase && window.database && window.emailjs) {
                    clearInterval(checkDependencies);
                    clearTimeout(timeout);
                    resolve();
                }
            }, 100);
        }
    });
}

// Initialize EmailJS
emailjs.init("WK1jfxvbEvUnYrw7R");

// Wait for Firebase to be ready
function waitForFirebase() {
    return new Promise((resolve, reject) => {
        if (window.firebase && window.database) {
            resolve();
        } else {
            const timeout = setTimeout(() => {
                reject(new Error('Firebase initialization timeout'));
            }, 5000); // 5 second timeout

            const checkFirebase = setInterval(() => {
                if (window.firebase && window.database) {
                    clearInterval(checkFirebase);
                    clearTimeout(timeout);
                    resolve();
                }
            }, 100);
        }
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    try {
        await waitForDependencies();
        console.log('All dependencies are ready');
    } catch (error) {
        console.error('Dependencies initialization failed:', error);
        return;
    }

    try {
        await waitForFirebase();
        console.log('Firebase is ready');
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        return;
    }

    const form = document.getElementById('applicationForm');
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        console.log('Form submitted');

        // Check if Firebase is initialized
        if (!window.firebase || !window.database) {
            console.error('Firebase not initialized:', { firebase: window.firebase, database: window.database });
            showMessage('error', 'System is not ready. Please refresh the page.');
            return;
        }

        const submitButton = document.querySelector('.submit-button');
        submitButton.classList.add('loading');
        submitButton.textContent = 'Submitting...';

        // Get form data
        const formData = {
            // Business Information
            business_name: document.getElementById('business_name').value,
            business_type: document.getElementById('business_type').value,
            years_in_business: document.getElementById('years_in_business').value,
            annual_revenue: document.getElementById('annual_revenue').value,

            // Contact Information
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            business_address: document.getElementById('business_address').value,

            // Coverage Details
            employees: document.getElementById('employees').value,
            equipment_value: document.getElementById('equipment_value').value,
            coverage_needs: Array.from(document.querySelectorAll('input[name="coverage_needs"]:checked')).map(cb => cb.value),

            // Additional Information
            previous_claims: document.getElementById('previous_claims').value,
            claims_details: document.getElementById('claims_details').value,
            additional_info: document.getElementById('additional_info').value,

            timestamp: new Date().toISOString(),
            status: 'new'
        };
        console.log('Form data:', formData);

        try {
            // Save to Firebase
            console.log('Attempting to save to Firebase...');
            const newApplicationRef = window.database.ref('applications').push();
            await newApplicationRef.set(formData);
            console.log('Saved to Firebase successfully');

            // Send email notification
            console.log('Attempting to send email...');
            await emailjs.send(
                "service_ce9wlr6",
                "template_1x0zygs",
                {
                    to_email: "n.dorfman00@gmail.com",
                    subject: "New Insurance Estimate Request",
                    message: `New insurance estimate request received!

=== BUSINESS INFORMATION ===
Business Name: ${formData.business_name}
Business Type: ${formData.business_type}
Years in Business: ${formData.years_in_business}
Annual Revenue: ${formData.annual_revenue}

=== CONTACT INFORMATION ===
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Business Address: ${formData.business_address}

=== COVERAGE DETAILS ===
Number of Employees: ${formData.employees}
Equipment Value: ${formData.equipment_value}
Coverage Needs: ${formData.coverage_needs.join(', ')}

=== ADDITIONAL INFORMATION ===
Previous Claims: ${formData.previous_claims}
Claims Details: ${formData.claims_details || 'N/A'}
Additional Information: ${formData.additional_info || 'N/A'}

Timestamp: ${formData.timestamp}`
                }
            );
            console.log('Email sent successfully');

            // Show success message
            showMessage('success', 'Your estimate request has been submitted successfully! We\'ll be in touch soon.');
            document.getElementById('applicationForm').reset();
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            showMessage('error', 'There was an error submitting your request. Please try again.');
        } finally {
            submitButton.classList.remove('loading');
            submitButton.textContent = 'Get Your Estimate';
        }
    });
});

function showMessage(type, message) {
    console.log('Showing message:', { type, message });
    const messageElement = document.createElement('div');
    messageElement.className = `${type}-message`;
    messageElement.textContent = message;

    const form = document.getElementById('applicationForm');
    form.parentNode.insertBefore(messageElement, form.nextSibling);

    setTimeout(() => {
        messageElement.remove();
    }, 5000);
} 