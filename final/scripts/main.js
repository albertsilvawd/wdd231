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
        showLoadingState(true);

        // Try to load from local JSON file
        const response = await fetch('./attractions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        appState.attractions = data.attractions || [];
        appState.filteredAttractions = [...appState.attractions];

        console.log(`✅ Loaded ${appState.attractions.length} attractions`);
        showLoadingState(false);

        return appState.attractions;
    } catch (error) {
        console.error('❌ Error loading attractions:', error);
        showLoadingState(false);

        // Fallback to hardcoded data if JSON fails
        appState.attractions = getFallbackAttractions();
        appState.filteredAttractions = [...appState.attractions];

        return appState.attractions;
    }
}

// Fallback attractions data
function getFallbackAttractions() {
    return [
        {
            id: 1,
            name: "Secret Rooftop Garden",
            category: "Nature",
            description: "Hidden oasis above the city with panoramic views and exotic plants.",
            location: "Palermo, Buenos Aires",
            cost: "Free",
            accessibility: "Medium",
            image: "images/attractions/secret-rooftop-garden.webp",
            rating: 4.8,
            isLocal: true
        },
        {
            id: 2,
            name: "Underground Art Gallery",
            category: "Culture",
            description: "Former subway tunnel transformed into a vibrant underground art space.",
            location: "San Telmo, Buenos Aires",
            cost: "Low",
            accessibility: "High",
            image: "images/attractions/underground-art-gallery.webp",
            rating: 4.6,
            isLocal: false
        },
        {
            id: 3,
            name: "Historic Clock Tower",
            category: "Architecture",
            description: "19th-century clock tower with original mechanisms still functioning.",
            location: "Monserrat, Buenos Aires",
            cost: "Medium",
            accessibility: "Medium",
            image: "images/attractions/historic-clock-tower.webp",
            rating: 4.5,
            isLocal: true
        }
        // Add more fallback data as needed
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

        container.innerHTML = featured.map(attraction => `
            <div class="attraction-card" data-id="${attraction.id}">
                <div class="card-image">
                    <img src="${attraction.image}" 
                         alt="${attraction.name}"
                         loading="lazy"
                         onerror="this.src='images/placeholder.webp'">
                    <div class="category-badge category-${attraction.category.toLowerCase()}">
                        ${attraction.category}
                    </div>
                </div>
                <div class="card-content">
                    <h3>${attraction.name}</h3>
                    <p class="card-description">${attraction.description}</p>
                    <div class="card-meta">
                        <span class="location">📍 ${attraction.location}</span>
                        <span class="rating">⭐ ${attraction.rating || 4.5}</span>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-primary" onclick="openAttractionModal(${attraction.id})">
                            Learn More
                        </button>
                        <button class="btn btn-outline favorite-btn" onclick="toggleFavorite(${attraction.id})" 
                                data-id="${attraction.id}">
                            ${appState.favorites.has(attraction.id) ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

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

        container.innerHTML = attractions.map(attraction => `
            <div class="attraction-card" data-id="${attraction.id}">
                <div class="card-image">
                    <img src="${attraction.image}" 
                         alt="${attraction.name}"
                         loading="lazy"
                         onerror="this.src='images/placeholder.webp'">
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
        `).join('');

        console.log(`✅ Displayed ${attractions.length} attractions`);

    } catch (error) {
        console.error('❌ Error displaying attractions:', error);
        container.innerHTML = '<p class="error-message">Failed to load attractions.</p>';
    }
}

// Initialize filters
function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const costFilter = document.getElementById('costFilter');
    const accessibilityFilter = document.getElementById('accessibilityFilter');
    const searchInput = document.getElementById('searchInput');
    const clearFiltersBtn = document.getElementById('clearFilters');

    // Add event listeners
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

    // Update current filters
    appState.currentFilters = {
        category: categoryFilter?.value || 'all',
        cost: costFilter?.value || 'all',
        accessibility: accessibilityFilter?.value || 'all',
        search: searchInput?.value.toLowerCase() || ''
    };

    // Filter attractions
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

    // Update display
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

    // Update stat displays
    const statElements = {
        gems: document.getElementById('totalGems'),
        categories: document.getElementById('totalCategories'),
        favorites: document.getElementById('totalFavorites')
    };

    if (statElements.gems) statElements.gems.textContent = stats.totalGems;
    if (statElements.categories) statElements.categories.textContent = stats.categories;
    if (statElements.favorites) statElements.favorites.textContent = stats.favorites;
}

// Show loading state
function showLoadingState(show) {
    const loadingElements = document.querySelectorAll('.loading-spinner, .loading-message');
    const contentElements = document.querySelectorAll('.main-content');

    loadingElements.forEach(el => {
        el.style.display = show ? 'block' : 'none';
    });

    contentElements.forEach(el => {
        el.style.display = show ? 'none' : 'block';
    });

    appState.isLoading = show;
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
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
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
        // Mock weather data for Buenos Aires
        const weatherData = {
            temperature: 22,
            condition: 'Partly Cloudy',
            humidity: 65,
            windSpeed: 13
        };

        weatherWidget.innerHTML = `
            <div class="weather-info">
                <div class="weather-temp">${weatherData.temperature}°C</div>
                <div class="weather-condition">${weatherData.condition}</div>
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

    // Save to localStorage
    try {
        localStorage.setItem('hiddenGemsFavorites', JSON.stringify([...appState.favorites]));
    } catch (error) {
        console.error('Error saving favorites:', error);
    }

    // Update UI
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

    // ESC key to close modal
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
        <div class="modal-image">
            <img src="${attraction.image}" alt="${attraction.name}" onerror="this.src='images/placeholder.webp'">
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
    const favoriteBtn = modalContent.querySelector('.btn-primary');
    if (favoriteBtn) {
        favoriteBtn.innerHTML = appState.favorites.has(attractionId) ?
            '❤️ Remove from Favorites' : '🤍 Add to Favorites';
    }
}

// Show error message
function showErrorMessage(message) {
    console.error('Error:', message);
    // You can implement a toast notification here
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
    // About page specific functionality can go here
}

// Initialize thank you page
function initializeThankYouPage() {
    console.log('🙏 Initializing thank you page...');

    // Display submitted form data if available
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
            </div>
        </div>
    `;
}

// Export functions for global access
window.toggleFavorite = toggleFavorite;
window.openAttractionModal = openAttractionModal;
window.closeModal = closeModal;
window.updateModalFavoriteBtn = updateModalFavoriteBtn;
window.clearAllFilters = clearAllFilters;
window.filterByCategory = filterByCategory;