// Hidden Gems Explorer - Attractions Page JavaScript
// Albert Silva - WDD 231 Final Project

// Import main.js functionality for shared features
import './main.js';

// The main.js already handles the attractions page initialization
// This file serves as the entry point and can add page-specific enhancements

console.log('Attractions page module loaded');

// Page-specific enhancements for attractions page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Attractions page specific initialization...');

    // Add any attractions-page specific functionality here
    initAttractionsPageEnhancements();
});

function initAttractionsPageEnhancements() {
    // Add keyboard shortcuts for attractions page
    initKeyboardShortcuts();

    // Add advanced filtering features
    initAdvancedFilters();

    // Add URL state management
    initURLStateManagement();
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only if not typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 'f':
            case 'F':
                // Focus search input
                e.preventDefault();
                const searchInput = document.getElementById('attractionSearch');
                if (searchInput) searchInput.focus();
                break;

            case 'c':
            case 'C':
                // Clear all filters
                e.preventDefault();
                if (typeof window.clearFilters === 'function') {
                    window.clearFilters();
                }
                break;

            case 'h':
            case 'H':
                // Show favorites
                e.preventDefault();
                const favoritesBtn = document.getElementById('viewFavorites');
                if (favoritesBtn) favoritesBtn.click();
                break;

            case 'Escape':
                // Close modal if open
                const modal = document.getElementById('attractionModal');
                if (modal && modal.open) {
                    modal.close();
                }
                break;
        }
    });
}

function initAdvancedFilters() {
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
}

function addQuickFilterButtons() {
    const filterSection = document.querySelector('.filter-section .filter-container');
    if (!filterSection) return;

    const quickFiltersDiv = document.createElement('div');
    quickFiltersDiv.className = 'quick-filters';
    quickFiltersDiv.innerHTML = `
        <div class="quick-filters-label">Quick Filters:</div>
        <button class="quick-filter-btn" data-filter="free">Free Only</button>
        <button class="quick-filter-btn" data-filter="accessible">Accessible</button>
        <button class="quick-filter-btn" data-filter="nature">Nature</button>
        <button class="quick-filter-btn" data-filter="cultural">Cultural</button>
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
}

function applyQuickFilter(filter) {
    const categoryFilter = document.getElementById('categoryFilter');
    const costFilter = document.getElementById('costFilter');
    const accessibilityFilter = document.getElementById('accessibilityFilter');

    // Clear existing filters first
    if (typeof window.clearFilters === 'function') {
        window.clearFilters();
    }

    switch (filter) {
        case 'free':
            if (costFilter) costFilter.value = 'Free';
            break;
        case 'accessible':
            if (accessibilityFilter) accessibilityFilter.value = 'Fully Accessible';
            break;
        case 'nature':
            if (categoryFilter) categoryFilter.value = 'Nature';
            break;
        case 'cultural':
            if (categoryFilter) categoryFilter.value = 'Culture';
            break;
    }

    // Trigger filter application
    if (categoryFilter) categoryFilter.dispatchEvent(new Event('change'));
    if (costFilter) costFilter.dispatchEvent(new Event('change'));
    if (accessibilityFilter) accessibilityFilter.dispatchEvent(new Event('change'));
}

function showFilterSuggestion(message) {
    // Import uiHelpers if available
    if (typeof window.uiHelpers !== 'undefined') {
        window.uiHelpers.showToast(message, 'info', 3000);
    } else {
        console.log('Filter suggestion:', message);
    }
}

function initURLStateManagement() {
    // Save current filter state to URL
    function updateURL() {
        const params = new URLSearchParams();

        const categoryFilter = document.getElementById('categoryFilter');
        const costFilter = document.getElementById('costFilter');
        const accessibilityFilter = document.getElementById('accessibilityFilter');
        const searchInput = document.getElementById('attractionSearch');

        if (categoryFilter && categoryFilter.value) {
            params.set('category', categoryFilter.value);
        }
        if (costFilter && costFilter.value) {
            params.set('cost', costFilter.value);
        }
        if (accessibilityFilter && accessibilityFilter.value) {
            params.set('accessibility', accessibilityFilter.value);
        }
        if (searchInput && searchInput.value) {
            params.set('search', searchInput.value);
        }

        const newURL = params.toString() ?
            `${window.location.pathname}?${params.toString()}` :
            window.location.pathname;

        history.replaceState(null, '', newURL);
    }

    // Add event listeners to update URL when filters change
    const filters = ['categoryFilter', 'costFilter', 'accessibilityFilter'];
    filters.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateURL);
        }
    });

    const searchInput = document.getElementById('attractionSearch');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(updateURL, 500); // Debounce URL updates
        });
    }
}

// Export any functions that might be needed by other modules
export {
    initAttractionsPageEnhancements,
    applyQuickFilter
};