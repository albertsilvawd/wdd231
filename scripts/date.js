// Date functionality for footer
document.addEventListener('DOMContentLoaded', function () {
    // Get current year and display it
    const currentYear = new Date().getFullYear();
    const currentYearElement = document.getElementById('currentyear');

    if (currentYearElement) {
        currentYearElement.textContent = currentYear;
    }

    // Get document last modified date and display it
    const lastModified = document.lastModified;
    const lastModifiedElement = document.getElementById('lastModified');

    if (lastModifiedElement) {
        lastModifiedElement.textContent = `Last Modified: ${lastModified}`;
    }

    // Log the dates for debugging (optional)
    console.log('Current Year:', currentYear);
    console.log('Last Modified:', lastModified);
});