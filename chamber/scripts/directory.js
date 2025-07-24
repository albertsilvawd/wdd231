// Global variables
const membersContainer = document.getElementById('membersContainer');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const hamburger = document.querySelector('.hamburger');
const mainNav = document.querySelector('.main-nav');

let membersData = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Directory page initializing...');
    setupEventListeners();
    loadMembersData();
});

// Setup event listeners
function setupEventListeners() {
    // View toggle buttons
    if (gridViewBtn && listViewBtn) {
        gridViewBtn.addEventListener('click', () => {
            setActiveView('grid');
            displayMembers(membersData, 'grid');
        });

        listViewBtn.addEventListener('click', () => {
            setActiveView('list');
            displayMembers(membersData, 'list');
        });
    }

    // Hamburger menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (hamburger && mainNav && !hamburger.contains(e.target) && !mainNav.contains(e.target)) {
            closeMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });

    // Close menu when clicking on nav links
    if (mainNav) {
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
}

// Toggle hamburger menu
function toggleMenu() {
    const isOpen = hamburger.classList.contains('active');
    if (isOpen) {
        closeMenu();
    } else {
        openMenu();
    }
}

// Open menu
function openMenu() {
    hamburger.classList.add('active');
    mainNav.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
}

// Close menu
function closeMenu() {
    if (hamburger && mainNav) {
        hamburger.classList.remove('active');
        mainNav.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }
}

// Load members data from JSON - simplified
async function loadMembersData() {
    try {
        console.log('Loading members data...');
        const response = await fetch('data/members.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        membersData = data.members;
        displayMembers(membersData, 'grid');
        console.log('✅ Members loaded successfully:', membersData.length);
    } catch (error) {
        console.error('❌ Error loading members data:', error);
        if (membersContainer) {
            membersContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-color);">
                    <p>Error loading member data. Please try again later.</p>
                </div>
            `;
        }
    }
}

// Display members in the specified view
function displayMembers(members, viewType) {
    if (!membersContainer) return;

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

    console.log(`Displayed ${members.length} members in ${viewType} view`);
}

// Create a member card element - igual ao Home
function createMemberCard(member, viewType) {
    const card = document.createElement('div');
    card.className = `member-card ${viewType === 'list' ? 'list-view' : ''}`;

    const membershipLevelText = getMembershipLevelText(member.membershipLevel);

    console.log(`Creating card for: ${member.name}, Image: ${member.image}`);

    // Create the basic card structure with badge ONLY in image (like Home)
    card.innerHTML = `
        <div class="member-image">
            <div class="membership-badge level-${member.membershipLevel}">${membershipLevelText}</div>
            <div class="fallback-icon">🏢</div>
        </div>
        <div class="member-info">
            <h3>${member.name}</h3>
            <div class="member-details">
                <p><strong>Address:</strong> ${member.address}</p>
                <p><strong>Phone:</strong> ${member.phone}</p>
                <p><strong>Website:</strong> <a href="${member.website}" target="_blank" rel="noopener">${member.website}</a></p>
                <p><strong>Industry:</strong> ${member.industry || 'Business'}</p>
            </div>
        </div>
    `;

    // Handle image loading - improved approach
    const imageContainer = card.querySelector('.member-image');
    const fallbackIcon = card.querySelector('.fallback-icon');

    if (member.image && imageContainer && fallbackIcon) {
        const img = document.createElement('img');
        img.src = `images/${member.image}`;
        img.alt = `${member.name} logo`;
        img.loading = 'eager';

        // Remove inline styles - let CSS handle it
        img.className = 'member-card-image';

        img.onload = function () {
            console.log(`✅ Image loaded successfully: ${member.image}`);
            fallbackIcon.style.display = 'none';
            img.style.display = 'block';
        };

        img.onerror = function () {
            console.error(`❌ Failed to load image: ${member.image}`);
            fallbackIcon.style.display = 'flex';
            img.style.display = 'none';
        };

        // Add the image to container
        imageContainer.appendChild(img);

        // Ensure image loads properly
        if (img.complete && img.naturalHeight !== 0) {
            img.onload();
        }
    }

    return card;
}

// Get membership level text
function getMembershipLevelText(level) {
    switch (level) {
        case 1:
            return 'Member';
        case 2:
            return 'Silver';
        case 3:
            return 'Gold';
        default:
            return 'Member';
    }
}

// Set active view button
function setActiveView(viewType) {
    if (gridViewBtn && listViewBtn) {
        gridViewBtn.classList.remove('active');
        listViewBtn.classList.remove('active');

        if (viewType === 'grid') {
            gridViewBtn.classList.add('active');
        } else {
            listViewBtn.classList.add('active');
        }
    }
}

// Update footer with current date
function updateFooter() {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);

        const currentYearElement = document.getElementById('currentYear');
        if (currentYearElement) {
            currentYearElement.textContent = currentYear;
        }

        const footerDate = document.getElementById('currentDate');
        if (footerDate) {
            footerDate.textContent = formattedDate;
        }

        const lastModified = document.getElementById('lastModified');
        if (lastModified) {
            lastModified.textContent = document.lastModified;
        }

        console.log('Footer updated with current date');
    } catch (error) {
        console.error('Error updating footer:', error);
    }
}

// Initialize footer
updateFooter();

console.log('Directory page script loaded successfully');