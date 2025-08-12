// Hidden Gems Explorer - Main JavaScript Module
// Albert Silva - WDD 231 Final Project

// Global state management
window.appState = {
    attractions: [],
    filteredAttractions: [],
    favorites: JSON.parse(localStorage.getItem('hiddenGemsFavorites') || '[]'),
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
        // Remove loading messages immediately
        removeLoadingMessages();

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

// Remove all loading messages
function removeLoadingMessages() {
    const loadingElements = document.querySelectorAll('.loading-message, [id*="loading"]');
    loadingElements.forEach(el => {
        if (el.textContent.includes('Loading')) {
            el.style.display = 'none';
        }
    });
}

// Load attractions data
async function loadAttractions() {
    if (window.appState.attractions.length > 0) return window.appState.attractions;

    try {
        console.log('📥 Loading attractions data...');

        // Try to load from local JSON file
        const response = await fetch('./attractions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        window.appState.attractions = data.attractions || [];
        window.appState.filteredAttractions = [...window.appState.attractions];

        console.log(`✅ Loaded ${window.appState.attractions.length} attractions`);

        return window.appState.attractions;
    } catch (error) {
        console.error('❌ Error loading attractions:', error);

        // Fallback to hardcoded data if JSON fails
        window.appState.attractions = getFallbackAttractions();
        window.appState.filteredAttractions = [...window.appState.attractions];

        console.log(`✅ Using fallback data: ${window.appState.attractions.length} attractions`);
        return window.appState.attractions;
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
            image: "./images/attractions/secret-rooftop-garden.webp",
            rating: 4.8,
            neighborhood: "Palermo",
            openHours: "6:00 AM - 8:00 PM"
        },
        {
            id: 2,
            name: "Underground Art Gallery",
            category: "Culture",
            description: "Former subway tunnel transformed into a vibrant underground art space showcasing local street artists and experimental installations.",
            location: "San Telmo, Buenos Aires",
            cost: "Low",
            accessibility: "High",
            image: "./images/attractions/underground-art-galery.webp",
            rating: 4.6,
            neighborhood: "San Telmo",
            openHours: "2:00 PM - 10:00 PM"
        },
        {
            id: 3,
            name: "Historic Clock Tower",
            category: "Architecture",
            description: "19th-century clock tower with original mechanisms still functioning. Offers guided tours and incredible city views.",
            location: "Monserrat, Buenos Aires",
            cost: "Medium",
            accessibility: "Medium",
            image: "./images/attractions/historic-clock-tower.webp",
            rating: 4.5,
            neighborhood: "Monserrat",
            openHours: "10:00 AM - 6:00 PM"
        },
        {
            id: 4,
            name: "Hidden Waterfall Trail",
            category: "Nature",
            description: "Short hiking trail leading to a secluded waterfall in the heart of the urban area. Features rare birds and stunning forest views.",
            location: "Belgrano, Buenos Aires",
            cost: "Free",
            accessibility: "Low",
            image: "./images/attractions/hidden-waterfall-trail.webp",
            rating: 4.7,
            neighborhood: "Belgrano",
            openHours: "Dawn to Dusk"
        },
        {
            id: 5,
            name: "Vintage Record Shop Basement",
            category: "Entertainment",
            description: "Hidden basement venue beneath a record shop where local musicians perform intimate acoustic concerts.",
            location: "Villa Crespo, Buenos Aires",
            cost: "Medium",
            accessibility: "Medium",
            image: "./images/attractions/vintage-record-shop-basement.webp",
            rating: 4.4,
            neighborhood: "Villa Crespo",
            openHours: "7:00 PM - 1:00 AM"
        },
        {
            id: 6,
            name: "Forgotten Cemetery Garden",
            category: "History",
            description: "Small 18th-century cemetery with beautiful sculptures, peaceful gardens, and rich historical stories.",
            location: "Recoleta, Buenos Aires",
            cost: "Free",
            accessibility: "High",
            image: "./images/attractions/forgotten-cemetery-garden.webp",
            rating: 4.3,
            neighborhood: "Recoleta",
            openHours: "8:00 AM - 6:00 PM"
        },
        {
            id: 7,
            name: "Artisan Workshop Alley",
            category: "Culture",
            description: "Narrow alley filled with traditional craftspeople's workshops. Watch pottery, jewelry, and woodworking demonstrations.",
            location: "San Telmo, Buenos Aires",
            cost: "Free",
            accessibility: "Medium",
            image: "./images/attractions/artisan-workshop-alley.webp",
            rating: 4.6,
            neighborhood: "San Telmo",
            openHours: "10:00 AM - 7:00 PM"
        },
        {
            id: 8,
            name: "Secret Speakeasy Cave",
            category: "Entertainment",
            description: "Hidden speakeasy located in underground caves with craft cocktails and live jazz music in an intimate setting.",
            location: "Palermo, Buenos Aires",
            cost: "High",
            accessibility: "Low",
            image: "./images/attractions/secret-speakeasy-cave.webp",
            rating: 4.9,
            neighborhood: "Palermo",
            openHours: "8:00 PM - 3:00 AM"
        },
        {
            id: 9,
            name: "Rooftop Beehive Gardens",
            category: "Nature",
            description: "Urban beekeeping project with guided tours about bee conservation, honey tasting, and rooftop gardening.",
            location: "Caballito, Buenos Aires",
            cost: "Low",
            accessibility: "Medium",
            image: "./images/attractions/rooftop-beehive-garden.webp",
            rating: 4.5,
            neighborhood: "Caballito",
            openHours: "9:00 AM - 5:00 PM"
        },
        {
            id: 10,
            name: "Hidden Speakeasy Love",
            category: "Entertainment",
            description: "Secret hidden bar with a speakeasy theme, rocky seating, perfect for romantic photography and peaceful conversation.",
            location: "Puerto Madero, Buenos Aires",
            cost: "Medium",
            accessibility: "High",
            image: "./images/attractions/hidden-speakeasy-love.webp",
            rating: 4.7,
            neighborhood: "Puerto Madero",
            openHours: "6:00 PM - 2:00 AM"
        },
        {
            id: 11,
            name: "Abandoned Theater Ruins",
            category: "Architecture",
            description: "Stunning architectural details and ruins of a former opera house. Ideal venue for creative architectural tours.",
            location: "Barracas, Buenos Aires",
            cost: "Free",
            accessibility: "Low",
            image: "./images/attractions/abandoned-theater-ruins.webp",
            rating: 4.2,
            neighborhood: "Barracas",
            openHours: "10:00 AM - 4:00 PM"
        },
        {
            id: 12,
            name: "Rooftop Bookstore Gardens",
            category: "Culture",
            description: "Urban bookstore project with outdoor garden, reading areas, and book exchange programs for the community.",
            location: "Villa Crespo, Buenos Aires",
            cost: "Free",
            accessibility: "High",
            image: "./images/attractions/vintage-record-shop-basement.webp",
            rating: 4.8,
            neighborhood: "Villa Crespo",
            openHours: "8:00 AM - 10:00 PM"
        },
        {
            id: 13,
            name: "Telescope Observatory Deck",
            category: "Entertainment",
            description: "Community-run telescope facility offering stargazing sessions with knowledgeable volunteers and modern equipment.",
            location: "Núñez, Buenos Aires",
            cost: "Low",
            accessibility: "Medium",
            image: "./images/attractions/telescope-observatory-deck.webp",
            rating: 4.6,
            neighborhood: "Núñez",
            openHours: "8:00 PM - 12:00 AM"
        },
        {
            id: 14,
            name: "Ancient Tree Grove",
            category: "Nature",
            description: "Collection of 200+ year old trees in an urban setting. Features educational signage about urban forest conservation.",
            location: "Parque Chacabuco, Buenos Aires",
            cost: "Free",
            accessibility: "High",
            image: "./images/attractions/ancient-tree-grove.webp",
            rating: 4.4,
            neighborhood: "Parque Chacabuco",
            openHours: "6:00 AM - 8:00 PM"
        },
        {
            id: 15,
            name: "Graffiti Hall of Fame",
            category: "Culture",
            description: "Legal graffiti wall showcasing rotating collection of local and international street artists' work.",
            location: "La Boca, Buenos Aires",
            cost: "Free",
            accessibility: "High",
            image: "./images/attractions/graffiti-hall-of-fame.webp",
            rating: 4.5,
            neighborhood: "La Boca",
            openHours: "24/7"
        },
        {
            id: 16,
            name: "Meditation Labyrinth",
            category: "Nature",
            description: "Stone labyrinth for walking meditation in quiet garden setting. Includes benches and information about mindfulness practices.",
            location: "Belgrano, Buenos Aires",
            cost: "Free",
            accessibility: "High",
            image: "./images/attractions/meditation-labyrinth.webp",
            rating: 4.3,
            neighborhood: "Belgrano",
            openHours: "6:00 AM - 10:00 PM"
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

// Initialize home page - ENHANCED
async function initializeHomePage() {
    console.log('🏠 Initializing home page...');

    try {
        // Update statistics
        updateStatistics();

        // Preload critical images
        preloadCriticalImages();

        // Load featured attractions
        await displayFeaturedAttractions();

        // Initialize search functionality
        initializeSearch();

        // Load categories
        displayCategories();

        // Load country information
        displayCountryInfo();

        // Initialize lazy loading
        initializeLazyLoading();

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
        const featured = window.appState.attractions
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
        await displayAttractions(window.appState.attractions);

        // Initialize search
        initializeSearch();

        // Update results count
        updateResultsCount();

    } catch (error) {
        console.error('❌ Error initializing attractions page:', error);
    }
}

// Display attractions
async function displayAttractions(attractions = window.appState.filteredAttractions) {
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

// Create attraction HTML with enhanced image handling - CORRECTED
function createAttractionHTML(attraction) {
    const isFavorite = window.appState.favorites.includes(attraction.id);
    const imageUrl = attraction.image || '';
    const placeholderUrl = createPlaceholderImage(attraction.name, attraction.category);

    return `
        <div class="attraction-card" data-id="${attraction.id}">
            <div class="attraction-image">
                <img src="${imageUrl}" 
                     alt="${attraction.name}"
                     loading="lazy"
                     onerror="handleImageError(this, '${attraction.name}', '${attraction.category}')"
                     onload="handleImageLoad(this)"
                     style="opacity: 0; transition: opacity 0.3s ease;">
                <div class="category-badge category-${attraction.category.toLowerCase()}">
                    ${attraction.category}
                </div>
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                        onclick="toggleFavorite(${attraction.id})"
                        data-id="${attraction.id}"
                        aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                    ${isFavorite ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="attraction-content">
                <h3>${attraction.name}</h3>
                <p class="attraction-description">${attraction.description}</p>
                <div class="attraction-meta">
                    <span class="location">📍 ${attraction.location || attraction.neighborhood}</span>
                    <span class="cost">💰 ${attraction.cost}</span>
                    <span class="accessibility">♿ ${attraction.accessibility}</span>
                    <span class="rating">⭐ ${attraction.rating || 4.5}</span>
                </div>
                <div class="attraction-actions">
                    <button class="btn btn-primary details-btn" onclick="openModal(${attraction.id})">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Enhanced placeholder image creation - CORRECTED
function createPlaceholderImage(attractionName, category) {
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
    const lightColor = adjustColorBrightness(bgColor, 40);
    const initials = attractionName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();

    // SVG placeholder with sophisticated gradient
    return `data:image/svg+xml;charset=UTF-8,%3csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3clinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' style='stop-color:${encodeURIComponent(lightColor)};stop-opacity:0.8' /%3e%3cstop offset='100%25' style='stop-color:${encodeURIComponent(bgColor)};stop-opacity:0.6' /%3e%3c/linearGradient%3e%3c/defs%3e%3crect width='400' height='300' fill='url(%23grad)' /%3e%3ccircle cx='200' cy='120' r='40' fill='${encodeURIComponent(bgColor)}' opacity='0.3'/%3e%3ctext x='200' y='130' text-anchor='middle' dy='0.35em' font-family='Arial, sans-serif' font-size='28' font-weight='bold' fill='${encodeURIComponent(bgColor)}' opacity='0.9'%3e${initials}%3c/text%3e%3ctext x='200' y='200' text-anchor='middle' dy='0.35em' font-family='Arial, sans-serif' font-size='14' font-weight='500' fill='${encodeURIComponent(bgColor)}' opacity='0.7'%3e${encodeURIComponent(category)}%3c/text%3e%3c/svg%3e`;
}

// Helper function to adjust color brightness
function adjustColorBrightness(hex, percent) {
    // Remove # if present
    hex = hex.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Adjust brightness
    const newR = Math.min(255, Math.max(0, r + (r * percent / 100)));
    const newG = Math.min(255, Math.max(0, g + (g * percent / 100)));
    const newB = Math.min(255, Math.max(0, b + (b * percent / 100)));

    // Convert back to hex
    const toHex = (c) => {
        const hex = Math.round(c).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

// Handle successful image loading
function handleImageLoad(img) {
    img.style.opacity = '1';
    img.classList.add('loaded');

    // Remove loading class if exists
    const card = img.closest('.attraction-card');
    if (card) {
        card.classList.remove('card-loading');
    }

    console.log('✅ Image loaded successfully:', img.alt);
}

// Handle image loading error with robust fallback
function handleImageError(img, attractionName, category) {
    img.onerror = null; // Prevent infinite loop

    console.log('⚠️ Image failed to load, using placeholder for:', attractionName);

    // Set placeholder as fallback
    img.src = createPlaceholderImage(attractionName, category);
    img.alt = `${attractionName} - Image not available`;
    img.style.opacity = '1';

    // Add class for specific styling
    img.classList.add('placeholder-image');

    // Remove loading class
    const card = img.closest('.attraction-card');
    if (card) {
        card.classList.remove('card-loading');
        card.classList.add('placeholder-card');
    }
}

// Preload critical images for better performance
function preloadCriticalImages() {
    const featuredAttractions = window.appState.attractions
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3);

    featuredAttractions.forEach(attraction => {
        if (attraction.image) {
            const img = new Image();
            img.onload = () => console.log('✅ Preloaded:', attraction.name);
            img.onerror = () => console.log('⚠️ Failed to preload:', attraction.name);
            img.src = attraction.image;
        }
    });
}

// Initialize optimized lazy loading
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
    }
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

    window.appState.currentFilters = {
        category: categoryFilter?.value || 'all',
        cost: costFilter?.value || 'all',
        accessibility: accessibilityFilter?.value || 'all',
        search: searchInput?.value.toLowerCase() || ''
    };

    window.appState.filteredAttractions = window.appState.attractions.filter(attraction => {
        const matchesCategory = window.appState.currentFilters.category === 'all' ||
            attraction.category.toLowerCase() === window.appState.currentFilters.category.toLowerCase();

        const matchesCost = window.appState.currentFilters.cost === 'all' ||
            attraction.cost.toLowerCase() === window.appState.currentFilters.cost.toLowerCase();

        const matchesAccessibility = window.appState.currentFilters.accessibility === 'all' ||
            attraction.accessibility.toLowerCase() === window.appState.currentFilters.accessibility.toLowerCase();

        const matchesSearch = window.appState.currentFilters.search === '' ||
            attraction.name.toLowerCase().includes(window.appState.currentFilters.search) ||
            attraction.description.toLowerCase().includes(window.appState.currentFilters.search) ||
            (attraction.location && attraction.location.toLowerCase().includes(window.appState.currentFilters.search)) ||
            (attraction.neighborhood && attraction.neighborhood.toLowerCase().includes(window.appState.currentFilters.search));

        return matchesCategory && matchesCost && matchesAccessibility && matchesSearch;
    });

    displayAttractions(window.appState.filteredAttractions);
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

    window.appState.currentFilters = {
        category: 'all',
        cost: 'all',
        accessibility: 'all',
        search: ''
    };

    window.appState.filteredAttractions = [...window.appState.attractions];
    displayAttractions(window.appState.filteredAttractions);
    updateResultsCount();
}

// Update results count
function updateResultsCount() {
    const countElement = document.getElementById('resultsCount');
    if (countElement) {
        const count = window.appState.filteredAttractions.length;
        countElement.textContent = `${count} hidden gems found`;
    }
}

// Update statistics
function updateStatistics() {
    const stats = {
        totalGems: window.appState.attractions.length,
        categories: [...new Set(window.appState.attractions.map(a => a.category))].length,
        favorites: window.appState.favorites.length
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
function initializeWeatherWidget() {
    const weatherWidget = document.getElementById('weatherWidget');
    if (!weatherWidget) return;

    try {
        weatherWidget.innerHTML = `
            <h3>Buenos Aires Weather</h3>
            <div class="weather-info">
                <div class="weather-current">
                    <span class="weather-temp">22°C</span>
                    <span class="weather-desc">Partly Cloudy</span>
                </div>
                <div class="weather-details">
                    <span>Humidity: 65%</span>
                    <span>Wind: 13 km/h</span>
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
            window.appState.favorites = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        window.appState.favorites = [];
    }
}

// Toggle favorite
function toggleFavorite(attractionId) {
    const index = window.appState.favorites.indexOf(attractionId);

    if (index > -1) {
        window.appState.favorites.splice(index, 1);
    } else {
        window.appState.favorites.push(attractionId);
    }

    try {
        localStorage.setItem('hiddenGemsFavorites', JSON.stringify(window.appState.favorites));
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
        const isActive = window.appState.favorites.includes(id);
        btn.classList.toggle('active', isActive);
        btn.innerHTML = isActive ? '❤️' : '🤍';
        btn.setAttribute('aria-label', isActive ? 'Remove from favorites' : 'Add to favorites');
    });

    // Update view favorites button
    const viewFavoritesBtn = document.getElementById('viewFavorites');
    if (viewFavoritesBtn) {
        viewFavoritesBtn.innerHTML = `View Favorites (${window.appState.favorites.length})`;
    }
}

// Initialize modal
function initializeModal() {
    const modal = document.getElementById('attractionModal');

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

// Enhanced modal with better image handling
function openModal(attractionId) {
    const attraction = window.appState.attractions.find(a => a.id === attractionId);
    if (!attraction) return;

    const modal = document.getElementById('attractionModal');
    const modalContent = document.getElementById('modalContent');

    if (!modal || !modalContent) return;

    const isFavorite = window.appState.favorites.includes(attractionId);
    const imageUrl = attraction.image || createPlaceholderImage(attraction.name, attraction.category);

    modalContent.innerHTML = `
        <button class="modal-close" onclick="closeModal()" aria-label="Close modal">&times;</button>
        <div class="modal-body">
            <div class="modal-image-container">
                <img src="${imageUrl}" 
                     alt="${attraction.name}" 
                     class="modal-image"
                     onerror="handleImageError(this, '${attraction.name}', '${attraction.category}')"
                     onload="handleImageLoad(this)"
                     style="opacity: 0; transition: opacity 0.3s ease;">
                <div class="category-badge category-${attraction.category.toLowerCase()}">
                    ${attraction.category}
                </div>
            </div>
            <div class="modal-info">
                <h2>${attraction.name}</h2>
                <p class="modal-description">${attraction.description}</p>
                <div class="modal-details">
                    <div class="detail-item">
                        <strong>📍 Location:</strong> ${attraction.location || attraction.neighborhood}
                    </div>
                    <div class="detail-item">
                        <strong>💰 Cost:</strong> ${attraction.cost}
                    </div>
                    <div class="detail-item">
                        <strong>♿ Accessibility:</strong> ${attraction.accessibility}
                    </div>
                    <div class="detail-item">
                        <strong>🕒 Hours:</strong> ${attraction.openHours || 'Varies'}
                    </div>
                    <div class="detail-item">
                        <strong>⭐ Rating:</strong> ${attraction.rating || 4.5}/5
                    </div>
                </div>
                <button class="favorite-btn-modal ${isFavorite ? 'active' : ''}" 
                        onclick="toggleFavorite(${attraction.id}); updateModalFavoriteBtn(${attraction.id})"
                        aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                    ${isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus on close button for accessibility
    setTimeout(() => {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    }, 100);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('attractionModal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

// Update modal favorite button
function updateModalFavoriteBtn(attractionId) {
    const modalContent = document.getElementById('modalContent');
    const favoriteBtn = modalContent?.querySelector('.favorite-btn-modal');
    if (favoriteBtn) {
        const isActive = window.appState.favorites.includes(attractionId);
        favoriteBtn.classList.toggle('active', isActive);
        favoriteBtn.innerHTML = isActive ? '❤️ Remove from Favorites' : '🤍 Add to Favorites';
        favoriteBtn.setAttribute('aria-label', isActive ? 'Remove from favorites' : 'Add to favorites');
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
    if (!container || window.appState.attractions.length === 0) return;

    const categories = {};
    window.appState.attractions.forEach(attraction => {
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
function displayCountryInfo() {
    const container = document.getElementById('countryInfo');
    if (!container) return;

    try {
        container.innerHTML = `
            <div class="info-card">
                <h4>🗺️ Geography</h4>
                <p>Located in South America, Buenos Aires is the capital of Argentina.</p>
            </div>
            <div class="info-card">
                <h4>🕒 Timezone</h4>
                <p>GMT-3 (Argentina Time)</p>
            </div>
            <div class="info-card">
                <h4>💰 Currency</h4>
                <p>Argentine Peso (ARS)</p>
            </div>
            <div class="info-card">
                <h4>🗣️ Language</h4>
                <p>Spanish</p>
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
        cost: formData.get('cost'),
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
                <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
                <p><strong>Category:</strong> ${data.category || 'N/A'}</p>
                <p><strong>Location:</strong> ${data.location || 'N/A'}</p>
                <p><strong>Description:</strong> ${data.description || 'N/A'}</p>
                <p><strong>Accessibility:</strong> ${data.accessibility || 'N/A'}</p>
                <p><strong>Cost:</strong> ${data.cost || 'N/A'}</p>
                <p><strong>Visitor Tips:</strong> ${data.visitorTips || 'N/A'}</p>
                <p><strong>Submitted:</strong> ${new Date(data.submissionDate).toLocaleDateString()}</p>
            </div>
        </div>
    `;
}

// View favorites functionality
function viewFavorites() {
    if (window.appState.favorites.length === 0) {
        alert('You have no favorite attractions yet. Add some by clicking the heart icon on any attraction!');
        return;
    }

    const favoriteAttractions = window.appState.attractions.filter(attraction =>
        window.appState.favorites.includes(attraction.id)
    );

    window.appState.filteredAttractions = favoriteAttractions;
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
            if (costFilter) costFilter.value = 'Free';
            break;
        case 'accessible':
            if (accessibilityFilter) accessibilityFilter.value = 'High';
            break;
        case 'nature':
            if (categoryFilter) categoryFilter.value = 'Nature';
            break;
        case 'culture':
            if (categoryFilter) categoryFilter.value = 'Culture';
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
window.openModal = openModal;
window.closeModal = closeModal;
window.updateModalFavoriteBtn = updateModalFavoriteBtn;
window.clearAllFilters = clearAllFilters;
window.filterByCategory = filterByCategory;
window.viewFavorites = viewFavorites;
window.quickFilter = quickFilter;
window.submitFeedback = submitFeedback;
window.shareOn = shareOn;
window.copyLink = copyLink;
window.handleImageLoad = handleImageLoad;
window.handleImageError = handleImageError;
window.preloadCriticalImages = preloadCriticalImages;
window.initializeLazyLoading = initializeLazyLoading;

// Initialize URL params and last modified on attractions page
if (getCurrentPage() === 'attractions') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeURLParams, 100);
    });
}

// Update last modified on all pages
document.addEventListener('DOMContentLoaded', updateLastModified);