// Navigation functionality for responsive hamburger menu
document.addEventListener('DOMContentLoaded', function () {
    // Get hamburger button and navigation menu
    const hamburger = document.querySelector('.hamburger');
    const navigation = document.querySelector('.navigation');

    // Add click event listener to hamburger button
    hamburger.addEventListener('click', function () {
        // Toggle the 'show' class on navigation menu
        navigation.classList.toggle('show');

        // Toggle the 'active' class on hamburger for animation
        hamburger.classList.toggle('active');

        // Update aria-expanded attribute for accessibility
        const isExpanded = navigation.classList.contains('show');
        hamburger.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking on navigation links (mobile)
    const navLinks = document.querySelectorAll('.navigation a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            // Only close menu on mobile screens
            if (window.innerWidth < 768) {
                navigation.classList.remove('show');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Close menu when window is resized to larger screen
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 768) {
            navigation.classList.remove('show');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    // Initialize accessibility attributes
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-controls', 'navigation');

    // Add wayfinding - highlight current page
    const currentPath = window.location.pathname;
    const navigationLinks = document.querySelectorAll('.navigation a');

    navigationLinks.forEach(link => {
        // Remove active class from all links
        link.classList.remove('active');

        // Add active class to current page link
        if (link.getAttribute('href') === currentPath ||
            (currentPath === '/' && link.getAttribute('href') === '#')) {
            link.classList.add('active');
        }
    });
});