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

    // Initialize based on current page
    const currentPage = getCurrentPage();

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
            console.log('Unknown page, applying general initialization');
            await initGeneralFeatures();
    }

    // Initialize common features for all pages
    initNavigationHighlight();
    initResponsiveMenu();
    updateFooterYear();

    console.log('Hidden Gems Explorer - Initialization complete!');
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

    // Load weather data
    await loadWeatherData();

    // Load featured attractions
    await loadFeaturedAttractions();

    // Initialize newsletter form
    initNewsletterForm();

    // Initialize hero carousel if exists
    initHeroCarousel();
}

// Initialize Attractions Page  
async function initAttractionsPage() {
    console.log('Initializing Attractions Page...');

    // Load all attractions data
    await loadAttractionsData();

    // Initialize filters and sorting
    initFilters();
    initSorting();

    // Initialize pagination
    initPagination();

    // Initialize search functionality
    initSearch();

    // Display initial attractions
    displayAttractions();
}

// Initialize About Page
async function initAboutPage() {
    console.log('Initializing About Page...');

    // Load country information
    await loadCountryInfo();

    // Initialize contact form
    initContactForm();

    // Initialize team animation
    initTeamAnimation();
}

// Load Weather Data for Home Page
async function loadWeatherData() {
    try {
        uiHelpers.showLoader('#weather-widget');

        const weatherData = await apiService.getWeatherData('Buenos Aires');

        if (weatherData) {
            displayWeatherWidget(weatherData);
            console.log('Weather data loaded successfully');
        }
    } catch (error) {
        console.error('Error loading weather data:', error);
        displayWeatherError();
    } finally {
        uiHelpers.hideLoader('#weather-widget');
    }
}

// Display Weather Widget
function displayWeatherWidget(weather) {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget) return;

    const temperature = Math.round(weather.main.temp);
    const description = weather.weather[0].description;
    const icon = weather.weather[0].icon;

    weatherWidget.innerHTML = `
        <div class="weather-card">
            <div class="weather-icon">
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" 
                     alt="${description}" loading="lazy">
            </div>
            <div class="weather-info">
                <h3>Buenos Aires</h3>
                <div class="temperature">${temperature}°C</div>
                <div class="description">${description}</div>
                <div class="feels-like">
                    Feels like ${Math.round(weather.main.feels_like)}°C
                </div>
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
            <small>Please check back later</small>
        </div>
    `;
}

// Load Featured Attractions for Home Page
async function loadFeaturedAttractions() {
    try {
        const attractionsData = await apiService.getAttractionsData();

        if (attractionsData && attractionsData.attractions) {
            // Get 3 random featured attractions
            const featured = attractionsData.attractions
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            displayFeaturedAttractions(featured);
        }
    } catch (error) {
        console.error('Error loading featured attractions:', error);
    }
}

// Display Featured Attractions
function displayFeaturedAttractions(attractions) {
    const container = document.getElementById('featured-attractions');
    if (!container) return;

    container.innerHTML = attractions.map(attraction => `
        <div class="featured-card" data-aos="fade-up">
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
                <a href="attractions.html#attraction-${attraction.id}" class="explore-btn">
                    Explore More
                </a>
            </div>
        </div>
    `).join('');
}

// Load All Attractions Data
async function loadAttractionsData() {
    try {
        uiHelpers.showLoader('#attractions-container');

        const data = await apiService.getAttractionsData();

        if (data && data.attractions) {
            state.attractions = data.attractions;
            state.filteredAttractions = [...state.attractions];

            console.log(`Loaded ${state.attractions.length} attractions`);
        }
    } catch (error) {
        console.error('Error loading attractions data:', error);
        displayAttractionsError();
    } finally {
        uiHelpers.hideLoader('#attractions-container');
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
        <div class="attraction-card" data-category="${attraction.category.toLowerCase()}" data-aos="fade-up">
            <div class="attraction-image">
                <img src="${attraction.image}" alt="${attraction.name}" loading="lazy">
                <div class="category-badge ${attraction.category.toLowerCase()}">${attraction.category}</div>
                <button class="favorite-btn" data-id="${attraction.id}" aria-label="Add to favorites">
                    <i class="heart-icon">♡</i>
                </button>
            </div>
            <div class="attraction-content">
                <h3>${attraction.name}</h3>
                <p>${attraction.description}</p>
                <div class="attraction-meta">
                    <span class="rating">⭐ ${attraction.rating}</span>
                    <span class="difficulty ${attraction.difficulty?.toLowerCase() || 'easy'}">
                        ${attraction.difficulty || 'Easy'}
                    </span>
                </div>
                <div class="attraction-location">
                    <i class="location-icon">📍</i>
                    <span>${attraction.location}</span>
                </div>
                <div class="attraction-tags">
                    ${attraction.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="attraction-actions">
                    <button class="details-btn" data-id="${attraction.id}">View Details</button>
                    <button class="directions-btn" data-coords="${attraction.coordinates}">
                        Get Directions
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Initialize attraction card interactions
    initAttractionCards();
    updatePaginationInfo();
}

// Initialize Filters
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active filter button
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Apply filter
            const category = e.target.dataset.category;
            applyFilter(category);
        });
    });
}

// Apply Filter
function applyFilter(category) {
    state.currentFilter = category;
    state.currentPage = 1; // Reset to first page

    if (category === 'all') {
        state.filteredAttractions = [...state.attractions];
    } else {
        state.filteredAttractions = state.attractions.filter(
            attraction => attraction.category.toLowerCase() === category.toLowerCase()
        );
    }

    displayAttractions();
    updatePagination();

    // Store filter preference
    storageService.setItem('lastFilter', category);
}

// Initialize Sorting
function initSorting() {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', (e) => {
        applySorting(e.target.value);
    });

    // Apply default sorting
    applySorting(state.currentSort);
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
        case 'difficulty':
            const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
            state.filteredAttractions.sort((a, b) => {
                const aLevel = difficultyOrder[a.difficulty] || 1;
                const bLevel = difficultyOrder[b.difficulty] || 1;
                return aLevel - bLevel;
            });
            break;
    }

    displayAttractions();
    storageService.setItem('lastSort', sortBy);
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
        }, 300); // Debounce search
    });
}

// Perform Search
function performSearch(query) {
    if (!query.trim()) {
        // Reset to current filter if search is empty
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
    const container = document.getElementById('attractions-grid');

    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const pageAttractions = state.filteredAttractions.slice(startIndex, endIndex);

    if (pageAttractions.length > 0) {
        const newCards = pageAttractions.map(attraction => `
            <div class="attraction-card" data-category="${attraction.category.toLowerCase()}" data-aos="fade-up">
                <!-- Same card structure as displayAttractions -->
            </div>
        `).join('');

        container.insertAdjacentHTML('beforeend', newCards);
        initAttractionCards(); // Re-initialize event listeners for new cards
    }

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

// Initialize Attraction Card Interactions
function initAttractionCards() {
    // Favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleFavorite(btn.dataset.id, btn);
        });
    });

    // Details buttons
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showAttractionDetails(btn.dataset.id);
        });
    });

    // Directions buttons
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
        button.innerHTML = '<i class="heart-icon">♡</i>';
        button.classList.remove('favorited');
    } else {
        favorites.push(attractionId);
        button.innerHTML = '<i class="heart-icon">♥</i>';
        button.classList.add('favorited');
    }

    storageService.setItem('favorites', favorites);
    uiHelpers.showToast(isFavorite ? 'Removed from favorites' : 'Added to favorites');
}

// Show Attraction Details Modal
function showAttractionDetails(attractionId) {
    const attraction = state.attractions.find(a => a.id == attractionId);
    if (!attraction) return;

    const modal = uiHelpers.createModal(`
        <div class="attraction-details">
            <div class="details-header">
                <img src="${attraction.image}" alt="${attraction.name}" loading="lazy">
                <div class="details-overlay">
                    <h2>${attraction.name}</h2>
                    <div class="category-badge ${attraction.category.toLowerCase()}">${attraction.category}</div>
                </div>
            </div>
            <div class="details-content">
                <div class="details-description">
                    <h3>About This Place</h3>
                    <p>${attraction.description}</p>
                </div>
                <div class="details-info">
                    <div class="info-item">
                        <strong>Rating:</strong> ⭐ ${attraction.rating}/5
                    </div>
                    <div class="info-item">
                        <strong>Difficulty:</strong> ${attraction.difficulty || 'Easy'}
                    </div>
                    <div class="info-item">
                        <strong>Location:</strong> ${attraction.location}
                    </div>
                    <div class="info-item">
                        <strong>Best Time to Visit:</strong> ${attraction.bestTime || 'Any time'}
                    </div>
                </div>
                <div class="details-tags">
                    <h3>Tags</h3>
                    <div class="tag-list">
                        ${attraction.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="details-actions">
                    <button class="primary-btn" onclick="openDirections('${attraction.coordinates}')">
                        Get Directions
                    </button>
                    <button class="secondary-btn" onclick="shareAttraction('${attraction.id}')">
                        Share
                    </button>
                </div>
            </div>
        </div>
    `);

    uiHelpers.showModal(modal);
}

// Open Directions
function openDirections(coordinates) {
    if (!coordinates) {
        uiHelpers.showToast('Location coordinates not available');
        return;
    }

    const [lat, lng] = coordinates.split(',');
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(mapsUrl, '_blank');
}

// Share Attraction
function shareAttraction(attractionId) {
    const attraction = state.attractions.find(a => a.id == attractionId);
    if (!attraction) return;

    if (navigator.share) {
        navigator.share({
            title: `Check out ${attraction.name}`,
            text: attraction.description,
            url: `${window.location.origin}/attractions.html#attraction-${attractionId}`
        });
    } else {
        // Fallback: copy to clipboard
        const shareUrl = `${window.location.origin}/attractions.html#attraction-${attractionId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            uiHelpers.showToast('Link copied to clipboard!');
        });
    }
}

// Load Country Info for About Page
async function loadCountryInfo() {
    try {
        const countryData = await apiService.getCountryInfo('Argentina');

        if (countryData && countryData.length > 0) {
            displayCountryInfo(countryData[0]);
        }
    } catch (error) {
        console.error('Error loading country info:', error);
    }
}

// Display Country Info
function displayCountryInfo(country) {
    const container = document.getElementById('country-info');
    if (!container) return;

    container.innerHTML = `
        <div class="country-card" data-aos="fade-up">
            <div class="country-flag">
                <img src="${country.flags.svg}" alt="${country.name.common} flag" loading="lazy">
            </div>
            <div class="country-details">
                <h3>${country.name.common}</h3>
                <div class="country-stats">
                    <div class="stat">
                        <strong>Capital:</strong> ${country.capital[0]}
                    </div>
                    <div class="stat">
                        <strong>Population:</strong> ${country.population.toLocaleString()}
                    </div>
                    <div class="stat">
                        <strong>Languages:</strong> ${Object.values(country.languages).join(', ')}
                    </div>
                    <div class="stat">
                        <strong>Currency:</strong> ${Object.values(country.currencies)[0].name}
                    </div>
                    <div class="stat">
                        <strong>Region:</strong> ${country.region}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize Newsletter Form
function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = form.querySelector('input[type="email"]').value;

        if (uiHelpers.validateEmail(email)) {
            // Store subscription
            const subscriptions = storageService.getItem('subscriptions') || [];
            if (!subscriptions.includes(email)) {
                subscriptions.push(email);
                storageService.setItem('subscriptions', subscriptions);
            }

            uiHelpers.showToast('Successfully subscribed to newsletter!');
            form.reset();
        } else {
            uiHelpers.showToast('Please enter a valid email address', 'error');
        }
    });
}

// Initialize Contact Form
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validate form
        if (validateContactForm(data)) {
            // Store contact submission
            const submissions = storageService.getItem('contactSubmissions') || [];
            submissions.push({
                ...data,
                timestamp: new Date().toISOString()
            });
            storageService.setItem('contactSubmissions', submissions);

            // Redirect to thank you page
            window.location.href = 'thankyou.html';
        }
    });
}

// Validate Contact Form
function validateContactForm(data) {
    const errors = [];

    if (!data.name || data.name.length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    if (!uiHelpers.validateEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }

    if (!data.message || data.message.length < 10) {
        errors.push('Message must be at least 10 characters long');
    }

    if (errors.length > 0) {
        uiHelpers.showToast(errors[0], 'error');
        return false;
    }

    return true;
}

// Initialize Hero Carousel
function initHeroCarousel() {
    const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.hero-slide');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Auto-advance slides
    setInterval(nextSlide, 5000);

    // Initialize first slide
    showSlide(0);
}

// Initialize Team Animation
function initTeamAnimation() {
    const teamCards = document.querySelectorAll('.team-member');

    teamCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        card.classList.add('animate-in');
    });
}

// Initialize Navigation Highlight
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

// Initialize Responsive Menu
function initResponsiveMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');

            // Toggle aria-expanded
            const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !expanded);
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

// Initialize General Features
async function initGeneralFeatures() {
    console.log('Initializing general features...');

    // Add any features that should work on all pages
    initScrollToTop();
    initLazyLoading();
    initAccessibilityFeatures();
}

// Initialize Scroll to Top
function initScrollToTop() {
    const scrollBtn = document.getElementById('scroll-to-top');
    if (!scrollBtn) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize Lazy Loading
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Initialize Accessibility Features
function initAccessibilityFeatures() {
    // Skip to main content link
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.focus();
                mainContent.scrollIntoView();
            }
        });
    }

    // Keyboard navigation for cards
    document.querySelectorAll('.attraction-card, .featured-card').forEach(card => {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const link = card.querySelector('a, button');
                if (link) link.click();
            }
        });
    });
}

// Update Footer Year
function updateFooterYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Error handling for attractions display
function displayAttractionsError() {
    const container = document.getElementById('attractions-grid');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <h3>Unable to load attractions</h3>
                <p>Please check your connection and try again</p>
                <button onclick="location.reload()" class="retry-btn">Retry</button>
            </div>
        `;
    }
}

// Export for global access if needed
window.hiddenGemsApp = {
    state,
    loadMoreAttractions,
    toggleFavorite,
    showAttractionDetails,
    openDirections,
    shareAttraction
};