function populateApplicationDetails(application) {
    // Basic Information
    document.querySelector('.detail-name').textContent = application.name || 'N/A';
    document.querySelector('.detail-email').textContent = application.email || 'N/A';
    document.querySelector('.detail-phone').textContent = application.phone || 'N/A';
    document.querySelector('.detail-hear-about').textContent = application.hear_about || 'N/A';
    document.querySelector('.detail-military').textContent = application.military || 'N/A';

    // Goals & Health Value
    document.querySelector('.detail-goals').textContent = application.goals || 'N/A';
    document.querySelector('.detail-success-criteria').textContent = application.success_criteria || 'N/A';
    document.querySelector('.detail-health-value').textContent = application.health_value || 'N/A';

    // Past Experiences
    document.querySelector('.detail-past-attempts').textContent = application.past_attempts || 'N/A';

    // Current Lifestyle & Spending
    document.querySelector('.detail-coffee-spending').textContent = application.coffee_spending || 'N/A';
    document.querySelector('.detail-eating-out').textContent = application.eating_out || 'N/A';
    document.querySelector('.detail-alcohol-spending').textContent = application.alcohol_spending || 'N/A';
    document.querySelector('.detail-smoking-spending').textContent = application.smoking_spending || 'N/A';

    // Commitment & Support
    document.querySelector('.detail-motivation').textContent = application.motivation || 'N/A';
    document.querySelector('.detail-ready-decision').textContent = application.ready_decision || 'N/A';
    document.querySelector('.detail-invest-monthly').textContent = application.invest_monthly || 'N/A';
    document.querySelector('.detail-spouse-support').textContent = application.spouse_support || 'N/A';

    // Change Assessment
    document.querySelector('.detail-coach-expectations').textContent = application.coach_expectations || 'N/A';
    document.querySelector('.detail-benefit-reason').textContent = application.benefit_reason || 'N/A';
    document.querySelector('.detail-good-no-change').textContent = application.good_no_change || 'N/A';
    document.querySelector('.detail-bad-change').textContent = application.bad_change || 'N/A';
    document.querySelector('.detail-good-change').textContent = application.good_change || 'N/A';
    document.querySelector('.detail-bad-no-change').textContent = application.bad_no_change || 'N/A';
    document.querySelector('.detail-future-outlook').textContent = application.future_outlook || 'N/A';

    // Next Steps
    document.querySelector('.detail-ready-now').textContent = application.ready_now || 'N/A';
    document.querySelector('.detail-start-timeline').textContent = application.start_timeline || 'N/A';
    document.querySelector('.detail-watch-video').textContent = application.watch_video || 'N/A';

    // Status
    const statusSelect = document.querySelector('.status-select');
    statusSelect.value = application.status || 'new';

    // Store the application ID for status updates
    statusSelect.dataset.applicationId = application.id;
}

function createApplicationCard(application) {
    const card = document.createElement('div');
    card.className = 'application-card';
    card.innerHTML = `
        <div class="card-header">
            <h3>${application.name}</h3>
            <select class="status-select" data-application-id="${application.id}">
                <option value="new" ${application.status === 'new' ? 'selected' : ''}>New</option>
                <option value="contacted" ${application.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                <option value="enrolled" ${application.status === 'enrolled' ? 'selected' : ''}>Enrolled</option>
                <option value="declined" ${application.status === 'declined' ? 'selected' : ''}>Declined</option>
            </select>
        </div>
        <div class="card-body">
            <p><strong>Email:</strong> ${application.email}</p>
            <p><strong>Phone:</strong> ${application.phone}</p>
            <p><strong>Goals:</strong> ${truncateText(application.goals, 100)}</p>
            <p><strong>Motivation Level:</strong> ${application.motivation}/10</p>
            <p><strong>Ready to Invest:</strong> ${application.invest_monthly}</p>
        </div>
        <div class="card-actions">
            <button class="view-details-btn" data-application-id="${application.id}">View Details</button>
            <button class="send-email-btn" data-application-id="${application.id}">Send Email</button>
        </div>
    `;
    return card;
}

function truncateText(text, maxLength) {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
// ... rest of the existing code ... 