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

// Global observers
let imageObserver = null;
let contentObserver = null;

// DOM ready initialization
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    try {
        removeLoadingMessages();
        await loadAttractions();
        initializeNavigation();
        initializeWeatherWidget();
        initializeFavorites();
        initializeModal();
        initializeLazyLoading();

        const currentPage = getCurrentPage();
        await initializePage(currentPage);
    } catch (error) {
        showErrorMessage('Failed to initialize the application. Please refresh the page.');
    }
}

function removeLoadingMessages() {
    const loadingElements = document.querySelectorAll('.loading-message, [id*="loading"]');
    loadingElements.forEach(el => {
        if (el.textContent.includes('Loading')) {
            el.style.display = 'none';
        }
    });
}

async function loadAttractions() {
    if (window.appState.attractions.length > 0) {
        return window.appState.attractions;
    }

    try {
        const response = await fetch('./attractions.json');
        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
        }

        const data = await response.json();
        window.appState.attractions = data.attractions || [];
        window.appState.filteredAttractions = [...window.appState.attractions];

        return window.appState.attractions;
    } catch (error) {
        window.appState.attractions = getFallbackAttractions();
        window.appState.filteredAttractions = [...window.appState.attractions];
        return window.appState.attractions;
    }
}

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
            image: "images/attractions/secret-garden.webp",
            rating: 4.8,
            neighborhood: "Palermo",
            openHours: "6:00 AM - 8:00 PM"
        },
        {
            id: 2,
            name: "Underground Art Gallery",
            category: "Culture",
            description: "Former subway tunnel transformed into vibrant underground art space.",
            location: "San Telmo, Buenos Aires",
            cost: "Low",
            accessibility: "High",
            image: "images/attractions/art-gallery.webp",
            rating: 4.6,
            neighborhood: "San Telmo",
            openHours: "2:00 PM - 10:00 PM"
        },
        {
            id: 3,
            name: "Historic Clock Tower",
            category: "Architecture",
            description: "19th-century clock tower with original mechanisms still functioning.",
            location: "Monserrat, Buenos Aires",
            cost: "Medium",
            accessibility: "Medium",
            image: "images/attractions/clock-tower.webp",
            rating: 4.5,
            neighborhood: "Monserrat",
            openHours: "10:00 AM - 6:00 PM"
        },
        {
            id: 4,
            name: "Secret Jazz Club",
            category: "Entertainment",
            description: "Hidden speakeasy-style jazz club with intimate performances.",
            location: "San Telmo, Buenos Aires",
            cost: "Medium",
            accessibility: "High",
            image: "images/attractions/jazz-club.webp",
            rating: 4.7,
            neighborhood: "San Telmo",
            openHours: "8:00 PM - 2:00 AM"
        },
        {
            id: 5,
            name: "Vintage Tango Hall",
            category: "Entertainment",
            description: "Authentic milonga where locals dance traditional tango.",
            location: "La Boca, Buenos Aires",
            cost: "Low",
            accessibility: "Medium",
            image: "images/attractions/tango-hall.webp",
            rating: 4.9,
            neighborhood: "La Boca",
            openHours: "9:00 PM - 1:00 AM"
        },
        {
            id: 6,
            name: "Hidden Botanical Corner",
            category: "Nature",
            description: "Secluded section of botanical garden with rare native plants.",
            location: "Palermo, Buenos Aires",
            cost: "Free",
            accessibility: "High",
            image: "images/attractions/botanical.webp",
            rating: 4.4,
            neighborhood: "Palermo",
            openHours: "8:00 AM - 6:00 PM"
        },
        {
            id: 7,
            name: "Artisan Market Alley",
            category: "Culture",
            description: "Narrow alley filled with local artisans and unique crafts.",
            location: "San Telmo, Buenos Aires",
            cost: "Free",
            accessibility: "Medium",
            image: "images/attractions/market-alley.webp",
            rating: 4.3,
            neighborhood: "San Telmo",
            openHours: "10:00 AM - 6:00 PM"
        },
        {
            id: 8,
            name: "Colonial Mansion Ruins",
            category: "History",
            description: "Preserved ruins of 18th-century colonial mansion with guided tours.",
            location: "Monserrat, Buenos Aires",
            cost: "Low",
            accessibility: "Low",
            image: "images/attractions/mansion-ruins.webp",
            rating: 4.6,
            neighborhood: "Monserrat",
            openHours: "9:00 AM - 5:00 PM"
        },
        {
            id: 9,
            name: "Riverside Walkway",
            category: "Nature",
            description: "Peaceful walkway along the river with stunning sunset views.",
            location: "Puerto Madero, Buenos Aires",
            cost: "Free",
            accessibility: "High",
            image: "images/attractions/riverside.webp",
            rating: 4.5,
            neighborhood: "Puerto Madero",
            openHours: "24/7"
        },
        {
            id: 10,
            name: "Art Deco Cinema",
            category: "Architecture",
            description: "Beautifully preserved 1930s cinema with original Art Deco features.",
            location: "Barracas, Buenos Aires",
            cost: "Medium",
            accessibility: "Medium",
            image: "images/attractions/art-deco-cinema.webp",
            rating: 4.8,
            neighborhood: "Barracas",
            openHours: "7:00 PM - 11:00 PM"
        },
        {
            id: 11,
            name: "Street Performance Corner",
            category: "Entertainment",
            description: "Vibrant corner where street performers showcase their talents daily.",
            location: "La Boca, Buenos Aires",
            cost: "Free",
            accessibility: "High",
            image: "images/attractions/street-performance.webp",
            rating: 4.2,
            neighborhood: "La Boca",
            openHours: "2:00 PM - 8:00 PM"
        },
        {
            id: 12,
            name: "Graffiti Gallery",
            category: "Culture",
            description: "Open-air gallery featuring the best street art in the city.",
            location: "Villa Crespo, Buenos Aires",
            cost: "Free",
            accessibility: "High",
            image: "images/attractions/graffiti-gallery.webp",
            rating: 4.4,
            neighborhood: "Villa Crespo",
            openHours: "24/7"
        },
        {
            id: 13,
            name: "Secret Garden Cafe",
            category: "Nature",
            description: "Hidden cafe with beautiful garden setting and organic menu.",
            location: "Palermo, Buenos Aires",
            cost: "Medium",
            accessibility: "Medium",
            image: "images/attractions/garden-cafe.webp",
            rating: 4.7,
            neighborhood: "Palermo",
            openHours: "8:00 AM - 6:00 PM"
        },
        {
            id: 14,
            name: "Vintage Bookstore",
            category: "Entertainment",
            description: "Three-story bookstore with rare books and cozy reading nooks.",
            location: "Recoleta, Buenos Aires",
            cost: "Free",
            accessibility: "Low",
            image: "images/attractions/bookstore.webp",
            rating: 4.6,
            neighborhood: "Recoleta",
            openHours: "10:00 AM - 8:00 PM"
        },
        {
            id: 15,
            name: "Hidden Viewpoint",
            category: "Nature",
            description: "Elevated viewpoint offering panoramic views of the city skyline.",
            location: "Puerto Madero, Buenos Aires",
            cost: "Free",
            accessibility: "Low",
            image: "images/attractions/viewpoint.webp",
            rating: 4.9,
            neighborhood: "Puerto Madero",
            openHours: "6:00 AM - 10:00 PM"
        },
        {
            id: 16,
            name: "Live Music Venue",
            category: "Entertainment",
            description: "Intimate venue hosting local and international musicians nightly.",
            location: "Villa Crespo, Buenos Aires",
            cost: "Medium",
            accessibility: "High",
            image: "images/attractions/music-venue.webp",
            rating: 4.5,
            neighborhood: "Villa Crespo",
            openHours: "8:00 PM - 2:00 AM"
        }
    ];
}

function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('attractions.html')) return 'attractions';
    if (path.includes('about.html')) return 'about';
    if (path.includes('thankyou.html')) return 'thankyou';
    return 'home';
}

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

async function initializeHomePage() {
    try {
        updateStatistics();
        preloadCriticalImages();
        await displayFeaturedAttractions();
        initializeSearch();
        displayCategories();
        displayCountryInfo();
        setTimeout(() => {
            initializeLazyLoading();
        }, 500);
    } catch (error) {
        showErrorMessage('Error initializing home page');
    }
}

async function displayFeaturedAttractions() {
    const container = document.getElementById('featuredAttractions');
    if (!container) return;

    try {
        const featured = window.appState.attractions
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3);

        if (featured.length === 0) {
            container.innerHTML = '<p class="no-attractions">No featured attractions available.</p>';
            return;
        }

        container.innerHTML = featured.map((attraction, index) =>
            createAttractionHTML(attraction, index > 0)
        ).join('');

        setTimeout(() => {
            observeNewImages();
        }, 100);
    } catch (error) {
        container.innerHTML = '<p class="error-message">Failed to load featured attractions.</p>';
    }
}

async function initializeAttractionsPage() {
    try {
        initializeFilters();
        await displayAttractions(window.appState.attractions);
        initializeSearch();

        // CRITICAL: Initialize URL params AFTER filters are set up
        setTimeout(() => {
            initializeURLParams();
            updateResultsCount();
        }, 100);

        setTimeout(() => {
            initializeLazyLoading();
        }, 500);
    } catch (error) {
        showErrorMessage('Error initializing attractions page');
    }
}

async function displayAttractions(attractions) {
    const attractionsToShow = attractions || window.appState.filteredAttractions;
    const container = document.getElementById('attractionsGrid');
    if (!container) return;

    try {
        if (attractionsToShow.length === 0) {
            container.innerHTML = '<div class="no-results"><h3>No attractions found</h3><p>Try adjusting your filters or search terms.</p><button class="btn btn--primary" onclick="clearAllFilters()">Clear Filters</button></div>';
            return;
        }

        container.innerHTML = attractionsToShow.map(attraction =>
            createAttractionHTML(attraction, true)
        ).join('');

        setTimeout(() => {
            observeNewImages();
        }, 100);
    } catch (error) {
        container.innerHTML = '<p class="error-message">Failed to load attractions.</p>';
    }
}

function createAttractionHTML(attraction, useLazyLoading) {
    const shouldUseLazy = useLazyLoading === undefined ? true : useLazyLoading;
    const isFavorite = window.appState.favorites.includes(attraction.id);
    const imageUrl = attraction.image || '';

    const lazyAttributes = shouldUseLazy ? 'loading="lazy" data-lazy="true"' : 'loading="eager"';

    const cardHTML = '<div class="card card-tall attraction-card" data-id="' + attraction.id + '">' +
        '<div class="image attraction-image">' +
        '<img src="' + imageUrl + '" alt="' + attraction.name + '" ' + lazyAttributes + ' onerror="handleImageError(this, \'' + attraction.name + '\', \'' + attraction.category + '\')" onload="handleImageLoad(this)">' +
        '<div class="category-badge category-' + attraction.category.toLowerCase() + '">' + attraction.category + '</div>' +
        '<button class="favorite-btn ' + (isFavorite ? 'active' : '') + '" onclick="toggleFavorite(' + attraction.id + ')" data-id="' + attraction.id + '" aria-label="' + (isFavorite ? 'Remove from favorites' : 'Add to favorites') + '">' +
        (isFavorite ? '❤️' : '🤍') +
        '</button>' +
        '</div>' +
        '<div class="content attraction-content">' +
        '<h3>' + attraction.name + '</h3>' +
        '<p class="description attraction-description">' + attraction.description + '</p>' +
        '<div class="meta attraction-meta">' +
        '<span class="location">📍 ' + (attraction.location || attraction.neighborhood) + '</span>' +
        '<span class="cost">💰 ' + attraction.cost + '</span>' +
        '<span class="accessibility">♿ ' + attraction.accessibility + '</span>' +
        '<span class="rating">⭐ ' + (attraction.rating || 4.5) + '</span>' +
        '</div>' +
        '<div class="actions attraction-actions">' +
        '<button class="btn btn--primary details-btn" onclick="openModal(' + attraction.id + ')">View Details</button>' +
        '</div>' +
        '</div>' +
        '</div>';

    return cardHTML;
}

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
    const initials = attractionName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();

    return 'data:image/svg+xml;charset=UTF-8,%3csvg width=\'400\' height=\'300\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3crect width=\'400\' height=\'300\' fill=\'' + encodeURIComponent(bgColor) + '\' /%3e%3ctext x=\'200\' y=\'150\' text-anchor=\'middle\' dy=\'0.35em\' font-family=\'Arial, sans-serif\' font-size=\'28\' font-weight=\'bold\' fill=\'white\'%3e' + initials + '%3c/text%3e%3c/svg%3e';
}

function handleImageLoad(img) {
    img.style.opacity = '1';
    img.classList.add('loaded');

    const card = img.closest('.card, .attraction-card');
    if (card) {
        card.classList.remove('card-loading');
    }
}

function handleImageError(img, attractionName, category) {
    img.onerror = null;
    img.src = createPlaceholderImage(attractionName, category);
    img.alt = attractionName + ' - Image not available';
    img.style.opacity = '1';
    img.classList.add('placeholder-image');

    const card = img.closest('.card, .attraction-card');
    if (card) {
        card.classList.remove('card-loading');
        card.classList.add('placeholder-card');
    }
}

function preloadCriticalImages() {
    const featuredAttractions = window.appState.attractions
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 1);

    featuredAttractions.forEach(attraction => {
        if (attraction.image) {
            const img = new Image();
            img.src = attraction.image;
        }
    });
}

function initializeLazyLoading() {
    const staticImages = document.querySelectorAll('.lazy-load-detection img');
    staticImages.forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        img.setAttribute('data-lazy-processed', 'static');
    });

    if ('loading' in HTMLImageElement.prototype) {
        if ('IntersectionObserver' in window) {
            if (imageObserver) {
                imageObserver.disconnect();
            }

            imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;

                        if (img.dataset.lazy || img.loading === 'lazy') {
                            img.classList.add('lazy-loading');

                            img.addEventListener('load', () => {
                                img.classList.remove('lazy-loading');
                                img.classList.add('lazy-loaded');
                            }, { once: true });

                            img.dataset.lazyProcessed = 'dynamic';
                        }

                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            observeNewImages();
            setupContentObserver();
        }
    } else {
        setupFallbackLazyLoading();
    }
}

function setupFallbackLazyLoading() {
    if ('IntersectionObserver' in window) {
        if (imageObserver) {
            imageObserver.disconnect();
        }

        imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    img.classList.remove('lazy');
                    img.classList.add('lazy-loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            if (!img.dataset.src) {
                img.dataset.src = img.src;
                img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4=';
                img.classList.add('lazy');
            }
            imageObserver.observe(img);
        });
    }
}

function observeNewImages() {
    if (!imageObserver) return;

    const lazyImages = document.querySelectorAll('img[loading="lazy"]:not([data-lazy-processed]), img[data-lazy]:not([data-lazy-processed])');

    lazyImages.forEach(img => {
        if (!img.dataset.lazyProcessed) {
            imageObserver.observe(img);
        }
    });
}

function setupContentObserver() {
    if (contentObserver) {
        contentObserver.disconnect();
    }

    contentObserver = new MutationObserver((mutations) => {
        let hasNewImages = false;

        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const images = node.tagName === 'IMG' ? [node] : (node.querySelectorAll ? node.querySelectorAll('img') : []);
                        if (images.length > 0) {
                            hasNewImages = true;
                        }
                    }
                });
            }
        });

        if (hasNewImages) {
            setTimeout(() => {
                observeNewImages();
            }, 100);
        }
    });

    contentObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const costFilter = document.getElementById('costFilter');
    const accessibilityFilter = document.getElementById('accessibilityFilter');
    const searchInput = document.getElementById('searchInput');
    const clearFiltersBtn = document.getElementById('clearFilters');

    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (costFilter) costFilter.addEventListener('change', applyFilters);
    if (accessibilityFilter) accessibilityFilter.addEventListener('change', applyFilters);
    if (searchInput) searchInput.addEventListener('input', debounce(applyFilters, 300));
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearAllFilters);
}

function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const costFilter = document.getElementById('costFilter');
    const accessibilityFilter = document.getElementById('accessibilityFilter');
    const searchInput = document.getElementById('searchInput');

    window.appState.currentFilters = {
        category: categoryFilter ? categoryFilter.value : 'all',
        cost: costFilter ? costFilter.value : 'all',
        accessibility: accessibilityFilter ? accessibilityFilter.value : 'all',
        search: searchInput ? searchInput.value.toLowerCase() : ''
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

function updateResultsCount() {
    const countElement = document.getElementById('resultsCount');
    if (countElement) {
        const count = window.appState.filteredAttractions.length;
        countElement.textContent = count + ' hidden gems found';
    }
}

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

function debounce(func, wait) {
    let timeout;
    return function executedFunction() {
        const args = arguments;
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav, .main-nav');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav a, .main-nav a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

function initializeWeatherWidget() {
    const weatherWidget = document.getElementById('weatherWidget');
    if (!weatherWidget) return;

    try {
        const weatherHTML = '<h3>Buenos Aires Weather</h3>' +
            '<div class="weather-info">' +
            '<div class="weather-current">' +
            '<span class="weather-temp">22°C</span>' +
            '<span class="weather-desc">Partly Cloudy</span>' +
            '</div>' +
            '<div class="weather-details">' +
            '<span>Humidity: 65%</span>' +
            '<span>Wind: 13 km/h</span>' +
            '</div>' +
            '</div>';

        weatherWidget.innerHTML = weatherHTML;
    } catch (error) {
        weatherWidget.innerHTML = '<p>Weather unavailable</p>';
    }
}

function initializeFavorites() {
    try {
        const saved = localStorage.getItem('hiddenGemsFavorites');
        if (saved) {
            window.appState.favorites = JSON.parse(saved);
        }
    } catch (error) {
        window.appState.favorites = [];
    }
}

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
        // Silent error handling for production
    }

    updateFavoriteButtons();
    updateStatistics();
}

function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const id = parseInt(btn.dataset.id);
        const isActive = window.appState.favorites.includes(id);
        btn.classList.toggle('active', isActive);
        btn.innerHTML = isActive ? '❤️' : '🤍';
        btn.setAttribute('aria-label', isActive ? 'Remove from favorites' : 'Add to favorites');
    });

    const viewFavoritesBtn = document.getElementById('viewFavorites');
    if (viewFavoritesBtn) {
        viewFavoritesBtn.innerHTML = 'View Favorites (' + window.appState.favorites.length + ')';
    }
}

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

function openModal(attractionId) {
    const attraction = window.appState.attractions.find(a => a.id === attractionId);
    if (!attraction) return;

    const modal = document.getElementById('attractionModal');
    const modalContent = document.getElementById('modalContent');

    if (!modal || !modalContent) return;

    const isFavorite = window.appState.favorites.includes(attractionId);
    const imageUrl = attraction.image || createPlaceholderImage(attraction.name, attraction.category);

    const modalHTML = '<button class="modal-close" onclick="closeModal()" aria-label="Close modal">&times;</button>' +
        '<div class="modal-body">' +
        '<div class="modal-image-container">' +
        '<img src="' + imageUrl + '" alt="' + attraction.name + '" class="modal-image" loading="eager" onerror="handleImageError(this, \'' + attraction.name + '\', \'' + attraction.category + '\')" onload="handleImageLoad(this)">' +
        '<div class="category-badge category-' + attraction.category.toLowerCase() + '">' + attraction.category + '</div>' +
        '</div>' +
        '<div class="modal-info">' +
        '<h2 id="modal-heading">' + attraction.name + '</h2>' +
        '<p class="modal-description">' + attraction.description + '</p>' +
        '<div class="modal-details">' +
        '<div class="detail-item"><strong>📍 Location:</strong> ' + (attraction.location || attraction.neighborhood) + '</div>' +
        '<div class="detail-item"><strong>💰 Cost:</strong> ' + attraction.cost + '</div>' +
        '<div class="detail-item"><strong>♿ Accessibility:</strong> ' + attraction.accessibility + '</div>' +
        '<div class="detail-item"><strong>🕒 Hours:</strong> ' + (attraction.openHours || 'Varies') + '</div>' +
        '<div class="detail-item"><strong>⭐ Rating:</strong> ' + (attraction.rating || 4.5) + '/5</div>' +
        '</div>' +
        '<button class="favorite-btn-modal ' + (isFavorite ? 'active' : '') + '" onclick="toggleFavorite(' + attraction.id + '); updateModalFavoriteBtn(' + attraction.id + ')" aria-label="' + (isFavorite ? 'Remove from favorites' : 'Add to favorites') + '">' +
        (isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites') +
        '</button>' +
        '</div>' +
        '</div>';

    modalContent.innerHTML = modalHTML;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('attractionModal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

function updateModalFavoriteBtn(attractionId) {
    const modalContent = document.getElementById('modalContent');
    const favoriteBtn = modalContent ? modalContent.querySelector('.favorite-btn-modal') : null;
    if (favoriteBtn) {
        const isActive = window.appState.favorites.includes(attractionId);
        favoriteBtn.classList.toggle('active', isActive);
        favoriteBtn.innerHTML = isActive ? '❤️ Remove from Favorites' : '🤍 Add to Favorites';
        favoriteBtn.setAttribute('aria-label', isActive ? 'Remove from favorites' : 'Add to favorites');
    }
    updateFavoriteButtons();
}

function showErrorMessage(message) {
    // Silent error handling for production
}

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const exploreBtn = document.getElementById('exploreBtn');

    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            if (getCurrentPage() !== 'attractions') {
                const searchTerm = searchInput ? searchInput.value : '';
                window.location.href = 'attractions.html' + (searchTerm ? '?search=' + encodeURIComponent(searchTerm) : '');
            }
        });
    }
}

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

    const categoriesHTML = Object.entries(categories).map(([category, count]) => {
        return '<div class="card card--medium category-card" onclick="filterByCategory(\'' + category + '\')">' +
            '<div class="category-icon">' + (categoryIcons[category] || '📍') + '</div>' +
            '<h3>' + category + '</h3>' +
            '<p class="category-count">' + count + ' locations</p>' +
            '</div>';
    }).join('');

    container.innerHTML = categoriesHTML;
}

function filterByCategory(category) {
    try {
        localStorage.setItem('selectedCategory', category);
    } catch (error) {
        // Silent error handling
    }

    if (getCurrentPage() !== 'attractions') {
        window.location.href = 'attractions.html?category=' + encodeURIComponent(category);
    } else {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = category;
            applyFilters();

            setTimeout(() => {
                const attractionsGrid = document.getElementById('attractionsGrid');
                if (attractionsGrid) {
                    attractionsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }
}

function displayCountryInfo() {
    const container = document.getElementById('countryInfo');
    if (!container) return;

    try {
        const countryHTML = '<div class="card card--medium info-card">' +
            '<h4>🗺️ Geography</h4>' +
            '<p>Located in South America, Buenos Aires is the capital of Argentina.</p>' +
            '</div>' +
            '<div class="card card--medium info-card">' +
            '<h4>🕒 Timezone</h4>' +
            '<p>GMT-3 (Argentina Time)</p>' +
            '</div>' +
            '<div class="card card--medium info-card">' +
            '<h4>💰 Currency</h4>' +
            '<p>Argentine Peso (ARS)</p>' +
            '</div>' +
            '<div class="card card--medium info-card">' +
            '<h4>🗣️ Language</h4>' +
            '<p>Spanish</p>' +
            '</div>';

        container.innerHTML = countryHTML;
    } catch (error) {
        container.innerHTML = '<p>Country information unavailable</p>';
    }
}

function initializeAboutPage() {
    const form = document.getElementById('gemSubmissionForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
}

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
        // Silent error handling
    }

    window.location.href = 'thankyou.html';
}

function initializeThankYouPage() {
    try {
        const formData = JSON.parse(localStorage.getItem('submittedGemData') || '{}');
        if (Object.keys(formData).length > 0) {
            displaySubmittedData(formData);
        }
    } catch (error) {
        // Silent error handling
    }
}

function displaySubmittedData(data) {
    const container = document.getElementById('submittedData');
    if (!container || !data) return;

    const submittedHTML = '<div class="submitted-gem">' +
        '<h3>Your Submitted Hidden Gem</h3>' +
        '<div class="gem-info">' +
        '<p><strong>Name:</strong> ' + (data.gemName || 'N/A') + '</p>' +
        '<p><strong>Email:</strong> ' + (data.email || 'N/A') + '</p>' +
        '<p><strong>Category:</strong> ' + (data.category || 'N/A') + '</p>' +
        '<p><strong>Location:</strong> ' + (data.location || 'N/A') + '</p>' +
        '<p><strong>Description:</strong> ' + (data.description || 'N/A') + '</p>' +
        '<p><strong>Accessibility:</strong> ' + (data.accessibility || 'N/A') + '</p>' +
        '<p><strong>Cost:</strong> ' + (data.cost || 'N/A') + '</p>' +
        '<p><strong>Visitor Tips:</strong> ' + (data.visitorTips || 'N/A') + '</p>' +
        '<p><strong>Submitted:</strong> ' + new Date(data.submissionDate).toLocaleDateString() + '</p>' +
        '</div>' +
        '</div>';

    container.innerHTML = submittedHTML;
}

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

function quickFilter(type) {
    const categoryFilter = document.getElementById('categoryFilter');
    const costFilter = document.getElementById('costFilter');
    const accessibilityFilter = document.getElementById('accessibilityFilter');

    if (categoryFilter) categoryFilter.value = 'all';
    if (costFilter) costFilter.value = 'all';
    if (accessibilityFilter) accessibilityFilter.value = 'all';

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

function initializeURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');

    let storedCategory = null;
    try {
        storedCategory = localStorage.getItem('selectedCategory');
        if (storedCategory) {
            localStorage.removeItem('selectedCategory');
        }
    } catch (error) {
        // Silent error handling
    }

    const targetCategory = categoryParam || storedCategory;

    let hasFilters = false;

    if (searchParam) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = searchParam;
            hasFilters = true;
        }
    }

    if (targetCategory) {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            const option = categoryFilter.querySelector('option[value="' + targetCategory + '"]');
            if (option) {
                categoryFilter.value = targetCategory;
                hasFilters = true;
            }
        }
    }

    if (hasFilters) {
        applyFilters();

        setTimeout(() => {
            const attractionsGrid = document.getElementById('attractionsGrid');
            if (attractionsGrid) {
                attractionsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }
}

function submitFeedback(rating) {
    const feedbackMessage = document.getElementById('feedbackMessage');
    if (feedbackMessage) {
        feedbackMessage.style.display = 'block';
        setTimeout(() => {
            feedbackMessage.style.display = 'none';
        }, 3000);
    }
}

function shareOn(platform) {
    const url = window.location.origin + window.location.pathname.replace('thankyou.html', 'index.html');
    const text = 'Check out Hidden Gems Explorer - discover amazing secret places in Buenos Aires!';

    switch (platform) {
        case 'facebook':
            window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
            break;
        case 'twitter':
            window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url), '_blank');
            break;
        case 'email':
            window.location.href = 'mailto:?subject=' + encodeURIComponent('Hidden Gems Explorer') + '&body=' + encodeURIComponent(text + ' ' + url);
            break;
    }
}

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

// Update last modified on all pages
document.addEventListener('DOMContentLoaded', updateLastModified);

// Cleanup observers on page unload
window.addEventListener('beforeunload', () => {
    if (imageObserver) {
        imageObserver.disconnect();
    }
    if (contentObserver) {
        contentObserver.disconnect();
    }
});