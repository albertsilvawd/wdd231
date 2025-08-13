// Hidden Gems Explorer - Attractions Page JavaScript
// Albert Silva - WDD 231 Final Project
// Enhancements for attractions page

import './main.js';

// Page-specific enhancements
document.addEventListener('DOMContentLoaded', () => {
    initAttractionsPageEnhancements();
});

function initAttractionsPageEnhancements() {
    initKeyboardShortcuts();
    initAdvancedFilters();
    console.log('✅ Attractions page enhancements loaded');
}

// Keyboard shortcuts for better UX
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 'f':
            case 'F':
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
                break;
            case 'c':
            case 'C':
                if (e.ctrlKey || e.metaKey) return; // Don't interfere with copy
                e.preventDefault();
                clearAllFilters();
                break;
        }
    });
}

// Advanced filter suggestions
function initAdvancedFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const costFilter = document.getElementById('costFilter');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            const category = e.target.value;

            // Smart suggestions based on category
            if (category === 'nature' && costFilter && costFilter.value === 'all') {
                // Most nature attractions are free, suggest free filter
                setTimeout(() => {
                    if (Math.random() > 0.7) { // Occasional helpful tip
                        showFilterSuggestion('💡 Tip: Most nature attractions are free to visit!');
                    }
                }, 500);
            } else if (category === 'entertainment' && costFilter && costFilter.value === 'all') {
                setTimeout(() => {
                    if (Math.random() > 0.8) {
                        showFilterSuggestion('🎭 Entertainment venues often have varied pricing options.');
                    }
                }, 500);
            }
        });
    }
}

// Non-intrusive suggestion system
function showFilterSuggestion(message) {
    // Create a subtle notification instead of alert
    const notification = document.createElement('div');
    notification.className = 'filter-suggestion';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 0.9rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        cursor: pointer;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);

    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Export enhancements for potential use
export {
    initAttractionsPageEnhancements,
    initKeyboardShortcuts,
    initAdvancedFilters
};