// Hidden Gems Explorer - Main JavaScript Module
// Albert Silva - WDD 231 Final Project

import { apiService } from './modules/api.js';
import { storageService } from './modules/storage.js';
import { uiHelpers } from './modules/ui-helpers.js';

// Global state management
const state = {
    attractions: [],
    filteredAttractions: [],
    currentPage: 1,
    itemsPerPage: 6,
    currentFilter: 'all',
    currentSort: 'name',
    isLoading: false,
    weather: null,
    countryInfo: null
};

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Hidden Gems Explorer - Initializing...');

    try {
        const currentPage = getCurrentPage();
        console.log('Current page detected:', currentPage);

        // Initialize common features first
        await initCommonFeatures();

        switch (currentPage) {
            case 'index':
                await initHomePage();
                break;
            case 'attractions':
                await initAttractionsPage();
                break;
            case 'about':
                await initAboutPage();
                break;
            case 'thankyou':
                initThankYouPage();
                break;
            default:
                await initGeneralFeatures();
        }

        console.log('Hidden Gems Explorer - Initialization complete!');
    } catch (error) {
        console.error('Error during initialization:', error);
        uiHelpers.showToast('Error loading page. Please refresh.', 'error');
    }
});

// Initialize common features across all pages
async function initCommonFeatures() {
    initNavigationHighlight();
    initResponsiveMenu();
    updateFooterYear();
    updateLastModified();
    initVideoLink();

    // Track page view for analytics
    if (typeof storageService !== 'undefined') {
        const analytics = storageService.getItem('analytics') || [];
        analytics.push({
            page: getCurrentPage(),
            timestamp: Date.now(),
            userAgent: navigator.userAgent.substring(0, 100)
        });
        // Keep only last 50 analytics entries
        if (analytics.length > 50) analytics.splice(0, analytics.length - 50);
        storageService.setItem('analytics', analytics);
    }
}

// Get current page identifier
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('attractions.html')) return 'attractions';
    if (path.includes('about.html')) return 'about';
    if (path.includes('thankyou.html')) return 'thankyou';
    if (path.includes('attributions.html')) return 'attributions';
    if (path.includes('index.html') || path.endsWith('/') || path.includes('final/')) return 'index';
    return 'index';
}

// Initialize Home Page
async function initHomePage() {
    console.log('Initializing Home Page...');

    try {
        // Load data with error handling
        await Promise.allSettled([
            loadWeatherData(),
            loadFeaturedAttractions(),
            loadCategories(),
            loadCountryStats()
        ]);

        // Initialize search functionality
        initHomeSearch();

        // Update stats counters
        updateHomeStats();

        // Initialize scroll animations
        initScrollAnimations();

    } catch (error) {
        console.error('Error initializing home page:', error);
    }
}

// Initialize Home Search
function initHomeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                // Store search in local storage
                const searches = storageService.getItem('recentSearches') || [];
                searches.unshift(query);
                if (searches.length > 10) searches.pop();
                storageService.setItem('recentSearches', searches);

                window.location.href = `attractions.html?search=${encodeURIComponent(query)}`;
            } else {
                window.location.href = 'attractions.html';
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });

        // Add autocomplete from recent searches
        const recentSearches = storageService.getItem('recentSearches') || [];
        if (recentSearches.length > 0 && searchInput) {
            searchInput.setAttribute('list', 'recent-searches');
            const datalist = document.createElement('datalist');
            datalist.id = 'recent-searches';
            recentSearches.forEach(search => {
                const option = document.createElement('option');
                option.value = search;
                datalist.appendChild(option);
            });
            searchInput.parentNode.appendChild(datalist);
        }
    }
}

// Load Weather Data with proper try/catch
async function loadWeatherData() {
    const weatherWidget = document.querySelector('.weather-widget');
    if (!weatherWidget) return;

    try {
        console.log('Fetching weather data...');
        state.weather = await apiService.getWeatherData('Buenos Aires');
        displayWeatherWidget(state.weather);
        console.log('Weather data loaded successfully');
    } catch (error) {
        console.error('Error loading weather data:', error);
        displayWeatherError();
        // Store error for debugging
        storageService.setItem('lastWeatherError', {
            error: error.message,
            timestamp: Date.now()
        });
    }
}

// Display Weather Widget
function displayWeatherWidget(weather) {
    const tempElement = document.getElementById('currentTemp');
    const descElement = document.getElementById('weatherDesc');
    const humidityElement = document.getElementById('humidity');
    const windElement = document.getElementById('windSpeed');

    if (tempElement) {
        const temperature = Math.round(weather.main.temp);
        tempElement.textContent = `${temperature}°C`;
    }

    if (descElement) {
        descElement.textContent = weather.weather[0].description;
    }

    if (humidityElement) {
        humidityElement.textContent = `Humidity: ${weather.main.humidity}%`;
    }

    if (windElement) {
        const windSpeed = Math.round(weather.wind.speed * 3.6); // Convert m/s to km/h
        windElement.textContent = `Wind: ${windSpeed} km/h`;
    }

    // Store weather data for offline use
    storageService.setItem('lastWeatherData', {
        data: weather,
        timestamp: Date.now()
    });
}

// Display Weather Error
function displayWeatherError() {
    const tempElement = document.getElementById('currentTemp');
    const descElement = document.getElementById('weatherDesc');

    if (tempElement) tempElement.textContent = '--°C';
    if (descElement) descElement.textContent = 'Weather unavailable';
}

// Load Featured Attractions with proper error handling
async function loadFeaturedAttractions() {
    const container = document.getElementById('featuredGemsGrid');
    if (!container) return;

    try {
        container.innerHTML = '<div class="loading">Loading featured gems...</div>';

        const data = await apiService.getAttractionsData();
        state.attractions = data.attractions;

        // Get top 3 rated attractions
        const featured = data.attractions
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3);

        displayFeaturedAttractions(featured);
        console.log('Featured attractions loaded successfully');
    } catch (error) {
        console.error('Error loading featured attractions:', error);
        container.innerHTML = '<div class="error">Unable to load attractions. Please try again later.</div>';
    }
}

// Display Featured Attractions with real images
function displayFeaturedAttractions(attractions) {
    const container = document.getElementById('featuredGemsGrid');
    if (!container) return;

    container.innerHTML = attractions.map(attraction => `
        <div class="gem-card" data-id="${attraction.id}">
            <div class="gem-image">
                <img src="images/attractions/${attraction.image}" 
                     alt="${attraction.name}" 
                     loading="lazy" 
                     width="300" 
                     height="200"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="image-fallback" style="display: none;">🏛️</div>
            </div>
            <div class="gem-content">
                <h3>${attraction.name}</h3>
                <span class="gem-category">${attraction.category}</span>
                <p class="gem-description">${attraction.description.substring(0, 100)}...</p>
                <div class="gem-location">📍 ${attraction.location}</div>
                <div class="gem-meta">
                    <span class="gem-cost">Cost: ${attraction.cost}</span>
                    <span class="gem-rating">⭐ ${attraction.rating}</span>
                </div>
                <div class="gem-actions">
                    <a href="attractions.html#attraction-${attraction.id}" class="learn-more-btn">Learn More</a>
                    <button class="favorite-btn" data-id="${attraction.id}" onclick="toggleFavorite('${attraction.id}', this)">
                        ${isFavorite(attraction.id) ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Add click tracking
    container.querySelectorAll('.gem-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.gem-actions')) {
                const attractionId = card.dataset.id;
                window.location.href = `attractions.html#attraction-${attractionId}`;
            }
        });
    });
}

// Load Categories with error handling
async function loadCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;

    try {
        const data = await apiService.getAttractionsData();
        const categories = data.categories || [];

        container.innerHTML = categories.map(category => `
            <a href="attractions.html?category=${encodeURIComponent(category.name)}" class="category-card">
                <span class="category-icon">${category.icon}</span>
                <h3>${category.name}</h3>
                <span class="category-count">${category.count} locations</span>
            </a>
        `).join('');

        // Add hover animations
        container.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                uiHelpers.animateIntoView(card, 'bounce', 600);
            });
        });

    } catch (error) {
        console.error('Error loading categories:', error);
        container.innerHTML = '<div class="error">Unable to load categories</div>';
    }
}

// Load Country Stats with proper error handling
async function loadCountryStats() {
    const container = document.getElementById('countryStats');
    if (!container) return;

    try {
        const countryData = await apiService.getCountryInfo('Argentina');
        state.countryInfo = countryData[0];
        displayCountryStats(countryData[0]);
    } catch (error) {
        console.error('Error loading country stats:', error);
        container.innerHTML = '<div class="error">Unable to load country information</div>';
    }
}

// Display Country Stats
function displayCountryStats(country) {
    const container = document.getElementById('countryStats');
    if (!container) return;

    container.innerHTML = `
        <div class="stat-card">
            <span class="stat-number">${country.capital[0]}</span>
            <span class="stat-label">Capital City</span>
        </div>
        <div class="stat-card">
            <span class="stat-number">${(country.population / 1000000).toFixed(1)}M</span>
            <span class="stat-label">Population</span>
        </div>
        <div class="stat-card">
            <span class="stat-number">${Object.values(country.languages)[0]}</span>
            <span class="stat-label">Primary Language</span>
        </div>
        <div class="stat-card">
            <span class="stat-number">${Object.values(country.currencies)[0].name}</span>
            <span class="stat-label">Currency</span>
        </div>
    `;
}

// Update Home Stats with real data
function updateHomeStats() {
    const totalGemsElement = document.getElementById('totalGems');
    const totalCategoriesElement = document.getElementById('totalCategories');
    const favoriteCountElement = document.getElementById('favoriteCount');

    if (state.attractions.length > 0) {
        if (totalGemsElement) {
            totalGemsElement.textContent = state.attractions.length;
        }
    }

    if (totalCategoriesElement) {
        totalCategoriesElement.textContent = '7';
    }

    if (favoriteCountElement) {
        const favorites = storageService.getItem('favorites') || [];
        favoriteCountElement.textContent = favorites.length;
    }
}

// Initialize Attractions Page
async function initAttractionsPage() {
    console.log('Initializing Attractions Page...');

    try {
        await loadAllAttractions();
        initFilters();
        initAttractionsSearch();
        initModal();
        updateTotalGemsCount();

        // Check for URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        const categoryFilter = urlParams.get('category');

        if (searchQuery) {
            const searchInput = document.getElementById('attractionSearch');
            if (searchInput) {
                searchInput.value = searchQuery;
                performSearch(searchQuery);
            }
        } else if (categoryFilter) {
            const categorySelect = document.getElementById('categoryFilter');
            if (categorySelect) {
                categorySelect.value = categoryFilter;
                applyFilters();
            }
        }

        // Check for anchor to specific attraction
        if (window.location.hash) {
            const attractionId = window.location.hash.replace('#attraction-', '');
            if (attractionId) {
                setTimeout(() => showAttractionDetails(attractionId), 1000);
            }
        }

    } catch (error) {
        console.error('Error initializing attractions page:', error);
    }
}

// Load All Attractions with proper error handling
async function loadAllAttractions() {
    const container = document.getElementById('attractionsGrid');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading hidden gems...</div>';

    try {
        const data = await apiService.getAttractionsData();
        state.attractions = data.attractions;
        state.filteredAttractions = [...state.attractions];
        displayAttractions();
        console.log(`Loaded ${state.attractions.length} attractions successfully`);
    } catch (error) {
        console.error('Error loading attractions:', error);
        container.innerHTML = '<div class="error">Unable to load attractions. Please try again later.</div>';
    }
}

// Display Attractions with real images and lazy loading
function displayAttractions() {
    const container = document.getElementById('attractionsGrid');
    if (!container) return;

    if (state.filteredAttractions.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>No attractions found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button onclick="clearFilters()" class="clear-btn">Clear All Filters</button>
            </div>
        `;
        updateResultsCount(0);
        return;
    }

    container.innerHTML = state.filteredAttractions.map(attraction => `
        <div class="gem-card" data-id="${attraction.id}">
            <div class="gem-image">
                <img src="images/attractions/${attraction.image}" 
                     alt="${attraction.name}" 
                     loading="lazy" 
                     width="300" 
                     height="200"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="image-fallback" style="display: none;">
                    <span style="font-size: 3rem;">🏛️</span>
                </div>
                <span class="gem-category">${attraction.category}</span>
            </div>
            <div class="gem-content">
                <h3>${attraction.name}</h3>
                <p class="gem-description">${attraction.description.substring(0, 150)}...</p>
                <div class="gem-location">📍 ${attraction.location}</div>
                <div class="gem-meta">
                    <span class="gem-cost">Cost: ${attraction.cost}</span>
                    <span class="gem-rating">⭐ ${attraction.rating}</span>
                    <span class="gem-accessibility">♿ ${attraction.accessibility}</span>
                </div>
                <div class="gem-actions">
                    <button class="learn-more-btn" onclick="showAttractionDetails(${attraction.id})">View Details</button>
                    <button class="favorite-btn ${isFavorite(attraction.id) ? 'active' : ''}" 
                            data-id="${attraction.id}" 
                            onclick="toggleFavorite('${attraction.id}', this)">
                        ${isFavorite(attraction.id) ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    updateResultsCount(state.filteredAttractions.length);
    updateFavoritesDisplay();

    // Initialize lazy loading observer
    const images = container.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src; // Trigger loading
                    observer.unobserve(img);
                }
            });
        });
        observer.observe(img);
    });
}

// Initialize Modal Dialog
function initModal() {
    const modal = document.getElementById('attractionModal');
    if (!modal) return;

    // Close button functionality
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.close());
    }

    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.close();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.open) {
            modal.close();
        }
    });
}

// Show Attraction Details (Global function for modal)
window.showAttractionDetails = function (attractionId) {
    const attraction = state.attractions.find(a => a.id == attractionId);
    if (!attraction) {
        uiHelpers.showToast('Attraction not found', 'error');
        return;
    }

    const modal = document.getElementById('attractionModal');
    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');

    if (modal && modalBody && modalTitle) {
        modalTitle.textContent = attraction.name;

        modalBody.innerHTML = `
            <div class="modal-gem-image">
                <img src="images/attractions/${attraction.image}" 
                     alt="${attraction.name}" 
                     loading="lazy" 
                     width="500" 
                     height="300"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="image-fallback" style="display: none;">
                    <span style="font-size: 4rem;">🏛️</span>
                </div>
            </div>
            <div class="modal-gem-details">
                <div class="modal-detail-item">
                    <strong>Category:</strong> ${attraction.category}
                </div>
                <div class="modal-detail-item">
                    <strong>Location:</strong> ${attraction.location}
                </div>
                <div class="modal-detail-item">
                    <strong>Description:</strong> ${attraction.description}
                </div>
                <div class="modal-detail-item">
                    <strong>Cost:</strong> ${attraction.cost}
                </div>
                <div class="modal-detail-item">
                    <strong>Accessibility:</strong> ${attraction.accessibility}
                </div>
                <div class="modal-detail-item">
                    <strong>Rating:</strong> ⭐ ${attraction.rating}/5
                </div>
                <div class="modal-detail-item">
                    <strong>Difficulty:</strong> ${attraction.difficulty}
                </div>
                <div class="modal-detail-item">
                    <strong>Best Time to Visit:</strong> ${attraction.bestTime}
                </div>
                <div class="modal-detail-item">
                    <strong>Tips:</strong> ${attraction.tips}
                </div>
                <div class="modal-detail-item">
                    <strong>Historical Info:</strong> ${attraction.historicalInfo}
                </div>
                <div class="modal-detail-item">
                    <strong>Tags:</strong> ${attraction.tags.join(', ')}
                </div>
            </div>
            <div class="modal-actions">
                <button class="favorite-btn ${isFavorite(attraction.id) ? 'active' : ''}" 
                        onclick="toggleFavorite('${attraction.id}', this)">
                    ${isFavorite(attraction.id) ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                </button>
            </div>
        `;

        modal.showModal();

        // Track modal view
        const views = storageService.getItem('attractionViews') || {};
        views[attraction.id] = (views[attraction.id] || 0) + 1;
        storageService.setItem('attractionViews', views);
    }
};

// Initialize Filters
function initFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const costFilter = document.getElementById('costFilter');
    const accessibilityFilter = document.getElementById('accessibilityFilter');
    const clearButton = document.getElementById('clearFilters');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }

    if (costFilter) {
        costFilter.addEventListener('change', applyFilters);
    }

    if (accessibilityFilter) {
        accessibilityFilter.addEventListener('change', applyFilters);
    }

    if (clearButton) {
        clearButton.addEventListener('click', clearFilters);
    }

    // View Favorites button
    const viewFavoritesBtn = document.getElementById('viewFavorites');
    if (viewFavoritesBtn) {
        viewFavoritesBtn.addEventListener('click', showFavorites);
    }
}

// Apply Filters using array methods
function applyFilters() {
    const category = document.getElementById('categoryFilter')?.value || '';
    const cost = document.getElementById('costFilter')?.value || '';
    const accessibility = document.getElementById('accessibilityFilter')?.value || '';

    state.filteredAttractions = state.attractions.filter(attraction => {
        const categoryMatch = !category || attraction.category === category;
        const costMatch = !cost || attraction.cost === cost;
        const accessibilityMatch = !accessibility || attraction.accessibility === accessibility;

        return categoryMatch && costMatch && accessibilityMatch;
    });

    displayAttractions();

    // Store filter preferences
    storageService.setItem('filterPreferences', {
        category,
        cost,
        accessibility
    });
}

// Clear Filters (Global function)
window.clearFilters = function () {
    const filters = ['categoryFilter', 'costFilter', 'accessibilityFilter', 'attractionSearch'];
    filters.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });

    state.filteredAttractions = [...state.attractions];
    displayAttractions();

    // Clear stored preferences
    storageService.removeItem('filterPreferences');
};

// Initialize Attractions Search
function initAttractionsSearch() {
    const searchInput = document.getElementById('attractionSearch');
    const searchButton = document.getElementById('searchGemsBtn');

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            performSearch(searchInput?.value || '');
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });

        // Add debounced search
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(e.target.value);
            }, 300);
        });
    }
}

// Perform Search using array methods
function performSearch(query) {
    if (!query.trim()) {
        state.filteredAttractions = [...state.attractions];
    } else {
        const searchTerm = query.toLowerCase();
        state.filteredAttractions = state.attractions.filter(attraction =>
            attraction.name.toLowerCase().includes(searchTerm) ||
            attraction.description.toLowerCase().includes(searchTerm) ||
            attraction.location.toLowerCase().includes(searchTerm) ||
            attraction.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            attraction.category.toLowerCase().includes(searchTerm)
        );
    }

    displayAttractions();
}

// Show Favorites using array methods
function showFavorites() {
    const favorites = storageService.getItem('favorites') || [];

    if (favorites.length === 0) {
        uiHelpers.showToast('You have no favorites yet. Click the heart icon on attractions to add them to your favorites.', 'info');
        return;
    }

    state.filteredAttractions = state.attractions.filter(attraction =>
        favorites.includes(attraction.id.toString())
    );

    displayAttractions();
    uiHelpers.showToast(`Showing ${state.filteredAttractions.length} favorite attractions`, 'success');
}

// Check if attraction is favorite
function isFavorite(attractionId) {
    const favorites = storageService.getItem('favorites') || [];
    return favorites.includes(attractionId.toString());
}

// Toggle Favorite (Global function)
window.toggleFavorite = function (attractionId, button) {
    let favorites = storageService.getItem('favorites') || [];
    const idString = attractionId.toString();

    if (favorites.includes(idString)) {
        favorites = favorites.filter(id => id !== idString);
        if (button) {
            button.classList.remove('active');
            button.textContent = button.textContent.includes('Remove') ? '🤍 Add to Favorites' : '🤍';
        }
        uiHelpers.showToast('Removed from favorites', 'info');
    } else {
        favorites.push(idString);
        if (button) {
            button.classList.add('active');
            button.textContent = button.textContent.includes('Add') ? '❤️ Remove from Favorites' : '❤️';
        }
        uiHelpers.showToast('Added to favorites!', 'success');
    }

    storageService.setItem('favorites', favorites);
    updateFavoritesDisplay();

    // Update home page counter if available
    const favoriteCount = document.getElementById('favoriteCount');
    if (favoriteCount) {
        favoriteCount.textContent = favorites.length;
    }
};

// Update Results Count
function updateResultsCount(count) {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = count;
    }
}

// Update Total Gems Count
function updateTotalGemsCount() {
    const totalGemsCount = document.getElementById('totalGemsCount');
    if (totalGemsCount && state.attractions.length > 0) {
        totalGemsCount.textContent = state.attractions.length;
    }
}

// Update Favorites Display
function updateFavoritesDisplay() {
    const favorites = storageService.getItem('favorites') || [];
    const favoritesCount = document.getElementById('favoritesCount');

    if (favoritesCount) {
        favoritesCount.textContent = favorites.length;
    }

    // Update all favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const id = btn.dataset.id;
        if (favorites.includes(id)) {
            btn.classList.add('active');
            if (!btn.textContent.includes('Remove')) {
                btn.textContent = '❤️';
            }
        } else {
            btn.classList.remove('active');
            if (!btn.textContent.includes('Add')) {
                btn.textContent = '🤍';
            }
        }
    });
}

// Initialize About Page
async function initAboutPage() {
    console.log('Initializing About Page...');

    // Update stats
    await updateAboutStats();

    // Initialize contact form
    initContactForm();

    // Update visitor count
    updateVisitorCount();
}

// Update About Stats
async function updateAboutStats() {
    try {
        const data = await apiService.getAttractionsData();
        const totalGemsElement = document.getElementById('aboutTotalGems');
        if (totalGemsElement) {
            totalGemsElement.textContent = `${data.attractions.length}+`;
        }
    } catch (error) {
        console.error('Error updating about stats:', error);
    }
}

// Update Visitor Count
function updateVisitorCount() {
    let visitCount = storageService.getItem('visitCount') || 0;
    visitCount++;
    storageService.setItem('visitCount', visitCount);

    const visitorsServed = document.getElementById('visitorsServed');
    if (visitorsServed) {
        // Simulate a higher number for display
        const displayCount = (visitCount * 47) + 1250;
        visitorsServed.textContent = displayCount.toLocaleString();
    }
}

// Initialize Contact Form
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Add form validation
    const validationRules = {
        name: [
            { type: 'required', message: 'Name is required' },
            { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' }
        ],
        email: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email address' }
        ],
        gemName: [
            { type: 'required', message: 'Hidden gem name is required' },
            { type: 'minLength', value: 3, message: 'Gem name must be at least 3 characters' }
        ],
        category: [
            { type: 'required', message: 'Please select a category' }
        ],
        location: [
            { type: 'required', message: 'Location is required' }
        ],
        description: [
            { type: 'required', message: 'Description is required' },
            { type: 'minLength', value: 10, message: 'Description must be at least 10 characters' }
        ]
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate form
        const validation = uiHelpers.validateForm(form, validationRules);

        if (!validation.isValid) {
            uiHelpers.showToast('Please fix the errors in the form', 'error');
            return;
        }

        // Collect form data
        const formData = new FormData(form);
        const submissionData = {
            name: formData.get('name'),
            email: formData.get('email'),
            gemName: formData.get('gemName'),
            category: formData.get('category'),
            location: formData.get('location'),
            description: formData.get('description'),
            accessibility: formData.get('accessibility') || 'Not specified',
            tips: formData.get('tips') || 'None provided',
            timestamp: new Date().toISOString(),
            id: Date.now()
        };

        // Store submission data
        storageService.setItem('lastSubmission', submissionData);

        // Store in submissions history
        const submissions = storageService.getItem('formSubmissions') || [];
        submissions.unshift(submissionData);
        if (submissions.length > 20) submissions.pop(); // Keep only last 20
        storageService.setItem('formSubmissions', submissions);

        uiHelpers.showToast('Form submitted successfully!', 'success');

        // Redirect to thank you page with URL parameters
        const params = new URLSearchParams(submissionData).toString();
        window.location.href = `thankyou.html?${params}`;
    });
}

// Initialize Thank You Page
function initThankYouPage() {
    console.log('Initializing Thank You Page...');

    // Get data from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    let submissionData = {};

    // Try URL parameters first
    if (urlParams.has('name')) {
        submissionData = {
            name: urlParams.get('name'),
            email: urlParams.get('email'),
            gemName: urlParams.get('gemName'),
            category: urlParams.get('category'),
            location: urlParams.get('location'),
            timestamp: urlParams.get('timestamp') || new Date().toISOString()
        };
    } else {
        // Fallback to localStorage
        submissionData = storageService.getItem('lastSubmission') || {};
    }

    if (submissionData.name) {
        displaySubmissionData(submissionData);
    } else {
        // No submission data found
        document.querySelector('.submission-details').innerHTML = `
            <h3>No Submission Data Found</h3>
            <p>It looks like you arrived here directly. Please submit the form from the About page.</p>
            <a href="about.html" class="primary-btn">Go to About Page</a>
        `;
    }
}

// Display submission data on thank you page
function displaySubmissionData(data) {
    const elements = {
        submitterName: data.name || '-',
        submitterEmail: data.email || '-',
        gemName: data.gemName || '-',
        gemCategory: data.category || '-',
        gemLocation: data.location || '-',
        submissionDate: data.timestamp ? new Date(data.timestamp).toLocaleDateString() : new Date().toLocaleDateString()
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Navigation and UI Functions
function initResponsiveMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mainNav = document.querySelector('.main-nav');

    if (hamburger && mainNav) {
        hamburger.addEventListener('click', () => {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
            hamburger.classList.toggle('active');
            mainNav.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.classList.remove('active');
                mainNav.classList.remove('active');
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.classList.remove('active');
                mainNav.classList.remove('active');
            }
        });
    }
}

function initNavigationHighlight() {
    const currentPage = getCurrentPage();
    const navLinks = document.querySelectorAll('.main-nav a');

    navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');

        const href = link.getAttribute('href');

        if (
            (currentPage === 'index' && href.includes('index.html')) ||
            (currentPage === 'attractions' && href.includes('attractions.html')) ||
            (currentPage === 'about' && href.includes('about.html'))
        ) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

function updateFooterYear() {
    const yearElements = document.querySelectorAll('.footer-bottom p');
    yearElements.forEach(element => {
        if (element.textContent.includes('2024')) {
            const currentYear = new Date().getFullYear();
            element.innerHTML = element.innerHTML.replace('2024', currentYear);
        }
    });
}

function updateLastModified() {
    const lastModifiedElement = document.getElementById('lastModified');
    if (lastModifiedElement) {
        const lastModified = new Date(document.lastModified);
        lastModifiedElement.textContent = lastModified.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function initVideoLink() {
    const videoLink = document.getElementById('videoLink');
    if (videoLink) {
        videoLink.addEventListener('click', (e) => {
            // If it's the placeholder URL, prevent default and show message
            if (videoLink.href.includes('demo-video-id')) {
                e.preventDefault();
                uiHelpers.showToast('Demo video will be available after project completion!', 'info');
            }
            // Otherwise, let the link work normally for real YouTube URLs
        });
    }
}

// Initialize scroll animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.gem-card, .category-card, .stat-card, .mission-item');

    if (animatedElements.length > 0) {
        const observerId = uiHelpers.observeElements('.gem-card, .category-card, .stat-card, .mission-item', (element) => {
            uiHelpers.animateIntoView(element, 'fadeInUp', 600);
        });

        // Store observer ID for cleanup if needed
        storageService.setItem('scrollObserverId', observerId);
    }
}

async function initGeneralFeatures() {
    console.log('Initializing general features...');

    // Any features that should be available on all pages
    initAccessibilityFeatures();
}

function initAccessibilityFeatures() {
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        // Add visual indicator for keyboard navigation
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });

    // Improve focus management for modals
    document.addEventListener('focusin', (e) => {
        const modal = document.querySelector('dialog[open]');
        if (modal && !modal.contains(e.target)) {
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }
    });
}

// Error handling for async operations
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    uiHelpers.showToast('An unexpected error occurred. Please refresh the page.', 'error');

    // Log error for debugging
    const errorLog = storageService.getItem('errorLog') || [];
    errorLog.unshift({
        error: event.reason.toString(),
        timestamp: new Date().toISOString(),
        page: getCurrentPage(),
        userAgent: navigator.userAgent.substring(0, 100)
    });
    if (errorLog.length > 10) errorLog.pop();
    storageService.setItem('errorLog', errorLog);
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);

    // Don't show toast for resource loading errors (images, etc.)
    if (!event.filename.includes('.webp') && !event.filename.includes('.jpg')) {
        uiHelpers.showToast('A page error occurred. Some features may not work properly.', 'warning');
    }
});

// Performance monitoring
window.addEventListener('load', () => {
    // Log page load performance
    if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        const loadTime = perfData.loadEventEnd - perfData.fetchStart;

        console.log(`Page loaded in ${loadTime}ms`);

        // Store performance data
        const perfLog = storageService.getItem('performanceLog') || [];
        perfLog.unshift({
            page: getCurrentPage(),
            loadTime,
            timestamp: new Date().toISOString()
        });
        if (perfLog.length > 20) perfLog.pop();
        storageService.setItem('performanceLog', perfLog);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    // Clean up any observers or intervals
    const observerId = storageService.getItem('scrollObserverId');
    if (observerId) {
        uiHelpers.disconnectObserver(observerId);
    }

    // Save any pending analytics data
    const analytics = storageService.getItem('analytics') || [];
    if (analytics.length > 0) {
        // In a real app, you might send this to an analytics service
        console.log('Analytics data ready for transmission:', analytics.length, 'events');
    }
});

// Service Worker registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for use in other modules if needed
export {
    state,
    getCurrentPage,
    updateFavoritesDisplay,
    showAttractionDetails,
    toggleFavorite,
    clearFilters
};