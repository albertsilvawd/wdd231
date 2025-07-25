// Thank You Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Set last modified date in footer
    const lastModified = document.getElementById('lastModified');
    if (lastModified) {
        lastModified.textContent = document.lastModified;
    }

    // Set current year in footer
    const currentYear = document.getElementById('currentYear');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Hamburger menu functionality
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.querySelector('.main-nav');

    if (hamburger && mainNav) {
        hamburger.addEventListener('click', function () {
            mainNav.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Display form data from URL parameters
    displayFormData();
});

function displayFormData() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    // Display each form field
    const fields = [
        { param: 'first-name', elementId: 'display-first-name' },
        { param: 'last-name', elementId: 'display-last-name' },
        { param: 'email', elementId: 'display-email' },
        { param: 'phone', elementId: 'display-phone' },
        { param: 'business', elementId: 'display-business' },
        { param: 'membership', elementId: 'display-membership' },
        { param: 'timestamp', elementId: 'display-timestamp' }
    ];

    fields.forEach(field => {
        const value = urlParams.get(field.param);
        const element = document.getElementById(field.elementId);

        if (element) {
            if (field.param === 'timestamp' && value) {
                // Format timestamp for better readability
                const date = new Date(value);
                element.textContent = date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } else if (field.param === 'membership' && value) {
                // Capitalize membership level
                element.textContent = value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            } else {
                element.textContent = value || '-';
            }
        }
    });
}