// Global variables
const membersContainer = document.getElementById('membersContainer');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const hamburger = document.querySelector('.hamburger');
const mainNav = document.querySelector('.main-nav');

let membersData = [];
let currentView = 'grid';

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    loadMembers();
    setupEventListeners();
    updateFooterDates();
});

// Load members data from JSON file
async function loadMembers() {
    try {
        const response = await fetch('data/members.json');
        const data = await response.json();
        membersData = data.members;
        displayMembers(membersData, currentView);
    } catch (error) {
        console.error('Error loading members data:', error);
        displayErrorMessage();
    }
}

// Display members in the specified view
function displayMembers(members, viewType) {
    membersContainer.innerHTML = '';

    // Update container class
    if (viewType === 'grid') {
        membersContainer.className = 'members-grid';
    } else {
        membersContainer.className = 'members-list';
    }

    members.forEach(member => {
        const memberCard = createMemberCard(member, viewType);
        membersContainer.appendChild(memberCard);
    });
}

// Create a member card element
function createMemberCard(member, viewType) {
    const card = document.createElement('div');
    card.className = `member-card ${viewType === 'list' ? 'list-view' : ''}`;

    const membershipLevelText = getMembershipLevelText(member.membershipLevel);
    const membershipClass = getMembershipLevelClass(member.membershipLevel);

    if (viewType === 'grid') {
        card.innerHTML = `
            <div class="membership-level ${membershipClass}">${membershipLevelText}</div>
            <div class="member-image">🏢</div>
            <div class="member-info">
                <h3>${member.name}</h3>
                <p class="industry">${member.industry}</p>
                <p class="description">${member.description}</p>
                <p class="address">📍 ${member.address}</p>
                <p class="phone">📞 ${member.phone}</p>
                <div class="website">
                    <a href="${member.website}" target="_blank" rel="noopener">Visit Website</a>
                </div>
            </div>
        `;
    } else {
        card.innerHTML = `
            <div class="member-image">🏢</div>
            <div class="member-content">
                <div class="member-info">
                    <h3>${member.name}</h3>
                    <p>${member.industry}</p>
                </div>
                <div class="member-contact">
                    <p>${member.phone}</p>
                </div>
                <div class="member-address">
                    <p>${member.address.split(',')[0]}</p>
                </div>
                <div class="member-level">
                    <span class="membership-level ${membershipClass}">${membershipLevelText}</span>
                </div>
            </div>
        `;
    }

    return card;
}

// Get membership level text
function getMembershipLevelText(level) {
    switch (level) {
        case 1: return 'Member';
        case 2: return 'Silver';
        case 3: return 'Gold';
        default: return 'Member';
    }
}

// Get membership level CSS class
function getMembershipLevelClass(level) {
    switch (level) {
        case 1: return 'member';
        case 2: return 'silver';
        case 3: return 'gold';
        default: return 'member';
    }
}

// Setup event listeners
function setupEventListeners() {
    // View toggle buttons
    gridViewBtn.addEventListener('click', () => {
        setActiveView('grid');
        displayMembers(membersData, 'grid');
    });

    listViewBtn.addEventListener('click', () => {
        setActiveView('list');
        displayMembers(membersData, 'list');
    });

    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mainNav.contains(e.target) && !hamburger.contains(e.target)) {
            mainNav.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// Set active view button
function setActiveView(view) {
    currentView = view;

    // Remove active class from all buttons
    gridViewBtn.classList.remove('active');
    listViewBtn.classList.remove('active');

    // Add active class to selected button
    if (view === 'grid') {
        gridViewBtn.classList.add('active');
    } else {
        listViewBtn.classList.add('active');
    }
}

// Display error message if data fails to load
function displayErrorMessage() {
    membersContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #ef4444;">
            <h3>Unable to load member data</h3>
            <p>Please try refreshing the page or contact support if the problem persists.</p>
        </div>
    `;
}

// Update footer dates
function updateFooterDates() {
    // Current year
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Last modified date
    const lastModifiedElement = document.getElementById('lastModified');
    if (lastModifiedElement) {
        lastModifiedElement.textContent = document.lastModified;
    }
}

// Responsive behavior for window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        mainNav.classList.remove('active');
        hamburger.classList.remove('active');
    }
});