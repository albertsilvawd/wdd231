// Hidden Gems Explorer - Attractions Page Enhancements
// This file only adds EXTRA functionality, does NOT interfere with main filtering

const isDevelopment = false; // Disabled for production
const logger = {
    log: isDevelopment ? console.log : () => { },
    warn: isDevelopment ? console.warn : () => { },
    error: isDevelopment ? console.error : () => { }
};

// Wait for main.js to fully initialize
document.addEventListener('DOMContentLoaded', () => {
    // Delay to ensure main.js has finished initialization
    setTimeout(() => {
        initAttractionsPageEnhancements();
    }, 1000); // Increased delay to avoid conflicts
});

function initAttractionsPageEnhancements() {
    logger.log('🔧 Initializing attractions page enhancements...');

    // Only add enhancements that don't interfere with core functionality
    initKeyboardShortcuts();
    initViewModeToggle();
    initFilterSuggestions();
    initAdvancedUIFeatures();
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't interfere with form inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key.toLowerCase()) {
            case 'f':
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
                break;
            case 'c':
                e.preventDefault();
                if (typeof window.clearAllFilters === 'function') {
                    window.clearAllFilters();
                }
                break;
            case 'r':
                if (e.ctrlKey || e.metaKey) return; // Allow normal browser refresh
                e.preventDefault();
                window.location.reload();
                break;
        }
    });
    logger.log('✅ Keyboard shortcuts initialized');
}

function initViewModeToggle() {
    const filterControls = document.querySelector('.filter-controls');
    if (!filterControls) {
        logger.warn('Filter controls not found for view toggle');
        return;
    }

    // Check if toggle already exists
    if (document.querySelector('.view-toggle')) {
        logger.log('View toggle already exists');
        return;
    }

    const viewToggle = document.createElement('div');
    viewToggle.className = 'view-toggle';
    viewToggle.innerHTML =
        '<button class="view-btn active" data-view="grid" aria-label="Grid view" title="Grid View">' +
        '<span>⊞</span>' +
        '</button>' +
        '<button class="view-btn" data-view="list" aria-label="List view" title="List View">' +
        '<span>☰</span>' +
        '</button>';

    filterControls.appendChild(viewToggle);

    viewToggle.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-btn');
        if (!btn) return;

        const viewMode = btn.dataset.view;

        // Update button states
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update grid layout
        const attractionsGrid = document.getElementById('attractionsGrid');
        if (attractionsGrid) {
            attractionsGrid.className = viewMode === 'list' ?
                'attractions-list' : 'attractions-grid';
        }

        // Save preference
        try {
            localStorage.setItem('preferredViewMode', viewMode);
        } catch (error) {
            logger.warn('Could not save view mode preference');
        }
    });

    // Load saved preference
    try {
        const savedViewMode = localStorage.getItem('preferredViewMode');
        if (savedViewMode) {
            const btn = viewToggle.querySelector('[data-view="' + savedViewMode + '"]');
            if (btn) {
                btn.click();
            }
        }
    } catch (error) {
        logger.warn('Could not load view mode preference');
    }

    logger.log('✅ View mode toggle initialized');
}

function initFilterSuggestions() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
        logger.warn('Search input not found for suggestions');
        return;
    }

    let suggestionTimeout;

    // Only add suggestions if they don't already exist
    if (searchInput.hasAttribute('data-suggestions-enabled')) {
        logger.log('Search suggestions already enabled');
        return;
    }

    searchInput.setAttribute('data-suggestions-enabled', 'true');

    searchInput.addEventListener('input', (e) => {
        clearTimeout(suggestionTimeout);
        const query = e.target.value.toLowerCase().trim();

        if (query.length >= 2) {
            suggestionTimeout = setTimeout(() => {
                showSearchSuggestions(query);
            }, 300);
        } else {
            hideSearchSuggestions();
        }
    });

    searchInput.addEventListener('blur', () => {
        // Delay hiding to allow clicks on suggestions
        setTimeout(hideSearchSuggestions, 200);
    });

    logger.log('✅ Filter suggestions initialized');
}

function showSearchSuggestions(query) {
    if (!window.appState || !window.appState.attractions) {
        logger.warn('No attractions data available for suggestions');
        return;
    }

    const suggestions = window.appState.attractions
        .filter(attraction =>
            attraction.name.toLowerCase().includes(query) ||
            attraction.category.toLowerCase().includes(query) ||
            (attraction.location && attraction.location.toLowerCase().includes(query))
        )
        .slice(0, 5)
        .map(attraction => ({
            text: attraction.name,
            category: attraction.category,
            type: 'attraction'
        }));

    const categories = [...new Set(window.appState.attractions.map(a => a.category))]
        .filter(cat => cat.toLowerCase().includes(query))
        .slice(0, 3)
        .map(cat => ({
            text: cat,
            type: 'category'
        }));

    const allSuggestions = [...suggestions, ...categories];

    if (allSuggestions.length === 0) {
        hideSearchSuggestions();
        return;
    }

    let suggestionContainer = document.getElementById('searchSuggestions');
    if (!suggestionContainer) {
        suggestionContainer = document.createElement('div');
        suggestionContainer.id = 'searchSuggestions';
        suggestionContainer.className = 'search-suggestions';

        const searchContainer = document.querySelector('.search-input-group');
        if (searchContainer) {
            searchContainer.style.position = 'relative';
            searchContainer.appendChild(suggestionContainer);
        }
    }

    suggestionContainer.innerHTML = allSuggestions.map((suggestion, index) =>
        '<div class="suggestion-item" data-index="' + index + '" data-type="' + suggestion.type + '">' +
        '<span class="suggestion-text">' + suggestion.text + '</span>' +
        (suggestion.category ? '<span class="suggestion-category">' + suggestion.category + '</span>' : '') +
        '</div>'
    ).join('');

    suggestionContainer.style.display = 'block';

    // Add click handlers
    suggestionContainer.removeEventListener('click', handleSuggestionClick);
    suggestionContainer.addEventListener('click', handleSuggestionClick);
}

function handleSuggestionClick(e) {
    const item = e.target.closest('.suggestion-item');
    if (!item) return;

    const suggestions = JSON.parse(item.parentElement.dataset.suggestions || '[]');
    const suggestion = suggestions[parseInt(item.dataset.index)];

    if (!suggestion) return;

    const searchInput = document.getElementById('searchInput');

    if (suggestion.type === 'category') {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = suggestion.text;
            if (searchInput) searchInput.value = '';

            // Use main.js function if available
            if (typeof window.applyFilters === 'function') {
                window.applyFilters();
            }
        }
    } else {
        if (searchInput) {
            searchInput.value = suggestion.text;

            // Use main.js function if available
            if (typeof window.applyFilters === 'function') {
                window.applyFilters();
            }
        }
    }

    hideSearchSuggestions();
}

function hideSearchSuggestions() {
    const suggestionContainer = document.getElementById('searchSuggestions');
    if (suggestionContainer) {
        suggestionContainer.style.display = 'none';
    }
}

function initAdvancedUIFeatures() {
    // Add loading states
    addLoadingStates();

    // Add tooltips
    addTooltips();

    // Add smooth animations
    addAnimations();

    logger.log('✅ Advanced UI features initialized');
}

function addLoadingStates() {
    // Add loading indicators when filters change
    const filterElements = ['categoryFilter', 'costFilter', 'accessibilityFilter'];

    filterElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('change', () => {
                const grid = document.getElementById('attractionsGrid');
                if (grid) {
                    grid.classList.add('loading');
                    setTimeout(() => {
                        grid.classList.remove('loading');
                    }, 300);
                }
            });
        }
    });
}

function addTooltips() {
    // Add helpful tooltips to filter elements
    const tooltips = {
        'categoryFilter': 'Filter attractions by type',
        'costFilter': 'Filter by price range',
        'accessibilityFilter': 'Filter by accessibility level'
    };

    Object.entries(tooltips).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element && !element.hasAttribute('title')) {
            element.setAttribute('title', text);
        }
    });
}

function addAnimations() {
    // Add CSS for smooth transitions
    if (!document.getElementById('attractions-enhancements-styles')) {
        const styles = document.createElement('style');
        styles.id = 'attractions-enhancements-styles';
        styles.textContent = `
            .attractions-grid.loading {
                opacity: 0.7;
                transition: opacity 0.3s ease;
            }
            
            .attraction-card {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .attraction-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }
            
            .view-toggle {
                display: flex;
                gap: 4px;
                background: #f3f4f6;
                border-radius: 6px;
                padding: 4px;
                margin-left: auto;
            }
            
            .view-btn {
                background: none;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 1rem;
                color: #6b7280;
            }
            
            .view-btn.active {
                background: white;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                color: #2563eb;
            }
            
            .view-btn:hover {
                background: #e5e7eb;
            }
            
            .view-btn.active:hover {
                background: white;
            }
            
            .attractions-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .attractions-list .attraction-card {
                display: flex;
                flex-direction: row;
                max-width: none;
            }
            
            .attractions-list .attraction-image {
                width: 200px;
                flex-shrink: 0;
            }
            
            .search-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                max-height: 200px;
                overflow-y: auto;
                display: none;
            }
            
            .suggestion-item {
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f3f4f6;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: background 0.2s ease;
            }
            
            .suggestion-item:hover {
                background: #f9fafb;
            }
            
            .suggestion-item:last-child {
                border-bottom: none;
            }
            
            .suggestion-text {
                font-weight: 500;
                color: #374151;
            }
            
            .suggestion-category {
                font-size: 0.75rem;
                color: #6b7280;
                background: #f3f4f6;
                padding: 2px 8px;
                border-radius: 12px;
            }
            
            @media (max-width: 768px) {
                .attractions-list .attraction-card {
                    flex-direction: column;
                }
                
                .attractions-list .attraction-image {
                    width: 100%;
                    height: 200px;
                }
                
                .view-toggle {
                    margin: 1rem 0;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

logger.log('🚀 Attractions page enhancements loaded');