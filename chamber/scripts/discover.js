// Discover Page JavaScript - Standalone Version
document.addEventListener('DOMContentLoaded', function () {
    console.log('🎭 Discover Buenos Aires page loading...');

    // Initialize all components
    initializeHamburgerMenu();
    initializeVisitMessage();
    loadAttractions();
    updateFooter();
});

// Hamburger menu functionality
function initializeHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mainNav = document.querySelector('.main-nav');

    if (hamburger && mainNav) {
        hamburger.addEventListener('click', function () {
            const isOpen = hamburger.classList.contains('active');

            if (isOpen) {
                hamburger.classList.remove('active');
                mainNav.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            } else {
                hamburger.classList.add('active');
                mainNav.classList.add('active');
                hamburger.setAttribute('aria-expanded', 'true');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
                hamburger.classList.remove('active');
                mainNav.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                hamburger.classList.remove('active');
                mainNav.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });

        // Close menu when clicking on nav links
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                mainNav.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });

        console.log('✅ Hamburger menu initialized');
    }
}

// Visit message functionality using localStorage
function initializeVisitMessage() {
    const visitMessageContainer = document.getElementById('visitMessage');
    if (!visitMessageContainer) {
        console.warn('Visit message container not found');
        return;
    }

    try {
        const lastVisit = localStorage.getItem('chamberLastVisit');
        const currentVisit = Date.now();
        let message = '';
        let messageClass = '';

        if (!lastVisit) {
            // First visit
            message = "Welcome! Let us know if you have any questions.";
            messageClass = 'first-visit';
        } else {
            const daysBetween = Math.floor((currentVisit - parseInt(lastVisit)) / (1000 * 60 * 60 * 24));

            if (daysBetween < 1) {
                // Less than a day
                message = "Back so soon! Awesome!";
                messageClass = 'recent-visit';
            } else if (daysBetween === 1) {
                // Exactly 1 day
                message = "You last visited 1 day ago.";
                messageClass = '';
            } else {
                // More than 1 day
                message = `You last visited ${daysBetween} days ago.`;
                messageClass = '';
            }
        }

        // Display message
        visitMessageContainer.innerHTML = message;
        visitMessageContainer.className = `visit-message ${messageClass}`;

        // Store current visit
        localStorage.setItem('chamberLastVisit', currentVisit.toString());

        console.log(`✅ Visit message: ${message}`);
    } catch (error) {
        console.error('❌ Error in visit message:', error);
        visitMessageContainer.innerHTML = "Welcome to Buenos Aires!";
        visitMessageContainer.className = 'visit-message';
    }
}

// Load attractions from JSON with better error handling
async function loadAttractions() {
    const attractionsGrid = document.getElementById('attractionsGrid');
    if (!attractionsGrid) {
        console.warn('Attractions grid container not found');
        showFallbackAttractions();
        return;
    }

    try {
        // Show loading state
        attractionsGrid.innerHTML = '<div class="loading">Loading Buenos Aires attractions...</div>';

        console.log('📡 Attempting to load attractions data...');

        const response = await fetch('data/attractions.json');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Cannot load attractions data`);
        }

        const data = await response.json();
        console.log('📊 Attractions data loaded successfully');

        if (!data.attractions || !Array.isArray(data.attractions)) {
            throw new Error('Invalid attractions data format');
        }

        const attractions = data.attractions;
        console.log(`📍 Found ${attractions.length} attractions`);

        // Clear loading state
        attractionsGrid.innerHTML = '';

        // Create cards for each attraction
        attractions.forEach((attraction, index) => {
            console.log(`🏛️ Creating card ${index + 1}: ${attraction.name}`);
            const card = createAttractionCard(attraction);
            attractionsGrid.appendChild(card);
        });

        console.log('✅ All attraction cards created successfully');

    } catch (error) {
        console.error('❌ Error loading attractions:', error);
        showFallbackAttractions();
    }
}

// Fallback attractions if JSON file doesn't exist or fails
function showFallbackAttractions() {
    const attractionsGrid = document.getElementById('attractionsGrid');
    if (!attractionsGrid) return;

    console.log('🔄 Loading fallback attractions...');

    const fallbackAttractions = [
        {
            name: "Teatro Colón",
            address: "Cerrito 628, Buenos Aires, Argentina",
            description: "World-renowned opera house and concert hall, considered one of the finest in the world for its exceptional acoustics and stunning Belle Époque architecture.",
            image: "teatro-colon.webp",
            category: "Culture"
        },
        {
            name: "Puerto Madero",
            address: "Puerto Madero, Buenos Aires, Argentina",
            description: "Modern waterfront district featuring upscale restaurants, corporate offices, and luxury apartments. Perfect for business meetings and elegant dining experiences.",
            image: "puerto-madero.webp",
            category: "Business"
        },
        {
            name: "La Boca & Caminito",
            address: "Caminito, La Boca, Buenos Aires, Argentina",
            description: "Colorful neighborhood famous for its vibrant street art, tango performances, and the iconic Boca Juniors football stadium. A true cultural experience.",
            image: "la-boca.webp",
            category: "Culture"
        },
        {
            name: "Recoleta Cemetery",
            address: "Junín 1760, Recoleta, Buenos Aires, Argentina",
            description: "Historic cemetery where Eva Perón rests, featuring elaborate mausoleums and sculptures. A unique blend of history, art, and Argentine heritage.",
            image: "recoleta.webp",
            category: "History"
        },
        {
            name: "San Telmo Market",
            address: "Defensa 963, San Telmo, Buenos Aires, Argentina",
            description: "Traditional Sunday market featuring antiques, local crafts, and street tango performances. Experience authentic Argentine culture and find unique treasures.",
            image: "san-telmo.webp",
            category: "Shopping"
        },
        {
            name: "Palermo Parks",
            address: "Palermo, Buenos Aires, Argentina",
            description: "Vast green spaces including Rose Garden and Japanese Garden. Ideal for business retreats, outdoor meetings, and recreational activities in the city.",
            image: "palermo.webp",
            category: "Nature"
        },
        {
            name: "Microcentro Financial District",
            address: "Microcentro, Buenos Aires, Argentina",
            description: "Heart of Buenos Aires' financial sector, home to banks, government buildings, and corporate headquarters. The business pulse of Argentina.",
            image: "microcentro.webp",
            category: "Business"
        },
        {
            name: "Tigre Delta",
            address: "Tigre, Buenos Aires Province, Argentina",
            description: "Unique river delta system accessible by boat or train from Buenos Aires. Perfect for corporate retreats and exploring Argentina's natural waterways.",
            image: "tigre.webp",
            category: "Nature"
        }
    ];

    // Clear any existing content and show fallback message
    attractionsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 1rem; background: #e3f2fd; color: #1976d2; border-radius: 8px; margin-bottom: 1rem;">📍 Discover Buenos Aires - Chamber Member Highlights</div>';

    fallbackAttractions.forEach(attraction => {
        const card = createAttractionCard(attraction);
        attractionsGrid.appendChild(card);
    });

    console.log('✅ Fallback attractions displayed');
}

// Create attraction card element with robust error handling
function createAttractionCard(attraction) {
    const card = document.createElement('div');
    card.className = 'attraction-card';

    // Validate attraction data
    const name = attraction.name || 'Buenos Aires Attraction';
    const address = attraction.address || 'Buenos Aires, Argentina';
    const description = attraction.description || 'Discover this amazing attraction in Buenos Aires.';
    const category = attraction.category || 'General';

    // Get category class for badge
    const categoryClass = category.toLowerCase().replace(/\s+/g, '-');

    // Use hero image as fallback - always exists in your project
    const imagePath = 'images/hero-large.webp';

    card.innerHTML = `
        <h2>${name}</h2>
        <figure>
            <img src="${imagePath}" 
                 alt="${name}" 
                 loading="lazy">
            <div class="category-badge ${categoryClass}">${category}</div>
        </figure>
        <address>${address}</address>
        <p>${description}</p>
        <button type="button" onclick="learnMore('${name.replace(/'/g, "\\'")}')">Learn More</button>
    `;

    return card;
}

// Learn more button functionality
function learnMore(attractionName) {
    console.log(`🔍 Learn more clicked for: ${attractionName}`);

    const message = `Learn more about ${attractionName}!\n\n` +
        `For detailed information, contact the Buenos Aires Chamber of Commerce:\n\n` +
        `📧 Email: info@buenosaires-chamber.org\n` +
        `📞 Phone: +54 11 4567-8900\n` +
        `📍 Address: Av. Corrientes 1000, Buenos Aires\n\n` +
        `We can help you plan visits, arrange business meetings, or provide local insights!`;

    alert(message);
}

// Update footer with current year and last modified
function updateFooter() {
    try {
        const currentYear = new Date().getFullYear();
        const currentYearElement = document.getElementById('currentYear');
        if (currentYearElement) {
            currentYearElement.textContent = currentYear;
        }

        const lastModified = document.getElementById('lastModified');
        if (lastModified) {
            lastModified.textContent = document.lastModified;
        }

        console.log('✅ Footer updated');
    } catch (error) {
        console.error('❌ Error updating footer:', error);
    }
}

// Error handling for the entire page
window.addEventListener('error', function (e) {
    console.error('🚨 JavaScript error on discover page:', e.error);
});

window.addEventListener('unhandledrejection', function (e) {
    console.error('🚨 Unhandled promise rejection on discover page:', e.reason);
});

console.log('🚀 Discover Buenos Aires script loaded successfully (standalone version)');