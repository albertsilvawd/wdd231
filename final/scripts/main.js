// Hidden Gems Explorer - Main JavaScript Module
// Albert Silva - WDD 231 Final Project

// Global state management
const appState = {
    attractions: [],
    filteredAttractions: [],
    favorites: new Set(),
    currentFilters: {
        category: 'all',
        cost: 'all',
        accessibility: 'all',
        search: ''
    },
    isLoading: false
};

// DOM ready initialization
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    console.log('🚀 Hidden Gems Explorer initializing...');

    try {
        // Initialize core functionality
        await loadAttractions();
        initializeNavigation();
        initializeWeatherWidget();
        initializeFavorites();
        initializeModal();

        // Page-specific initialization
        const currentPage = getCurrentPage();
        await initializePage(currentPage);

        console.log('✅ App initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        showErrorMessage('Failed to initialize the application. Please refresh the page.');
    }
}

// Load attractions data
async function loadAttractions() {
    if (appState.attractions.length > 0) return appState.attractions;

    try {
        console.log('📥 Loading attractions data...');

        // Try to load from local JSON file
        const response = await fetch('./attractions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        appState.attractions = data.attractions || [];
        appState.filteredAttractions = [...appState.attractions];

        console.log(`✅ Loaded ${appState.attractions.length} attractions`);

        return appState.attractions;
    } catch (error) {
        console.error('❌ Error loading attractions:', error);

        // Fallback to hardcoded data if JSON fails
        appState.attractions = getFallbackAttractions();
        appState.filteredAttractions = [...appState.attractions];

        return appState.attractions;
    }
}

// Fallback attractions data - ALL 16 ITEMS
function getFallbackAttractions() {
    return [
        {
            id: 1,
            name: "Secret Rooftop Garden",
            category: "Nature",
            description: "Hidden oasis above the city with panoramic views and exotic plants. A peaceful escape featuring rare botanical specimens and stunning sunset views.",
            location: "Palermo, Buenos Aires",
            cost: "Free",
            accessibility: "Medium",
            image: "images/attractions/secret-rooftop-garden.webp",
            rating: 4.8,
            isLocal: true,
            tags: ["garden", "views", "peaceful", "botanical"]
        },
        {
            id: 2,
            name: "Underground Art Gallery",
            category: "Culture",
            description: "Former subway tunnel transformed into a vibrant underground art space showcasing local street artists and experimental installations.",
            location: "San Telmo, Buenos Aires",
            cost: "Low",
            accessibility: "High",
            image: "images/attractions/underground-art-gallery.webp",
            rating: 4.6,
            isLocal: false,
            tags: ["art", "underground", "street art", "exhibitions"]
        },
        {
            id: 3,
            name: "Historic Clock Tower",
            category: "Architecture",
            description: "19th-century clock tower with original mechanisms still functioning. Offers guided tours and incredible city views.",
            location: "Monserrat, Buenos Aires",
            cost: "Medium",
            accessibility: "Medium",
            image: "images/attractions/historic-clock-tower.webp",
            rating: 4.5,
            isLocal: true,
            tags: ["history", "architecture", "tower", "guided tours"]
        },
        {
            id: 4,
            name: "Hidden Waterfall Trail",
            category: "Nature",
            description: "Short hiking trail leading to a secluded waterfall in the heart of the urban area. Features rare birds and stunning forest views.",
            location: "Belgrano, Buenos Aires",
            cost: "Free",
            accessibility: "Low",
            image: "images/attractions/hidden-waterfall-trail.webp",
            rating: 4.7,
            isLocal: true,
            tags: ["hiking", "waterfall", "nature", "birds"]
        },
        {
            id: 5,
            name: "Vintage Record Shop Basement",
            category: "Entertainment",
            description: "Hidden basement venue beneath a record shop where local musicians perform intimate acoustic concerts.",
            location: "Villa Crespo, Buenos Aires",
            cost: "Medium",
            accessibility: "Medium",
            image: "images/attractions/vintage-record-shop-basement.webp",
            rating: 4.4,
            isLocal: false,
            tags: ["music", "vintage", "concerts", "underground"]
        },
        {
            id: 6,
            name: "Forgotten Cemetery Garden",
            category: "History",
            description: "Small 18th-century cemetery with beautiful sculptures, peaceful gardens, and rich historical stories.",
            location: "Recoleta, Buenos Aires",
            cost: "Free",
            accessibility: "High",
            image: "images/attractions/forgotten-cemetery-garden.webp",
            rating: 4.3,
            isLocal: true,
            tags: ["cemetery", "history", "sculptures", "peaceful"]
        },
        {
            id: 7,
            name: "Artisan Workshop Alley",
            category: "Culture",
            description: "Narrow alley filled with traditional craftspeople's workshops. Watch pottery, jewelry, and woodworking demonstrations.",
            location: "San Telmo, Buenos Aires",
            cost: "Free",
            accessibility: "Medium",
            image: "images/attractions/artisan-workshop-alley.webp",
            rating: 4.6,
            isLocal: false,
            tags: ["artisan", "crafts", "workshops", "traditional"]
        },
        {
            id: 8,
            name: "Secret Speakeasy Cave",
            category: "Entertainment",
            description: "Hidden speakeasy located in underground caves with craft cocktails and live jazz music in an intimate setting.",
            location: "Palermo, Buenos Aires",
            cost: "High",
            accessibility: "Low",
            image: "images/attractions/secret-speakeasy-cave.webp",
            rating: 4.9,
            isLocal: true,
            tags: ["speakeasy", "cocktails", "jazz", "cave"]
        },
        {
            id: 9,
            name: "Rooftop Beehive Gardens",
            category: "Nature",
            description: "Urban beekeeping project with guided tours about bee conservation, honey tasting, and rooftop gardening.",
            location: "Caballito, Buenos Aires",
            cost: "Low",
            accessibility: "Medium",
            image: "images/attractions/rooftop-beehive-gardens.webp",
            rating: 4.5,
            isLocal: true,
            tags: ["bees", "honey", "conservation", "rooftop"]
        },
        {
            id: 10,
            name: "Hidden Speakeasy Love",
            category: "Entertainment",
            description: "Secret hidden bar with a speakeasy theme, rocky seating, perfect for romantic photography and peaceful conversation.",
            location: "Puerto Madero, Buenos Aires",
            cost: "Medium",
            accessibility: "High",
            image: "images/attractions/hidden-speakeasy-love.webp",
            rating: 4.7,
            isLocal: false,
            tags: ["speakeasy", "romantic", "photography", "conversation"]
        },
        {
            id: 11,
            name: "Abandoned Theater Ruins",
            category: "Architecture",
            description: "Stunning architectural details and ruins of a former opera house. Ideal venue for creative architectural tours.",
            location: "Barracas, Buenos Aires",
            cost: "Free",
            accessibility: "Low",
            image: "images/attractions/abandoned-theater-ruins.webp",
            rating: 4.2,
            isLocal: true,
            tags: ["theater", "ruins", "architecture", "opera"]
        },
        {
            id: 12,
            name: "Rooftop Bookstore Gardens",
            category: "Culture",
            description: "Urban bookstore project with outdoor garden, reading areas, and book exchange programs for the community.",
            location: "Villa Crespo, Buenos Aires",
            cost: "Free",
            accessibility: "High",
            image: "images/attractions/rooftop-bookstore-gardens.webp",
            rating: 4.8,
            isLocal: false,
            tags: ["books", "reading", "garden", "community"]
        },
        {
            id: 13,
            name: "Telescope Observatory Deck",
            category: "Entertainment",
            description: "Community-run telescope facility offering stargazing sessions with knowledgeable volunteers and modern equipment.",
            location: "Núñez, Buenos Aires",
            cost: "Low",
            accessibility: "Medium",
            image: "images/attractions/telescope-observatory-deck.webp",
            rating: 4.6,
            isLocal: true,
            tags: ["telescope", "stargazing", "astronomy", "education"]
        },
        {
            id: 14,
            name: "Ancient Tree Grove",
            category: "Nature",
            description: "Collection of 200+ year old trees in an urban setting. Features educational signage about urban forest conservation.",
            location: "Parque Chacabuco, Buenos Aires",
            cost: "Free",
            accessibility: "High",
            image: "images/attractions/ancient-tree-grove.webp",
            rating: 4.4,
            isLocal: true,
            tags: ["trees", "ancient", "conservation", "education"]
        },
        {
            id: 15,
            name: "Graffiti Hall of Fame",
            category: "Culture",
            description: "Legal graffiti wall showcasing rotating collection of local and international street artists' work.",
            location: "La Boca, Buenos Aires",
            cost: "Free",
            accessibility: "High",
            image: "images/attractions/graffiti-hall-of-fame.webp",
            rating: 4.5,
            isLocal: false,
            tags: ["graffiti", "street art", "legal wall", "artists"]
        },
        {
            id: 16,
            name: "Meditation Labyrinth",
            category: "Nature",
            description: "Stone labyrinth for walking meditation in quiet garden setting. Includes benches and information about mindfulness practices.",
            location: "Belgrano, Buenos Aires",
            cost: "Free",
            accessibility: "High",
            image: "images/attractions/meditation-labyrinth.webp",
            rating: 4.3,
            isLocal: true,
            tags: ["meditation", "labyrinth", "mindfulness", "peaceful"]
        }
    ];
}

// Get current page
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('attractions.html')) return 'attractions';
    if (path.includes('about.html')) return 'about';
    if (path.includes('thankyou.html')) return 'thankyou';
    return 'home';
}

// Initialize page-specific functionality
async function initializePage(page) {
    switch (page) {
        case 'home':
            await initializeHomePage();
            break;
        case 'attractions':
            await initializeAttractionsPage();
            break;
        case 'about':
            initializeAboutPage();
            break;
        case 'thankyou':
            initializeThankYouPage();
            break;
    }
}

// Initialize home page
async function initializeHomePage() {
    console.log('🏠 Initializing home page...');

    try {
        // Update statistics
        updateStatistics();

        // Load featured attractions
        await displayFeaturedAttractions();

        // Initialize search functionality
        initializeSearch();

        // Load categories
        displayCategories();

        // Load country information
        await loadCountryInfo();

    } catch (error) {
        console.error('❌ Error initializing home page:', error);
    }
}

// Display featured attractions
async function displayFeaturedAttractions() {
    const container = document.getElementById('featuredAttractions');
    if (!container) return;

    try {
        console.log('🌟 Loading featured attractions...');

        // Get top 3 rated attractions
        const featured = appState.attractions
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3);

        if (featured.length === 0) {
            container.innerHTML = '<p class="no-attractions">No featured attractions available.</p>';
            return;
        }

        container.innerHTML = featured.map(attraction => createAttractionHTML(attraction)).join('');

        console.log('✅ Featured attractions displayed');

    } catch (error) {
        console.error('❌ Error displaying featured attractions:', error);
        container.innerHTML = '<p class="error-message">Failed to load featured attractions.</p>';
    }
}

// Initialize attractions page
async function initializeAttractionsPage() {
    console.log('🗺️ Initializing attractions page...');

    try {
        // Initialize filters
        initializeFilters();

        // Display all attractions
        await displayAttractions(appState.attractions);

        // Initialize search
        initializeSearch();

        // Update results count
        updateResultsCount();

    } catch (error) {
        console.error('❌ Error initializing attractions page:', error);
    }
}

// Display attractions
async function displayAttractions(attractions = appState.filteredAttractions) {
    const container = document.getElementById('attractionsGrid');
    if (!container) return;

    try {
        if (attractions.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>No attractions found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                    <button class="btn btn-primary" onclick="clearAllFilters()">Clear Filters</button>
                </div>
            `;
            return;
        }

        container.innerHTML = attractions.map(attraction => createAttractionHTML(attraction)).join('');

        console.log(`✅ Displayed ${attractions.length} attractions`);

    } catch (error) {
        console.error('❌ Error displaying attractions:', error);
        container.innerHTML = '<p class="error-message">Failed to load attractions.</p>';
    }
}

// Create attraction HTML
function createAttractionHTML(attraction) {
    const imageSrc = attraction.image || getPlaceholderUrl(attraction.name, attraction.category);

    return `
        <div class="attraction-card" data-id="${attraction.id}">
            <div class="card-image">
                <img src="${imageSrc}" 
                     alt="${attraction.name}"
                     loading="lazy"
                     onerror="this.src='${getPlaceholderUrl(attraction.name, attraction.category)}'">
                <div class="category-badge category-${attraction.category.toLowerCase()}">
                    ${attraction.category}
                </div>
            </div>
            <div class="card-content">
                <h3>${attraction.name}</h3>
                <p class="card-description">${attraction.description}</p>
                <div class="card-meta">
                    <span class="location">📍 ${attraction.location}</span>
                    <span class="cost">💰 ${attraction.cost}</span>
                    <span class="accessibility">♿ ${attraction.accessibility}</span>
                    <span class="rating">⭐ ${attraction.rating || 4.5}</span>
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="openAttractionModal(${attraction.id})">
                        View Details
                    </button>
                    <button class="btn btn-outline favorite-btn" onclick="toggleFavorite(${attraction.id})" 
                            data-id="${attraction.id}">
                        ${appState.favorites.has(attraction.id) ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Get placeholder URL
function getPlaceholderUrl(attractionName, category) {
    const colors = {
        'Nature': '#10B981',
        'Culture': '#8B5CF6',
        'Architecture': '#F59E0B',
        'History': '#EF4444',
        'Entertainment': '#EC4899',
        'Food': '#F97316',
        'Shopping': '#06B6D4'
    };

    const bgColor = colors[category] || '#6B7280';
    const initials = attractionName.split(' ').map(word => word[0]).join('').substring(0, 2);

    return `data:image/svg+xml;charset=UTF-8,%3csvg width='400' height='200' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='400' height='200' fill='${bgColor}' opacity='0.1'/%3e%3ctext x='200' y='100' text-anchor='middle' dy='0.35em' font-family='Arial, sans-serif' font-size='48' font-weight='bold' fill='${bgColor}' opacity='0.8'%3e${initials}%3c/text%3e%3c/svg%3e`;
}

// Initialize filters
function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const costFilter = document.getElementById('costFilter');
    const accessibilityFilter = document.getElementById('accessibilityFilter');
    const searchInput = document.getElementById('searchInput');
    const clearFiltersBtn = document.getElementById('clearFilters');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    if (costFilter) {
        costFilter.addEventListener('change', applyFilters);
    }
    if (accessibilityFilter) {
        accessibilityFilter.addEventListener('change', applyFilters);
    }
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
}

// Apply filters
function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const costFilter = document.getElementById('costFilter');
    const accessibilityFilter = document.getElementById('accessibilityFilter');
    const searchInput = document.getElementById('searchInput');

    appState.currentFilters = {
        category: categoryFilter?.value || 'all',
        cost: costFilter?.value || 'all',
        accessibility: accessibilityFilter?.value || 'all',
        search: searchInput?.value.toLowerCase() || ''
    };

    appState.filteredAttractions = appState.attractions.filter(attraction => {
        const matchesCategory = appState.currentFilters.category === 'all' ||
            attraction.category.toLowerCase() === appState.currentFilters.category.toLowerCase();

        const matchesCost = appState.currentFilters.cost === 'all' ||
            attraction.cost.toLowerCase() === appState.currentFilters.cost.toLowerCase();

        const matchesAccessibility = appState.currentFilters.accessibility === 'all' ||
            attraction.accessibility.toLowerCase() === appState.currentFilters.accessibility.toLowerCase();

        const matchesSearch = appState.currentFilters.search === '' ||
            attraction.name.toLowerCase().includes(appState.currentFilters.search) ||
            attraction.description.toLowerCase().includes(appState.currentFilters.search) ||
            attraction.location.toLowerCase().includes(appState.currentFilters.search);

        return matchesCategory && matchesCost && matchesAccessibility && matchesSearch;
    });

    displayAttractions(appState.filteredAttractions);
    updateResultsCount();
}

// Clear all filters
function clearAllFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const costFilter = document.getElementById('costFilter');
    const accessibilityFilter = document.getElementById('accessibilityFilter');
    const searchInput = document.getElementById('searchInput');

    if (categoryFilter) categoryFilter.value = 'all';
    if (costFilter) costFilter.value = 'all';
    if (accessibilityFilter) accessibilityFilter.value = 'all';
    if (searchInput) searchInput.value = '';

    appState.currentFilters = {
        category: 'all',
        cost: 'all',
        accessibility: 'all',
        search: ''
    };

    appState.filteredAttractions = [...appState.attractions];
    displayAttractions(appState.filteredAttractions);
    updateResultsCount();
}

// Update results count
function updateResultsCount() {
    const countElement = document.getElementById('resultsCount');
    if (countElement) {
        const count = appState.filteredAttractions.length;
        countElement.textContent = `${count} hidden gems found`;
    }
}

// Update statistics
function updateStatistics() {
    const stats = {
        totalGems: appState.attractions.length,
        categories: [...new Set(appState.attractions.map(a => a.category))].length,
        favorites: appState.favorites.size
    };

    const statElements = {
        gems: document.getElementById('totalGems'),
        categories: document.getElementById('totalCategories'),
        favorites: document.getElementById('totalFavorites')
    };

    if (statElements.gems) statElements.gems.textContent = stats.totalGems;
    if (statElements.categories) statElements.categories.textContent = stats.categories;
    if (statElements.favorites) statElements.favorites.textContent = stats.favorites;
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize navigation
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.main-nav');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.main-nav a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Initialize weather widget
async function initializeWeatherWidget() {
    const weatherWidget = document.getElementById('weatherWidget');
    if (!weatherWidget) return;

    try {
        const weatherData = {
            temperature: 22,
            condition: 'Partly Cloudy',
            humidity: 65,
            windSpeed: 13
        };

        weatherWidget.innerHTML = `
            <h3>Buenos Aires Weather</h3>
            <div class="weather-info">
                <div class="weather-current">
                    <span class="weather-temp">${weatherData.temperature}°C</span>
                    <span class="weather-desc">${weatherData.condition}</span>
                </div>
                <div class="weather-details">
                    <span>Humidity: ${weatherData.humidity}%</span>
                    <span>Wind: ${weatherData.windSpeed} km/h</span>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Weather widget error:', error);
        weatherWidget.innerHTML = '<p>Weather unavailable</p>';
    }
}

// Initialize favorites
function initializeFavorites() {
    try {
        const saved = localStorage.getItem('hiddenGemsFavorites');
        if (saved) {
            appState.favorites = new Set(JSON.parse(saved));
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        appState.favorites = new Set();
    }
}

// Toggle favorite
function toggleFavorite(attractionId) {
    if (appState.favorites.has(attractionId)) {
        appState.favorites.delete(attractionId);
    } else {
        appState.favorites.add(attractionId);
    }

    try {
        localStorage.setItem('hiddenGemsFavorites', JSON.stringify([...appState.favorites]));
    } catch (error) {
        console.error('Error saving favorites:', error);
    }

    updateFavoriteButtons();
    updateStatistics();
}

// Update favorite buttons
function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const id = parseInt(btn.dataset.id);
        btn.innerHTML = appState.favorites.has(id) ? '❤️' : '🤍';
    });
}

// Initialize modal
function initializeModal() {
    const modal = document.getElementById('attractionModal');
    const closeBtn = document.querySelector('.modal-close');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Open attraction modal
function openAttractionModal(attractionId) {
    const attraction = appState.attractions.find(a => a.id === attractionId);
    if (!attraction) return;

    const modal = document.getElementById('attractionModal');
    const modalContent = document.getElementById('modalContent');

    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
        <button class="modal-close">&times;</button>
        <div class="modal-image">
            <img src="${attraction.image || getPlaceholderUrl(attraction.name, attraction.category)}" 
                 alt="${attraction.name}"
                 onerror="this.src='${getPlaceholderUrl(attraction.name, attraction.category)}'">
        </div>
        <div class="modal-info">
            <h2>${attraction.name}</h2>
            <div class="modal-meta">
                <span class="category-badge category-${attraction.category.toLowerCase()}">${attraction.category}</span>
                <span class="rating">⭐ ${attraction.rating || 4.5}</span>
            </div>
            <p class="modal-description">${attraction.description}</p>
            <div class="modal-details">
                <div class="detail-item">
                    <strong>📍 Location:</strong> ${attraction.location}
                </div>
                <div class="detail-item">
                    <strong>💰 Cost:</strong> ${attraction.cost}
                </div>
                <div class="detail-item">
                    <strong>♿ Accessibility:</strong> ${attraction.accessibility}
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="toggleFavorite(${attraction.id}); updateModalFavoriteBtn(${attraction.id})">
                    ${appState.favorites.has(attraction.id) ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const newCloseBtn = modalContent.querySelector('.modal-close');
    if (newCloseBtn) {
        newCloseBtn.addEventListener('click', closeModal);
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('attractionModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Update modal favorite button
function updateModalFavoriteBtn(attractionId) {
    const modalContent = document.getElementById('modalContent');
    const favoriteBtn = modalContent?.querySelector('.btn-primary');
    if (favoriteBtn) {
        favoriteBtn.innerHTML = appState.favorites.has(attractionId) ?
            '❤️ Remove from Favorites' : '🤍 Add to Favorites';
    }
    updateFavoriteButtons();
}

// Show error message
function showErrorMessage(message) {
    console.error('Error:', message);
}

// Initialize search
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const exploreBtn = document.getElementById('exploreBtn');

    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            if (getCurrentPage() !== 'attractions') {
                const searchTerm = searchInput?.value || '';
                window.location.href = `attractions.html${searchTerm ? '?search=' + encodeURIComponent(searchTerm) : ''}`;
            }
        });
    }
}

// Display categories
function displayCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container || appState.attractions.length === 0) return;

    const categories = {};
    appState.attractions.forEach(attraction => {
        categories[attraction.category] = (categories[attraction.category] || 0) + 1;
    });

    const categoryIcons = {
        'Nature': '🌿',
        'Culture': '🎨',
        'Architecture': '🏛️',
        'History': '📜',
        'Entertainment': '🎭',
        'Food': '🍽️',
        'Shopping': '🛍️'
    };

    container.innerHTML = Object.entries(categories).map(([category, count]) => `
        <div class="category-card" onclick="filterByCategory('${category}')">
            <div class="category-icon">${categoryIcons[category] || '📍'}</div>
            <h3>${category}</h3>
            <p>${count} locations</p>
        </div>
    `).join('');
}

// Filter by category
function filterByCategory(category) {
    if (getCurrentPage() !== 'attractions') {
        window.location.href = `attractions.html?category=${encodeURIComponent(category)}`;
    } else {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = category;
            applyFilters();
        }
    }
}

// Load country information
async function loadCountryInfo() {
    const container = document.getElementById('countryInfo');
    if (!container) return;

    try {
        const countryData = {
            name: 'Buenos Aires',
            population: '45.4M',
            language: 'Guaraní',
            currency: 'Argentine peso'
        };

        container.innerHTML = `
            <div class="country-stat">
                <h3>${countryData.name}</h3>
                <p>Capital City</p>
            </div>
            <div class="country-stat">
                <h3>${countryData.population}</h3>
                <p>Population</p>
            </div>
            <div class="country-stat">
                <h3>${countryData.language}</h3>
                <p>Primary Language</p>
            </div>
            <div class="country-stat">
                <h3>${countryData.currency}</h3>
                <p>Currency</p>
            </div>
        `;
    } catch (error) {
        console.error('Country info error:', error);
        container.innerHTML = '<p>Country information unavailable</p>';
    }
}

// Initialize about page
function initializeAboutPage() {
    console.log('ℹ️ Initializing about page...');

    const form = document.getElementById('gemSubmissionForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
}

// Handle form submission
function handleFormSubmission(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const gemData = {
        gemName: formData.get('gemName'),
        email: formData.get('email'),
        category: formData.get('category'),
        location: formData.get('location'),
        description: formData.get('description'),
        accessibility: formData.get('accessibility'),
        visitorTips: formData.get('visitorTips'),
        submissionDate: new Date().toISOString()
    };

    try {
        localStorage.setItem('submittedGemData', JSON.stringify(gemData));
    } catch (error) {
        console.error('Error saving form data:', error);
    }

    window.location.href = 'thankyou.html';
}

// Initialize thank you page
function initializeThankYouPage() {
    console.log('🙏 Initializing thank you page...');

    try {
        const formData = JSON.parse(localStorage.getItem('submittedGemData') || '{}');
        if (Object.keys(formData).length > 0) {
            displaySubmittedData(formData);
        }
    } catch (error) {
        console.error('Error loading submitted data:', error);
    }
}

// Display submitted data
function displaySubmittedData(data) {
    const container = document.getElementById('submittedData');
    if (!container || !data) return;

    container.innerHTML = `
        <div class="submitted-gem">
            <h3>Your Submitted Hidden Gem</h3>
            <div class="gem-info">
                <p><strong>Name:</strong> ${data.gemName || 'N/A'}</p>
                <p><strong>Category:</strong> ${data.category || 'N/A'}</p>
                <p><strong>Location:</strong> ${data.location || 'N/A'}</p>
                <p><strong>Description:</strong> ${data.description || 'N/A'}</p>
                <p><strong>Accessibility:</strong> ${data.accessibility || 'N/A'}</p>
                <p><strong>Visitor Tips:</strong> ${data.visitorTips || 'N/A'}</p>
                <p><strong>Submitted:</strong> ${new Date(data.submissionDate).toLocaleDateString()}</p>
            </div>
        </div>
    `;
}

// View favorites functionality
function viewFavorites() {
    if (appState.favorites.size === 0) {
        alert('You have no favorite attractions yet. Add some by clicking the heart icon on any attraction!');
        return;
    }

    const favoriteAttractions = appState.attractions.filter(attraction =>
        appState.favorites.has(attraction.id)
    );

    appState.filteredAttractions = favoriteAttractions;
    displayAttractions(favoriteAttractions);
    updateResultsCount();
}

// Quick filter functionality
function quickFilter(type) {
    const categoryFilter = document.getElementById('categoryFilter');
    const costFilter = document.getElementById('costFilter');
    const accessibilityFilter = document.getElementById('accessibilityFilter');

    // Reset all filters first
    if (categoryFilter) categoryFilter.value = 'all';
    if (costFilter) costFilter.value = 'all';
    if (accessibilityFilter) accessibilityFilter.value = 'all';

    // Apply specific filter
    switch (type) {
        case 'free':
            if (costFilter) costFilter.value = 'free';
            break;
        case 'accessible':
            if (accessibilityFilter) accessibilityFilter.value = 'high';
            break;
        case 'nature':
            if (categoryFilter) categoryFilter.value = 'nature';
            break;
        case 'culture':
            if (categoryFilter) categoryFilter.value = 'culture';
            break;
    }

    applyFilters();
}

// Initialize URL parameters
function initializeURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');

    if (searchParam) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = searchParam;
            applyFilters();
        }
    }

    if (categoryParam) {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = categoryParam;
            applyFilters();
        }
    }
}

// Feedback functionality for thank you page
function submitFeedback(rating) {
    const feedbackMessage = document.getElementById('feedbackMessage');
    if (feedbackMessage) {
        feedbackMessage.style.display = 'block';
        setTimeout(() => {
            feedbackMessage.style.display = 'none';
        }, 3000);
    }

    console.log(`User feedback: ${rating}`);
}

// Share functionality for thank you page
function shareOn(platform) {
    const url = window.location.origin + window.location.pathname.replace('thankyou.html', 'index.html');
    const text = 'Check out Hidden Gems Explorer - discover amazing secret places in Buenos Aires!';

    switch (platform) {
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
            break;
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            break;
        case 'email':
            window.location.href = `mailto:?subject=${encodeURIComponent('Hidden Gems Explorer')}&body=${encodeURIComponent(text + ' ' + url)}`;
            break;
    }
}

// Copy link functionality
function copyLink() {
    const url = window.location.origin + window.location.pathname.replace('thankyou.html', 'index.html');

    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        }).catch(() => {
            fallbackCopyText(url);
        });
    } else {
        fallbackCopyText(url);
    }
}

// Fallback copy function
function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    } catch (err) {
        alert('Could not copy link. Please copy manually: ' + text);
    }
    document.body.removeChild(textArea);
}

// Update last modified date
function updateLastModified() {
    const lastModifiedElement = document.getElementById('lastModified');
    if (lastModifiedElement) {
        lastModifiedElement.textContent = new Date().toLocaleDateString();
    }
}

// Export functions for global access
window.toggleFavorite = toggleFavorite;
window.openAttractionModal = openAttractionModal;
window.closeModal = closeModal;
window.updateModalFavoriteBtn = updateModalFavoriteBtn;
window.clearAllFilters = clearAllFilters;
window.filterByCategory = filterByCategory;
window.viewFavorites = viewFavorites;
window.quickFilter = quickFilter;
window.submitFeedback = submitFeedback;
window.shareOn = shareOn;
window.copyLink = copyLink;

// Initialize URL params and last modified on attractions page
if (getCurrentPage() === 'attractions') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeURLParams, 100);
    });
}

// Update last modified on all pages
document.addEventListener('DOMContentLoaded', updateLastModified);