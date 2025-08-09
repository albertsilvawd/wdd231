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
            default:
                await initGeneralFeatures();
        }

        initNavigationHighlight();
        initResponsiveMenu();
        updateFooterYear();

        console.log('Hidden Gems Explorer - Initialization complete!');
    } catch (error) {
        console.error('Error during initialization:', error);
        initNavigationHighlight();
        initResponsiveMenu();
        updateFooterYear();
    }
});

// Get current page identifier
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('attractions.html')) return 'attractions';
    if (path.includes('about.html')) return 'about';
    if (path.includes('thankyou.html')) return 'thankyou';
    return 'index';
}

// Initialize Home Page
async function initHomePage() {
    console.log('Initializing Home Page...');
    await loadWeatherData();
    await loadFeaturedAttractions();
    initNewsletterForm();
}

// Initialize Attractions Page  
async function initAttractionsPage() {
    console.log('Initializing Attractions Page...');
    await loadAttractionsData();
    initFilters();
    initSorting();
    initPagination();
    initSearch();
    displayAttractions();
}

// Initialize About Page
async function initAboutPage() {
    console.log('Initializing About Page...');
    await loadCountryInfo();
    initContactForm();
}

// Get demo attractions data
function getDemoAttractionsData() {
    return {
        attractions: [
            {
                id: 1,
                name: "Secret Rooftop Garden",
                category: "Nature",
                description: "Hidden oasis above the city with panoramic views and exotic plants.",
                image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop",
                rating: 4.8,
                difficulty: "Easy",
                location: "Palermo, Buenos Aires",
                coordinates: "-34.5731,-58.4264",
                tags: ["peaceful", "photography", "sunset", "garden"],
                bestTime: "Late afternoon for best lighting"
            },
            {
                id: 2,
                name: "Underground Art Gallery",
                category: "Culture",
                description: "Subterranean art space showcasing local artists in converted subway tunnels.",
                image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
                rating: 4.6,
                difficulty: "Medium",
                location: "San Telmo, Buenos Aires",
                coordinates: "-34.6158,-58.3731",
                tags: ["art", "underground", "local", "creative"],
                bestTime: "Weekday evenings when less crowded"
            },
            {
                id: 3,
                name: "Vintage Bookstore Café",
                category: "Culture",
                description: "Charming bookstore with hidden reading nooks and artisanal coffee.",
                image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=300&fit=crop",
                rating: 4.7,
                difficulty: "Easy",
                location: "Recoleta, Buenos Aires",
                coordinates: "-34.5875,-58.3974",
                tags: ["books", "coffee", "cozy", "literary"],
                bestTime: "Morning hours for quiet reading"
            },
            {
                id: 4,
                name: "Hidden Tango Milonga",
                category: "Entertainment",
                description: "Secret tango venue where locals dance authentic Argentine tango.",
                image: "https://images.unsplash.com/photo-1551794144-7f4fcaf3a4c8?w=500&h=300&fit=crop",
                rating: 4.9,
                difficulty: "Medium",
                location: "La Boca, Buenos Aires",
                coordinates: "-34.6345,-58.3645",
                tags: ["tango", "music", "dance", "authentic"],
                bestTime: "Friday and Saturday nights"
            },
            {
                id: 5,
                name: "Artisan Food Market",
                category: "Food",
                description: "Local producers showcase organic ingredients and traditional recipes.",
                image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=300&fit=crop",
                rating: 4.5,
                difficulty: "Easy",
                location: "Villa Crespo, Buenos Aires",
                coordinates: "-34.5989,-58.4456",
                tags: ["food", "local", "organic", "market"],
                bestTime: "Saturday mornings"
            },
            {
                id: 6,
                name: "Historic Architecture Tour",
                category: "Architecture",
                description: "Self-guided walking tour through colonial buildings and Belle Époque mansions.",
                image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=300&fit=crop",
                rating: 4.4,
                difficulty: "Medium",
                location: "Monserrat, Buenos Aires",
                coordinates: "-34.6118,-58.3856",
                tags: ["architecture", "history", "walking", "colonial"],
                bestTime: "Weekday afternoons"
            }
        ]
    };
}

// Load Weather Data
async function loadWeatherData() {
    try {
        const weatherData = await apiService.getWeatherData('Buenos Aires');
        if (weatherData) {
            displayWeatherWidget(weatherData);
        }
    } catch (error) {
        console.error('Error loading weather data:', error);
        displayWeatherError();
    }
}

// Display Weather Widget
function displayWeatherWidget(weather) {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget) return;

    const temperature = Math.round(weather.main.temp);
    const description = weather.weather[0].description;

    weatherWidget.innerHTML = `
        <div class="weather-card">
            <div class="weather-info">
                <h3>Buenos Aires</h3>
                <div class="temperature">${temperature}°C</div>
                <div class="description">${description}</div>
                <div class="feels-like">Feels like ${Math.round(weather.main.feels_like)}°C</div>
            </div>
        </div>
    `;
}

// Display Weather Error
function displayWeatherError() {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget) return;

    weatherWidget.innerHTML = `
        <div class="weather-error">
            <p>Weather data temporarily unavailable</p>
        </div>
    `;
}

// Load Featured Attractions
async function loadFeaturedAttractions() {
    try {
        let attractionsData;

        try {
            attractionsData = await apiService.getAttractionsData();
        } catch (error) {
            attractionsData = getDemoAttractionsData();
        }

        if (attractionsData && attractionsData.attractions) {
            const featured = attractionsData.attractions.slice(0, 3);
            displayFeaturedAttractions(featured);
            updateStatsCounters(attractionsData.attractions);
        }
    } catch (error) {
        console.error('Error loading featured attractions:', error);
        const demoData = getDemoAttractionsData();
        const featured = demoData.attractions.slice(0, 3);
        displayFeaturedAttractions(featured);
        updateStatsCounters(demoData.attractions);
    }
}

// Update stats counters
function updateStatsCounters(attractions) {
    const hiddenGemsCounter = document.querySelector('[data-counter="hidden-gems"]');
    if (hiddenGemsCounter) {
        animateCounter(hiddenGemsCounter, attractions.length);
    }

    const categories = [...new Set(attractions.map(a => a.category))];
    const categoriesCounter = document.querySelector('[data-counter="categories"]');
    if (categoriesCounter) {
        animateCounter(categoriesCounter, categories.length);
    }

    const favorites = storageService.getItem('favorites') || [];
    const favoritesCounter = document.querySelector('[data-counter="favorites"]');
    if (favoritesCounter) {
        animateCounter(favoritesCounter, favorites.length);
    }
}

// Animate counter
function animateCounter(element, targetValue) {
    let currentValue = 0;
    const increment = targetValue / 60;

    const updateCounter = () => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            element.textContent = targetValue;
        } else {
            element.textContent = Math.floor(currentValue);
            requestAnimationFrame(updateCounter);
        }
    };

    updateCounter();
}

// Display Featured Attractions
function displayFeaturedAttractions(attractions) {
    const container = document.getElementById('featured-attractions');
    if (!container) return;

    container.innerHTML = attractions.map(attraction => `
        <div class="featured-card">
            <div class="featured-image">
                <img src="${attraction.image}" alt="${attraction.name}" loading="lazy">
                <div class="category-badge ${attraction.category.toLowerCase()}">${attraction.category}</div>
            </div>
            <div class="featured-content">
                <h3>${attraction.name}</h3>
                <p>${attraction.description.substring(0, 100)}...</p>
                <div class="featured-meta">
                    <span class="rating">⭐ ${attraction.rating}</span>
                    <span class="location">📍 ${attraction.location}</span>
                </div>
                <a href="attractions.html" class="explore-btn">Explore More</a>
            </div>
        </div>
    `).join('');
}

// Load Attractions Data
async function loadAttractionsData() {
    try {
        let data;
        try {
            data = await apiService.getAttractionsData();
        } catch (error) {
            data = getDemoAttractionsData();
        }

        if (data && data.attractions) {
            state.attractions = data.attractions;
            state.filteredAttractions = [...state.attractions];
            console.log(`Loaded ${state.attractions.length} attractions`);
        }
    } catch (error) {
        console.error('Error loading attractions data:', error);
        const demoData = getDemoAttractionsData();
        state.attractions = demoData.attractions;
        state.filteredAttractions = [...state.attractions];
    }
}

// Display Attractions
function displayAttractions() {
    const container = document.getElementById('attractions-grid');
    if (!container) return;

    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const pageAttractions = state.filteredAttractions.slice(startIndex, endIndex);

    if (pageAttractions.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>No attractions found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }

    container.innerHTML = pageAttractions.map(attraction => `
        <div class="attraction-card">
            <div class="attraction-image">
                <img src="${attraction.image}" alt="${attraction.name}" loading="lazy">
                <div class="category-badge ${attraction.category.toLowerCase()}">${attraction.category}</div>
                <button class="favorite-btn" data-id="${attraction.id}">♡</button>
            </div>
            <div class="attraction-content">
                <h3>${attraction.name}</h3>
                <p>${attraction.description}</p>
                <div class="attraction-meta">
                    <span class="rating">⭐ ${attraction.rating}</span>
                    <span class="difficulty">${attraction.difficulty || 'Easy'}</span>
                </div>
                <div class="attraction-location">
                    <span>📍 ${attraction.location}</span>
                </div>
                <div class="attraction-tags">
                    ${attraction.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="attraction-actions">
                    <button class="details-btn" data-id="${attraction.id}">View Details</button>
                    <button class="directions-btn" data-coords="${attraction.coordinates}">Get Directions</button>
                </div>
            </div>
        </div>
    `).join('');

    initAttractionCards();
    updatePaginationInfo();
}

// Initialize Filters
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const category = e.target.dataset.category;
            applyFilter(category);
        });
    });
}

// Apply Filter
function applyFilter(category) {
    state.currentFilter = category;
    state.currentPage = 1;

    if (category === 'all') {
        state.filteredAttractions = [...state.attractions];
    } else {
        state.filteredAttractions = state.attractions.filter(
            attraction => attraction.category.toLowerCase() === category.toLowerCase()
        );
    }

    displayAttractions();
    updatePagination();
}

// Initialize Sorting
function initSorting() {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', (e) => {
        applySorting(e.target.value);
    });
}

// Apply Sorting
function applySorting(sortBy) {
    state.currentSort = sortBy;

    switch (sortBy) {
        case 'name':
            state.filteredAttractions.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            state.filteredAttractions.sort((a, b) => b.rating - a.rating);
            break;
        case 'category':
            state.filteredAttractions.sort((a, b) => a.category.localeCompare(b.category));
            break;
    }

    displayAttractions();
}

// Initialize Search
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });
}

// Perform Search
function performSearch(query) {
    if (!query.trim()) {
        applyFilter(state.currentFilter);
        return;
    }

    const searchTerm = query.toLowerCase();
    state.filteredAttractions = state.attractions.filter(attraction =>
        attraction.name.toLowerCase().includes(searchTerm) ||
        attraction.description.toLowerCase().includes(searchTerm) ||
        attraction.location.toLowerCase().includes(searchTerm) ||
        attraction.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    state.currentPage = 1;
    displayAttractions();
    updatePagination();
}

// Initialize Pagination
function initPagination() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreAttractions);
    }
    updatePagination();
}

// Load More Attractions
function loadMoreAttractions() {
    state.currentPage++;
    displayAttractions();
    updatePagination();
}

// Update Pagination
function updatePagination() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!loadMoreBtn) return;

    const totalPages = Math.ceil(state.filteredAttractions.length / state.itemsPerPage);
    const hasMore = state.currentPage < totalPages;

    loadMoreBtn.style.display = hasMore ? 'block' : 'none';
    updatePaginationInfo();
}

// Update Pagination Info
function updatePaginationInfo() {
    const paginationInfo = document.getElementById('pagination-info');
    if (!paginationInfo) return;

    const startIndex = (state.currentPage - 1) * state.itemsPerPage + 1;
    const endIndex = Math.min(state.currentPage * state.itemsPerPage, state.filteredAttractions.length);
    const total = state.filteredAttractions.length;

    paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${total} attractions`;
}

// Initialize Attraction Cards
function initAttractionCards() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleFavorite(btn.dataset.id, btn);
        });
    });

    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showAttractionDetails(btn.dataset.id);
        });
    });

    document.querySelectorAll('.directions-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openDirections(btn.dataset.coords);
        });
    });
}

// Toggle Favorite
function toggleFavorite(attractionId, button) {
    const favorites = storageService.getItem('favorites') || [];
    const isFavorite = favorites.includes(attractionId);

    if (isFavorite) {
        const index = favorites.indexOf(attractionId);
        favorites.splice(index, 1);
        button.textContent = '♡';
    } else {
        favorites.push(attractionId);
        button.textContent = '♥';
    }

    storageService.setItem('favorites', favorites);
}

// Show Attraction Details
function showAttractionDetails(attractionId) {
    const attraction = state.attractions.find(a => a.id == attractionId);
    if (!attraction) return;

    alert(`${attraction.name}\n\n${attraction.description}\n\nRating: ${attraction.rating}/5\nLocation: ${attraction.location}`);
}

// Open Directions
function openDirections(coordinates) {
    if (!coordinates) {
        alert('Location coordinates not available');
        return;
    }

    const [lat, lng] = coordinates.split(',');
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(mapsUrl, '_blank');
}

// Load Country Info
async function loadCountryInfo() {
    try {
        const countryData = [{
            name: { common: 'Argentina' },
            capital: ['Buenos Aires'],
            population: 45376763,
            region: 'South America',
            languages: { spa: 'Spanish' },
            currencies: { ARS: { name: 'Argentine peso' } },
            flags: { svg: 'https://flagcdn.com/ar.svg' }
        }];

        displayCountryInfo(countryData[0]);
    } catch (error) {
        console.error('Error loading country info:', error);
    }
}

// Display Country Info
function displayCountryInfo(country) {
    const container = document.getElementById('country-info');
    if (!container) return;

    container.innerHTML = `
        <div class="country-card">
            <div class="country-flag">
                <img src="${country.flags.svg}" alt="${country.name.common} flag" loading="lazy">
            </div>
            <div class="country-details">
                <h3>${country.name.common}</h3>
                <div class="country-stats">
                    <div class="stat"><strong>Capital:</strong> ${country.capital[0]}</div>
                    <div class="stat"><strong>Population:</strong> ${country.population.toLocaleString()}</div>
                    <div class="stat"><strong>Languages:</strong> ${Object.values(country.languages).join(', ')}</div>
                    <div class="stat"><strong>Currency:</strong> ${Object.values(country.currencies)[0].name}</div>
                    <div class="stat"><strong>Region:</strong> ${country.region}</div>
                </div>
            </div>
        </div>
    `;
}

// Initialize Forms
function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;

        if (email && email.includes('@')) {
            alert('Successfully subscribed to newsletter!');
            form.reset();
        } else {
            alert('Please enter a valid email address');
        }
    });
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        if (data.name && data.email && data.message) {
            window.location.href = 'thankyou.html';
        } else {
            alert('Please fill in all required fields');
        }
    });
}

// Navigation and UI
function initNavigationHighlight() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = getCurrentPage();

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (
            (currentPage === 'index' && (href === 'index.html' || href === '/')) ||
            (currentPage === 'attractions' && href.includes('attractions.html')) ||
            (currentPage === 'about' && href.includes('about.html'))
        ) {
            link.classList.add('active');
        }
    });
}

function initResponsiveMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }
}

async function initGeneralFeatures() {
    console.log('Initializing general features...');
}

function updateFooterYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Export for global access
window.hiddenGemsApp = {
    state,
    loadMoreAttractions,
    toggleFavorite,
    showAttractionDetails,
    openDirections
};