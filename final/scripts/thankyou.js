
// Hidden Gems Explorer - Thank You Page JavaScript

import './main.js';

document.addEventListener('DOMContentLoaded', () => {
    initThankYouPageEnhancements();
});

function initThankYouPageEnhancements() {
    displaySubmissionData();
}

function displaySubmissionData() {
    const urlParams = new URLSearchParams(window.location.search);
    let submissionData = {};

    if (urlParams.has('gemName')) {
        submissionData = {
            gemName: urlParams.get('gemName'),
            email: urlParams.get('email'),
            category: urlParams.get('category'),
            location: urlParams.get('location'),
            timestamp: urlParams.get('timestamp') || new Date().toISOString()
        };
    }

    if (submissionData.gemName) {
        populateSubmissionDisplay(submissionData);
    }
}

function populateSubmissionDisplay(data) {
    const container = document.getElementById('submittedData');
    container.innerHTML = `
        <div class="submission-details">
            <h3>Your Submission Details</h3>
            <div class="submission-grid">
                <div class="detail-item">
                    <strong>Hidden Gem Name:</strong>
                    <span>${data.gemName}</span>
                </div>
                <div class="detail-item">
                    <strong>Email:</strong>
                    <span>${data.email}</span>
                </div>
            </div>
        </div>
    `;
}
