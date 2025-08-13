// Hidden Gems Explorer - Attractions Page JavaScript

import './main.js';

const isDevelopment = false;
const logger = {
    log: isDevelopment ? console.log : () => { },
    warn: isDevelopment ? console.warn : () => { },
    error: isDevelopment ? console.error : () => { }
};

document.addEventListener('DOMContentLoaded', () => {
    initAttractionsPageEnhancements();
});

function initAttractionsPageEnhancements() {
    initKeyboardShortcuts();
    initAdvancedFilters();
    initURLStateManagement();
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('attractionSearch');
            if (searchInput) searchInput.focus();
        }
    });
}

function initAdvancedFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const costFilter = document.getElementById('costFilter');
    categoryFilter.addEventListener('change', (e) => {
        const category = e.target.value;
        if (category === 'Nature') {
            if (costFilter.value === '' && Math.random() > 0.7) {
                showFilterSuggestion('Most nature attractions are free to visit!');
            }
        }
    });
}

function showFilterSuggestion(message) {
    alert(message);
}

async function displayAttractions(attractions = []) {
    const container = document.getElementById('attractionsGrid');
    container.innerHTML = attractions.map(attraction =>
        createAttractionHTML(attraction, true) // Com lazy loading para todas as imagens
    ).join('');
}