/**
 * Hidden Gems Explorer - Attractions Page JavaScript
 * Albert Silva - WDD 231 Final Project
 * PRODUCTION VERSION - NO CONSOLE STATEMENTS
 */

// Import main.js functionality for shared features
import './main.js';

// Production logging system (silent in production)
const isDevelopment = false;
const logger = {
    log: isDevelopment ? console.log : () => { },
    warn: isDevelopment ? console.warn : () => { },
    error: isDevelopment ? console.error : () => { }
};

// The main.js already handles the attractions page initialization
// This file serves as the entry point and can add page-specific enhancements

// Page-specific enhancements for attractions page
document.addEventListener('DOMContentLoaded', () => {
    // Add any attractions-page specific functionality here
    initAttractionsPageEnhancements();
});

/**
 * Initialize attractions page specific enhancements
 */
function initAttractionsPageEnhancements() {
    try {
        // Add keyboard shortcuts for attractions page
        initKeyboardShortcuts();

        // Add advanced filtering features
        initAdvancedFilters();

        // Add URL state management
        initURLStateManagement();
    } catch (error) {
        // Handle initialization errors silently
        showFallbackMessage();
    }
}

/**
 * Initialize keyboard shortcuts for better accessibility
 */
function initKeyboardShortcuts() {
    try {
        document.addEventListener('keydown', (e) => {
            // Only if not typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key) {
                case 'f':
                case 'F':
                    // Focus search input
                    e.preventDefault();
                    const searchInput = document.getElementById('attractionSearch') ||
                        document.getElementById('searchInput');
                    if (searchInput) searchInput.focus();
                    break;

                case 'c':
                case 'C':
                    // Clear all filters
                    e.preventDefault();
                    if (typeof window.clearAllFilters === 'function') {
                        window.clearAllFilters();
                    }
                    break;

                case 'h':
                case 'H':
                    // Show favorites
                    e.preventDefault();
                    if (typeof window.viewFavorites === 'function') {
                        window.viewFavorites();
                    }
                    break;

                case 'Escape':
                    // Close modal if open
                    const modal = document.getElementById('attractionModal');
                    if (modal && modal.style.display === 'block') {
                        if (typeof window.closeModal === 'function') {
                            window.closeModal();
                        }
                    }
                    break;
            }
        });
    } catch (error) {
        // Keyboard shortcuts failed - non-critical
    }
}

/**
 * Initialize advanced filtering features
 */
function initAdvancedFilters() {
    try {
        // Add filter combination suggestions
        const categoryFilter = document.getElementById('categoryFilter');
        const costFilter = document.getElementById('costFilter');

        if (categoryFilter && costFilter) {
            categoryFilter.addEventListener('change', (e) => {
                // Suggest complementary filters based on category
                const category = e.target.value;
                if (category === 'Nature') {
                    // Suggest free options for nature
                    if (costFilter.value === '' && Math.random() > 0.7) {
                        showFilterSuggestion('Most nature attractions are free to visit!');
                    }
                }
            });
        }

        // Add quick filter buttons
        addQuickFilterButtons();
    } catch (error) {
        // Advanced filters failed - non-critical
    }
}

/**
 * Add quick filter buttons for common filter combinations
 */
function addQuickFilterButtons() {
    try {
        const filterSection = document.querySelector('.search-filter .filter-row') ||
            document.querySelector('.filters-container');
        if (!filterSection) return;

        // Check if quick filters already exist
        if (filterSection.querySelector('.quick-filters')) return;

        const quickFiltersDiv = document.createElement('div');
        quickFiltersDiv.className = 'quick-filters';
        quickFiltersDiv.innerHTML = `
            <div class="quick-filters-label">Quick Filters:</div>
            <button class="quick-filter-btn" data-filter="free">Free Only</button>
            <button class="quick-filter-btn" data-filter="accessible">Accessible</button>
            <button class="quick-filter-btn" data-filter="nature">Nature</button>
            <button class="quick-filter-btn" data-filter="culture">Cultural</button>
        `;

        filterSection.appendChild(quickFiltersDiv);

        // Add event listeners for quick filters
        quickFiltersDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-filter-btn')) {
                const filter = e.target.dataset.filter;
                applyQuickFilter(filter);

                // Visual feedback
                document.querySelectorAll('.quick-filter-btn').forEach(btn =>
                    btn.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    } catch (error) {
        // Quick filter buttons failed - non-critical
    }
}

/**
 * Apply quick filter presets
 * @param {string} filter - Filter type to apply
 */
function applyQuickFilter(filter) {
    try {
        const categoryFilter = document.getElementById('categoryFilter');
        const costFilter = document.getElementById('costFilter');
        const accessibilityFilter = document.getElementById('accessibilityFilter');

        // Clear existing filters first
        if (typeof window.clearAllFilters === 'function') {
            window.clearAllFilters();
        }

        switch (filter) {
            case 'free':
                if (costFilter) costFilter.value = 'Free';
                break;
            case 'accessible':
                if (accessibilityFilter) {
                    accessibilityFilter.value = 'High';
                }
                break;
            case 'nature':
                if (categoryFilter) categoryFilter.value = 'Nature';
                break;
            case 'culture':
                if (categoryFilter) categoryFilter.value = 'Culture';
                break;
        }

        // Trigger filter application
        triggerFilterUpdate();
    } catch (error) {
        // Quick filter application failed - fallback to manual filtering
        showFallbackMessage();
    }
}

/**
 * Trigger filter update events
 */
function triggerFilterUpdate() {
    try {
        const filters = ['categoryFilter', 'costFilter', 'accessibilityFilter'];

        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.dispatchEvent(new Event('change'));
            }
        });
    } catch (error) {
        // Filter trigger failed - non-critical
    }
}

/**
 * Show filter suggestion to user
 * @param {string} message - Suggestion message
 */
function showFilterSuggestion(message) {
    try {
        // Try to use UI helpers if available
        if (typeof window.uiHelpers !== 'undefined' && window.uiHelpers.showToast) {
            window.uiHelpers.showToast(message, 'info', 3000);
        } else {
            // Fallback to simple notification
            showSimpleNotification(message);
        }
    } catch (error) {
        // Suggestion display failed - non-critical
    }
}

/**
 * Simple notification fallback
 * @param {string} message - Message to show
 */
function showSimpleNotification(message) {
    try {
        const notification = document.createElement('div');
        notification.className = 'simple-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-blue);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    } catch (error) {
        // Notification failed - completely silent fallback
    }
}

/**
 * Initialize URL state management for deep linking
 */
function initURLStateManagement() {
    try {
        // Save current filter state to URL
        function updateURL() {
            try {
                const params = new URLSearchParams();

                const categoryFilter = document.getElementById('categoryFilter');
                const costFilter = document.getElementById('costFilter');
                const accessibilityFilter = document.getElementById('accessibilityFilter');
                const searchInput = document.getElementById('attractionSearch') ||
                    document.getElementById('searchInput');

                if (categoryFilter && categoryFilter.value && categoryFilter.value !== 'all') {
                    params.set('category', categoryFilter.value);
                }
                if (costFilter && costFilter.value && costFilter.value !== 'all') {
                    params.set('cost', costFilter.value);
                }
                if (accessibilityFilter && accessibilityFilter.value && accessibilityFilter.value !== 'all') {
                    params.set('accessibility', accessibilityFilter.value);
                }
                if (searchInput && searchInput.value) {
                    params.set('search', searchInput.value);
                }

                const newURL = params.toString() ?
                    `${window.location.pathname}?${params.toString()}` :
                    window.location.pathname;

                history.replaceState(null, '', newURL);
            } catch (error) {
                // URL update failed - non-critical
            }
        }

        // Add event listeners to update URL when filters change
        const filters = ['categoryFilter', 'costFilter', 'accessibilityFilter'];
        filters.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', updateURL);
            }
        });

        const searchInput = document.getElementById('attractionSearch') ||
            document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(updateURL, 500); // Debounce URL updates
            });
        }
    } catch (error) {
        // URL state management failed - non-critical
    }
}

/**
 * Show fallback message when features fail
 */
function showFallbackMessage() {
    try {
        const container = document.querySelector('.attractions-grid') ||
            document.querySelector('main');

        if (container && !container.querySelector('.fallback-message')) {
            const message = document.createElement('div');
            message.className = 'fallback-message';
            message.style.cssText = `
                background: #f3f4f6;
                padding: 1rem;
                border-radius: 8px;
                margin: 1rem 0;
                text-align: center;
                color: #6b7280;
                font-size: 0.9rem;
            `;
            message.textContent = 'Some advanced features may not be available. Basic functionality continues to work.';

            container.insertAdjacentElement('beforebegin', message);

            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 5000);
        }
    } catch (error) {
        // Even fallback message failed - completely silent
    }
}

/**
 * Enhanced filter management with suggestions
 */
function initFilterEnhancements() {
    try {
        // Add filter reset confirmation for multiple active filters
        const clearButton = document.getElementById('clearFilters');
        if (clearButton) {
            clearButton.addEventListener('click', (e) => {
                const activeFilters = getActiveFilters();
                if (activeFilters.length > 2) {
                    e.preventDefault();
                    if (confirm(`Clear all ${activeFilters.length} active filters?`)) {
                        if (typeof window.clearAllFilters === 'function') {
                            window.clearAllFilters();
                        }
                    }
                }
            });
        }

        // Add filter combination suggestions
        addFilterSuggestions();
    } catch (error) {
        // Filter enhancements failed - non-critical
    }
}

/**
 * Get currently active filters
 */
function getActiveFilters() {
    const activeFilters = [];

    try {
        const categoryFilter = document.getElementById('categoryFilter');
        const costFilter = document.getElementById('costFilter');
        const accessibilityFilter = document.getElementById('accessibilityFilter');
        const searchInput = document.getElementById('searchInput');

        if (categoryFilter && categoryFilter.value !== 'all') {
            activeFilters.push('category');
        }
        if (costFilter && costFilter.value !== 'all') {
            activeFilters.push('cost');
        }
        if (accessibilityFilter && accessibilityFilter.value !== 'all') {
            activeFilters.push('accessibility');
        }
        if (searchInput && searchInput.value.trim()) {
            activeFilters.push('search');
        }
    } catch (error) {
        // Return empty array if detection fails
    }

    return activeFilters;
}

/**
 * Add intelligent filter suggestions
 */
function addFilterSuggestions() {
    try {
        const suggestionContainer = document.createElement('div');
        suggestionContainer.className = 'filter-suggestions';
        suggestionContainer.style.cssText = `
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 0.75rem;
            margin: 1rem 0;
            font-size: 0.875rem;
            color: #0369a1;
            display: none;
        `;

        const filtersSection = document.querySelector('.search-filter');
        if (filtersSection) {
            filtersSection.appendChild(suggestionContainer);
        }

        // Show suggestions based on filter combinations
        function showSuggestion(message) {
            suggestionContainer.textContent = message;
            suggestionContainer.style.display = 'block';

            setTimeout(() => {
                suggestionContainer.style.display = 'none';
            }, 5000);
        }

        // Monitor filter changes for suggestions
        const categoryFilter = document.getElementById('categoryFilter');
        const costFilter = document.getElementById('costFilter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                const category = e.target.value;
                if (category === 'Nature' && (!costFilter || costFilter.value === 'all')) {
                    showSuggestion('💡 Tip: Most nature attractions are free! Try filtering by "Free" cost.');
                } else if (category === 'Entertainment' && (!costFilter || costFilter.value === 'all')) {
                    showSuggestion('💡 Tip: Entertainment venues often have entrance fees. Check cost filters.');
                }
            });
        }
    } catch (error) {
        // Suggestions failed - non-critical
    }
}

/**
 * Initialize performance monitoring for attractions page
 */
function initPerformanceMonitoring() {
    try {
        // Monitor page load performance
        window.addEventListener('load', () => {
            const loadTime = performance.now();

            // Store performance data
            const perfData = {
                page: 'attractions',
                loadTime: Math.round(loadTime),
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent.substring(0, 50)
            };

            // Store in localStorage for analytics
            try {
                const perfHistory = JSON.parse(localStorage.getItem('page_performance') || '[]');
                perfHistory.push(perfData);

                // Keep only last 20 entries
                if (perfHistory.length > 20) {
                    perfHistory.splice(0, perfHistory.length - 20);
                }

                localStorage.setItem('page_performance', JSON.stringify(perfHistory));
            } catch (storageError) {
                // Performance monitoring failed - non-critical
            }
        });

        // Monitor filter performance
        let filterStartTime;
        const categoryFilter = document.getElementById('categoryFilter');
        const costFilter = document.getElementById('costFilter');

        [categoryFilter, costFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => {
                    filterStartTime = performance.now();
                });
            }
        });

        // Monitor attractions grid updates
        const observer = new MutationObserver(() => {
            if (filterStartTime) {
                const filterTime = performance.now() - filterStartTime;

                // If filtering takes too long, could suggest performance improvements
                if (filterTime > 100) {
                    // Store slow filter performance for optimization
                    try {
                        const slowFilters = JSON.parse(localStorage.getItem('slow_filters') || '[]');
                        slowFilters.push({
                            time: Math.round(filterTime),
                            timestamp: new Date().toISOString()
                        });

                        if (slowFilters.length > 10) {
                            slowFilters.splice(0, slowFilters.length - 10);
                        }

                        localStorage.setItem('slow_filters', JSON.stringify(slowFilters));
                    } catch (error) {
                        // Performance tracking failed - non-critical
                    }
                }

                filterStartTime = null;
            }
        });

        const attractionsGrid = document.getElementById('attractionsGrid');
        if (attractionsGrid) {
            observer.observe(attractionsGrid, { childList: true });
        }
    } catch (error) {
        // Performance monitoring failed - non-critical
    }
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', () => {
    initFilterEnhancements();
    initPerformanceMonitoring();
});

// Export any functions that might be needed by other modules
export {
    initAttractionsPageEnhancements,
    applyQuickFilter,
    getActiveFilters
};