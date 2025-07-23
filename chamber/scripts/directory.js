// Global variables
const membersContainer = document.getElementById('membersContainer');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const hamburger = document.querySelector('.hamburger');
const mainNav = document.querySelector('.main-nav');

let membersData = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    loadMembersData();
});

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
    hamburger.addEventListener('click', toggleMenu);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
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
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
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
    hamburger.classList.remove('active');
    mainNav.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
}

// Load members data from JSON
async function loadMembersData() {
    try {
        const response = await fetch('data/members.json');
        const data = await response.json();
        membersData = data.members;
        displayMembers(membersData, 'grid');
        console.log('Members loaded:', membersData.length);
    } catch (error) {
        console.error('Error loading members data:', error);
        membersContainer.innerHTML = '<p>Error loading member data. Please try again later.</p>';
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

// Create a member card element - VERSÃO CORRIGIDA
function createMemberCard(member, viewType) {
    const card = document.createElement('div');
    card.className = `member-card ${viewType === 'list' ? 'list-view' : ''}`;

    const membershipLevelText = getMembershipLevelText(member.membershipLevel);

    console.log(`Creating card for: ${member.name}, Image: ${member.image}`);

    // Create the basic card structure
    card.innerHTML = `
        <div class="member-image">
            <div class="fallback-icon">🏢</div>
        </div>
        <div class="member-info">
            <h3>${member.name}</h3>
            <div class="member-details">
                <p><strong>Address:</strong> ${member.address}</p>
                <p><strong>Phone:</strong> ${member.phone}</p>
                <p><strong>Website:</strong> <a href="${member.website}" target="_blank">${member.website}</a></p>
                <p><strong>Membership:</strong> <span class="membership-level level-${member.membershipLevel}">${membershipLevelText}</span></p>
            </div>
        </div>
    `;

    // Handle image loading - MÉTODO SIMPLIFICADO
    const imageContainer = card.querySelector('.member-image');
    const fallbackIcon = card.querySelector('.fallback-icon');

    if (member.image) {
        const img = document.createElement('img');
        img.src = `images/${member.image}`;
        img.alt = `${member.name} logo`;
        img.loading = 'lazy';

        // Adicionar estilos diretamente na imagem
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center';
        img.style.borderRadius = '6px';
        img.style.display = 'none'; // Inicialmente escondida

        img.onload = function () {
            console.log(`✅ Image loaded successfully: ${member.image}`);
            fallbackIcon.style.display = 'none';
            img.style.display = 'block';
        };

        img.onerror = function () {
            console.error(`❌ Failed to load image: ${member.image}`);
            console.log(`Full path attempted: images/${member.image}`);
            fallbackIcon.style.display = 'flex';
            img.style.display = 'none';
        };

        // Adicionar a imagem ao container
        imageContainer.appendChild(img);

        // Debug adicional
        console.log(`Image src set to: images/${member.image}`);
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
    gridViewBtn.classList.remove('active');
    listViewBtn.classList.remove('active');

    if (viewType === 'grid') {
        gridViewBtn.classList.add('active');
    } else {
        listViewBtn.classList.add('active');
    }
}

// Update footer with current date
function updateFooter() {
    const currentDate = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const formattedDate = currentDate.toLocaleDateString('en-US', options);

    const footerDate = document.getElementById('currentDate');
    if (footerDate) {
        footerDate.textContent = formattedDate;
    }

    const lastModified = document.getElementById('lastModified');
    if (lastModified) {
        lastModified.textContent = document.lastModified;
    }
}

// Initialize footer
updateFooter();