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
    isLoading: false
};

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Hidden Gems Explorer - Initializing...');

    try {
        const currentPage = getCurrentPage();
        console.log('Current page detected:', currentPage);

        // Initialize common features first
        initNavigationHighlight();
        initResponsiveMenu();
        updateFooterYear();
        updateLastModified();

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
    }
});

// Get current page identifier
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('attractions.html')) return 'attractions';
    if (path.includes('about.html')) return 'about';
    if (path.includes('thankyou.html')) return 'thankyou';
    if (path.includes('index.html') || path.endsWith('/')) return 'index';
    return 'index';
}

// Initialize Home Page
async function initHomePage() {
    console.log('Initializing Home Page...');

    // Load data
    await loadWeatherData();
    await loadFeaturedAttractions();
    await loadCategories();
    await loadCountryStats();

    // Initialize search functionality
    initHomeSearch();

    // Update stats counters
    updateHomeStats();
}

// Initialize Home Search
function initHomeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
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
    }
}

// Load Weather Data
async function loadWeatherData() {
    const weatherWidget = document.querySelector('.weather-widget');
    if (!weatherWidget) return;

    try {
        const weatherData = await apiService.getWeatherData('Buenos Aires');
        displayWeatherWidget(weatherData);
    } catch (error) {
        console.error('Error loading weather data:', error);
        displayWeatherError();
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
}

// Display Weather Error
function displayWeatherError() {
    const tempElement = document.getElementById('currentTemp');
    const descElement = document.getElementById('weatherDesc');

    if (tempElement) tempElement.textContent = '--°C';
    if (descElement) descElement.textContent = 'Weather unavailable';
}

// Load Featured Attractions
async function loadFeaturedAttractions() {
    const container = document.getElementById('featuredGemsGrid');
    if (!container) return;

    try {
        const data = await apiService.getAttractionsData();
        const featured = data.attractions.slice(0, 3);
        displayFeaturedAttractions(featured);
    } catch (error) {
        console.error('Error loading featured attractions:', error);
        container.innerHTML = '<p>Unable to load attractions</p>';
    }
}

// Display Featured Attractions
function displayFeaturedAttractions(attractions) {
    const container = document.getElementById('featuredGemsGrid');
    if (!container) return;

    container.innerHTML = attractions.map(attraction => `
        <div class="gem-card">
            <div class="gem-image">
                <span style="font-size: 3rem;">🏛️</span>
            </div>
            <div class="gem-content">
                <h3>${attraction.name}</h3>
                <span class="gem-category">${attraction.category}</span>
                <p class="gem-description">${attraction.description.substring(0, 100)}...</p>
                <div class="gem-location">📍 ${attraction.location}</div>
                <div class="gem-actions">
                    <a href="attractions.html" class="learn-more-btn">Learn More</a>
                    <button class="favorite-btn" data-id="${attraction.id}">❤️</button>
                </div>
            </div>
        </div>
    `).join('');

    // Initialize favorite buttons
    container.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleFavorite(btn.dataset.id, btn);
        });
    });
}

// Load Categories
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
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load Country Stats
async function loadCountryStats() {
    const container = document.getElementById('countryStats');
    if (!container) return;

    try {
        const countryData = await apiService.getCountryInfo('Argentina');
        displayCountryStats(countryData[0]);
    } catch (error) {
        console.error('Error loading country stats:', error);
        container.innerHTML = '<p>Unable to load country information</p>';
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

// Update Home Stats
function updateHomeStats() {
    apiService.getAttractionsData().then(data => {
        const totalGemsElement = document.getElementById('totalGems');
        const totalCategoriesElement = document.getElementById('totalCategories');
        const favoriteCountElement = document.getElementById('favoriteCount');

        if (totalGemsElement) {
            totalGemsElement.textContent = data.attractions.length;
        }

        if (totalCategoriesElement) {
            totalCategoriesElement.textContent = data.categories.length;
        }

        if (favoriteCountElement) {
            const favorites = storageService.getItem('favorites') || [];
            favoriteCountElement.textContent = favorites.length;
        }
    }).catch(error => {
        console.error('Error updating stats:', error);
    });
}

// Initialize Attractions Page
async function initAttractionsPage() {
    console.log('Initializing Attractions Page...');

    await loadAllAttractions();
    initFilters();
    initAttractionsSearch();
    updateTotalGemsCount();

    // Check for search query from URL
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
}

// Load All Attractions
async function loadAllAttractions() {
    const container = document.getElementById('attractionsGrid');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading hidden gems...</div>';

    try {
        const data = await apiService.getAttractionsData();
        state.attractions = data.attractions;
        state.filteredAttractions = [...state.attractions];
        displayAttractions();
    } catch (error) {
        console.error('Error loading attractions:', error);
        container.innerHTML = '<p>Unable to load attractions. Please try again later.</p>';
    }
}

// Display Attractions
function displayAttractions() {
    const container = document.getElementById('attractionsGrid');
    if (!container) return;

    if (state.filteredAttractions.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>No attractions found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        updateResultsCount(0);
        return;
    }

    container.innerHTML = state.filteredAttractions.map(attraction => `
        <div class="gem-card">
            <div class="gem-image">
                <span style="font-size: 3rem;">🏛️</span>
                <span class="gem-category">${attraction.category}</span>
            </div>
            <div class="gem-content">
                <h3>${attraction.name}</h3>
                <p class="gem-description">${attraction.description.substring(0, 150)}...</p>
                <div class="gem-location">📍 ${attraction.location}</div>
                <div class="gem-meta">
                    <span>Cost: ${attraction.cost}</span>
                    <span>⭐ ${attraction.rating}</span>
                </div>
                <div class="gem-actions">
                    <button class="learn-more-btn" onclick="showAttractionDetails(${attraction.id})">View Details</button>
                    <button class="favorite-btn" data-id="${attraction.id}" onclick="toggleFavorite('${attraction.id}', this)">❤️</button>
                </div>
            </div>
        </div>
    `).join('');

    updateResultsCount(state.filteredAttractions.length);
    updateFavoritesDisplay();
}

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

// Apply Filters
function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const cost = document.getElementById('costFilter').value;
    const accessibility = document.getElementById('accessibilityFilter').value;

    state.filteredAttractions = state.attractions.filter(attraction => {
        const categoryMatch = !category || attraction.category === category;
        const costMatch = !cost || attraction.cost === cost;
        const accessibilityMatch = !accessibility || attraction.accessibility === accessibility;

        return categoryMatch && costMatch && accessibilityMatch;
    });

    displayAttractions();
}

// Clear Filters
function clearFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('costFilter').value = '';
    document.getElementById('accessibilityFilter').value = '';
    document.getElementById('attractionSearch').value = '';

    state.filteredAttractions = [...state.attractions];
    displayAttractions();
}

// Initialize Attractions Search
function initAttractionsSearch() {
    const searchInput = document.getElementById('attractionSearch');
    const searchButton = document.getElementById('searchGemsBtn');

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            performSearch(searchInput.value);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }
}

// Perform Search
function performSearch(query) {
    if (!query.trim()) {
        state.filteredAttractions = [...state.attractions];
    } else {
        const searchTerm = query.toLowerCase();
        state.filteredAttractions = state.attractions.filter(attraction =>
            attraction.name.toLowerCase().includes(searchTerm) ||
            attraction.description.toLowerCase().includes(searchTerm) ||
            attraction.location.toLowerCase().includes(searchTerm) ||
            attraction.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    displayAttractions();
}

// Show Favorites
function showFavorites() {
    const favorites = storageService.getItem('favorites') || [];

    if (favorites.length === 0) {
        alert('You have no favorites yet. Click the heart icon on attractions to add them to your favorites.');
        return;
    }

    state.filteredAttractions = state.attractions.filter(attraction =>
        favorites.includes(attraction.id.toString())
    );

    displayAttractions();
}

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
        totalGemsCount.textContent = `${state.attractions.length}+`;
    }
}

// Update Favorites Display
function updateFavoritesDisplay() {
    const favorites = storageService.getItem('favorites') || [];
    const favoritesCount = document.getElementById('favoritesCount');

    if (favoritesCount) {
        favoritesCount.textContent = favorites.length;
    }

    // Update favorite buttons state
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        if (favorites.includes(btn.dataset.id)) {
            btn.classList.add('active');
            btn.textContent = '❤️';
        } else {
            btn.classList.remove('active');
            btn.textContent = '🤍';
        }
    });
}

// Show Attraction Details (Global function)
window.showAttractionDetails = function (attractionId) {
    const attraction = state.attractions.find(a => a.id === attractionId);
    if (!attraction) return;

    const modal = document.getElementById('attractionModal');
    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');

    if (modal && modalBody && modalTitle) {
        modalTitle.textContent = attraction.name;

        modalBody.innerHTML = `
            <div class="modal-gem-image">
                <span style="font-size: 4rem;">🏛️</span>
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
                    <strong>Best Time to Visit:</strong> ${attraction.bestTime}
                </div>
                <div class="modal-detail-item">
                    <strong>Tips:</strong> ${attraction.tips}
                </div>
                <div class="modal-detail-item">
                    <strong>Historical Info:</strong> ${attraction.historicalInfo}
                </div>
            </div>
        `;

        modal.showModal();

        // Close button functionality
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => modal.close();
        }

        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.close();
            }
        });
    }
};

// Toggle Favorite (Global function)
window.toggleFavorite = function (attractionId, button) {
    let favorites = storageService.getItem('favorites') || [];
    const idString = attractionId.toString();

    if (favorites.includes(idString)) {
        favorites = favorites.filter(id => id !== idString);
        button.classList.remove('active');
        button.textContent = '🤍';
    } else {
        favorites.push(idString);
        button.classList.add('active');
        button.textContent = '❤️';
    }

    storageService.setItem('favorites', favorites);
    updateFavoritesDisplay();

    // Update home page counter if on home page
    const favoriteCount = document.getElementById('favoriteCount');
    if (favoriteCount) {
        favoriteCount.textContent = favorites.length;
    }
};

// Initialize About Page
async function initAboutPage() {
    console.log('Initializing About Page...');

    // Update stats
    updateAboutStats();

    // Initialize contact form
    initContactForm();

    // Update visitor count
    updateVisitorCount();
}

// Update About Stats
function updateAboutStats() {
    apiService.getAttractionsData().then(data => {
        const totalGemsElement = document.getElementById('aboutTotalGems');
        if (totalGemsElement) {
            totalGemsElement.textContent = `${data.attractions.length}+`;
        }
    }).catch(error => {
        console.error('Error updating about stats:', error);
    });
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

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Store form data
        storageService.setItem('lastSubmission', data);

        // Redirect to thank you page
        window.location.href = 'thankyou.html';
    });
}

// Initialize Thank You Page
function initThankYouPage() {
    const submission = storageService.getItem('lastSubmission');

    if (submission) {
        const elements = {
            submitterName: submission.name,
            submitterEmail: submission.email,
            gemName: submission.gemName,
            gemCategory: submission.category,
            gemLocation: submission.location,
            submissionDate: new Date().toLocaleDateString()
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || '-';
            }
        });
    }
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
    }
}

function initNavigationHighlight() {
    const currentPage = getCurrentPage();
    const navLinks = document.querySelectorAll('.main-nav a');

    navLinks.forEach(link => {
        link.classList.remove('active');
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
    const yearElement = document.querySelector('.footer-bottom p');
    if (yearElement) {
        const year = new Date().getFullYear();
        yearElement.innerHTML = yearElement.innerHTML.replace('2024', year);
    }
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

async function initGeneralFeatures() {
    console.log('Initializing general features...');

    // Initialize video link
    const videoLink = document.getElementById('videoLink');
    if (videoLink) {
        videoLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Video demo will be available soon!');
        });
    }
}