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
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            age: document.getElementById('age').value,
            weight: document.getElementById('weight').value,
            occupation: document.getElementById('occupation').value,
            social: document.getElementById('social').value,
            hear_about: document.getElementById('hear_about').value,
            military: document.getElementById('military').value,
            goals: document.getElementById('goals').value,
            success_criteria: document.getElementById('success_criteria').value,
            health_value: document.getElementById('health_value').value,
            past_attempts: document.getElementById('past_attempts').value,
            coffee_spending: document.getElementById('coffee_spending').value,
            eating_out: document.getElementById('eating_out').value,
            alcohol_spending: document.getElementById('alcohol_spending').value,
            smoking_spending: document.getElementById('smoking_spending').value,
            motivation: document.getElementById('motivation').value,
            ready_decision: document.getElementById('ready_decision').value,
            invest_monthly: document.getElementById('invest_monthly').value,
            spouse_support: document.getElementById('spouse_support').value,
            coach_expectations: document.getElementById('coach_expectations').value,
            benefit_reason: document.getElementById('benefit_reason').value,
            good_no_change: document.getElementById('good_no_change').value,
            bad_change: document.getElementById('bad_change').value,
            good_change: document.getElementById('good_change').value,
            bad_no_change: document.getElementById('bad_no_change').value,
            future_outlook: document.getElementById('future_outlook').value,
            ready_now: document.getElementById('ready_now').value,
            start_timeline: document.getElementById('start_timeline').value,
            watch_video: document.getElementById('watch_video').value,
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
                    subject: "New Application for ShapeShift Coaching",
                    message: `Hey Matt,
You just received a new application for ShapeShift Coaching.

=== BASIC INFORMATION ===
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Age: ${formData.age}
Weight: ${formData.weight} lbs
Occupation: ${formData.occupation}
Social Media: ${formData.social || 'N/A'}
How they heard about us: ${formData.hear_about || 'N/A'}
Military/First Responder: ${formData.military}

=== GOALS & HEALTH VALUE ===
Goals:
${formData.goals}

Success Criteria:
${formData.success_criteria}

Health Value:
${formData.health_value}

=== PAST EXPERIENCES ===
Past Attempts:
${formData.past_attempts}

=== CURRENT LIFESTYLE ===
Coffee & Energy Drinks: ${formData.coffee_spending}
Eating Out: ${formData.eating_out}
Alcohol: ${formData.alcohol_spending}
Smoking: ${formData.smoking_spending}

=== COMMITMENT & SUPPORT ===
Motivation Level: ${formData.motivation}/10
Ready to Invest: ${formData.ready_decision}
Monthly Investment: ${formData.invest_monthly}
Spouse Support: ${formData.spouse_support}

=== CHANGE ASSESSMENT ===
Coach Expectations:
${formData.coach_expectations}

Why They Would Benefit:
${formData.benefit_reason}

Good About Not Changing:
${formData.good_no_change}

Bad About Changing:
${formData.bad_change}

Good About Changing:
${formData.good_change}

Bad About Not Changing:
${formData.bad_no_change}

Future Outlook:
${formData.future_outlook}

=== NEXT STEPS ===
Ready to Move Forward: ${formData.ready_now}
Start Timeline: ${formData.start_timeline}
Will Watch Video: ${formData.watch_video}`
                }
            );
            console.log('Email sent successfully');

            // Show success message
            showMessage('success', 'Application submitted successfully! We\'ll be in touch soon.');
            document.getElementById('applicationForm').reset();
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            showMessage('error', 'There was an error submitting your application. Please try again.');
        } finally {
            submitButton.classList.remove('loading');
            submitButton.textContent = 'Submit Application';
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