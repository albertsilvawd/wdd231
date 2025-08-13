import './main.js';

const isDevelopment = false;
const logger = {
    log: isDevelopment ? console.log : () => { },
    warn: isDevelopment ? console.warn : () => { },
    error: isDevelopment ? console.error : () => { }
};

let currentFilters = {
    category: '',
    location: '',
    difficulty: '',
    search: ''
};

let attractionsData = [];
let filteredAttractions = [];

document.addEventListener('DOMContentLoaded', () => {
    initAttractionsPageEnhancements();
});

function initAttractionsPageEnhancements() {
    logger.log('Inicializando melhorias da página Attractions');

    loadAttractionsData();
    initFilterSystem();
    initSearchFunctionality();
    initSortingOptions();
    initViewToggle();
    initFavoriteSystem();
    initLazyLoading();
}

async function loadAttractionsData() {
    try {
        attractionsData = await fetchAttractionsData();
        filteredAttractions = [...attractionsData];
        renderAttractions();

    } catch (error) {
        logger.error('Erro ao carregar dados das atrações:', error);
        showErrorState();
    }
}

function fetchAttractionsData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    name: "Cachoeira Secreta da Pedra Branca",
                    category: "natureza",
                    location: "Serra da Mantiqueira",
                    difficulty: "moderado",
                    description: "Uma cachoeira escondida em meio à mata atlântica...",
                    image: "https://via.placeholder.com/300x200",
                    rating: 4.8,
                    reviews: 127,
                    isFavorite: false
                },
                {
                    id: 2,
                    name: "Gruta dos Cristais",
                    category: "aventura",
                    location: "Vale do Ribeira",
                    difficulty: "dificil",
                    description: "Caverna com formações rochosas únicas...",
                    image: "https://via.placeholder.com/300x200",
                    rating: 4.6,
                    reviews: 89,
                    isFavorite: false
                },
                {
                    id: 3,
                    name: "Mirante do Pôr do Sol",
                    category: "cultura",
                    location: "Chapada Diamantina",
                    difficulty: "facil",
                    description: "Vista panorâmica espetacular ao entardecer...",
                    image: "https://via.placeholder.com/300x200",
                    rating: 4.9,
                    reviews: 203,
                    isFavorite: false
                },
                {
                    id: 4,
                    name: "Trilha da Pedra do Elefante",
                    category: "aventura",
                    location: "Nova Friburgo",
                    difficulty: "moderado",
                    description: "Formação rochosa impressionante com vista única...",
                    image: "https://via.placeholder.com/300x200",
                    rating: 4.7,
                    reviews: 156,
                    isFavorite: false
                }
            ]);
        }, 1000);
    });
}

function initFilterSystem() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const filterSelects = document.querySelectorAll('.filter-select');

    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const filterType = e.target.dataset.filter;
            const filterValue = e.target.dataset.value;

            applyQuickFilter(filterType, filterValue, e.target);
        });
    });

    filterSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const filterType = e.target.name;
            const filterValue = e.target.value;

            updateFilter(filterType, filterValue);
        });
    });
}

function applyQuickFilter(filterType, filterValue, buttonElement) {
    const wasActive = buttonElement.classList.contains('active');

    const sameTypeButtons = document.querySelectorAll(`[data-filter="${filterType}"]`);
    sameTypeButtons.forEach(btn => btn.classList.remove('active'));

    if (wasActive) {
        currentFilters[filterType] = '';
    } else {
        buttonElement.classList.add('active');
        currentFilters[filterType] = filterValue;
    }

    applyFilters();
    updateFilterCount();

    logger.log(`Filtro ${filterType} aplicado:`, filterValue);
}

function updateFilter(filterType, filterValue) {
    currentFilters[filterType] = filterValue;
    applyFilters();
    updateFilterCount();
}

function applyFilters() {
    filteredAttractions = attractionsData.filter(attraction => {
        if (currentFilters.category && attraction.category !== currentFilters.category) {
            return false;
        }

        if (currentFilters.location && !attraction.location.toLowerCase().includes(currentFilters.location.toLowerCase())) {
            return false;
        }

        if (currentFilters.difficulty && attraction.difficulty !== currentFilters.difficulty) {
            return false;
        }

        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            const matchesName = attraction.name.toLowerCase().includes(searchTerm);
            const matchesDescription = attraction.description.toLowerCase().includes(searchTerm);
            const matchesLocation = attraction.location.toLowerCase().includes(searchTerm);

            if (!matchesName && !matchesDescription && !matchesLocation) {
                return false;
            }
        }

        return true;
    });

    renderAttractions();
}

function initSearchFunctionality() {
    const searchInput = document.getElementById('attraction-search');
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            currentFilters.search = e.target.value;
            applyFilters();
            updateFilterCount();
        }, 300);
    });

    const clearButton = document.getElementById('clear-search');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            currentFilters.search = '';
            applyFilters();
            updateFilterCount();
        });
    }
}

function initSortingOptions() {
    const sortSelect = document.getElementById('sort-attractions');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', (e) => {
        const sortBy = e.target.value;
        sortAttractions(sortBy);
    });
}

function sortAttractions(sortBy) {
    switch (sortBy) {
        case 'name':
            filteredAttractions.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            filteredAttractions.sort((a, b) => b.rating - a.rating);
            break;
        case 'reviews':
            filteredAttractions.sort((a, b) => b.reviews - a.reviews);
            break;
        case 'difficulty':
            const difficultyOrder = { 'facil': 1, 'moderado': 2, 'dificil': 3 };
            filteredAttractions.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
            break;
    }

    renderAttractions();
}

function initViewToggle() {
    const viewButtons = document.querySelectorAll('.view-toggle button');
    const attractionsContainer = document.getElementById('attractions-container');

    viewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const viewType = e.target.dataset.view;

            viewButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            attractionsContainer.className = `attractions-${viewType}`;
        });
    });
}

function initFavoriteSystem() {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    attractionsData.forEach(attraction => {
        attraction.isFavorite = savedFavorites.includes(attraction.id);
    });
}

function toggleFavorite(attractionId) {
    const attraction = attractionsData.find(a => a.id === attractionId);
    if (!attraction) return;

    attraction.isFavorite = !attraction.isFavorite;

    const favorites = attractionsData.filter(a => a.isFavorite).map(a => a.id);
    localStorage.setItem('favorites', JSON.stringify(favorites));

    const favoriteButton = document.querySelector(`[data-attraction-id="${attractionId}"] .favorite-btn`);
    if (favoriteButton) {
        favoriteButton.classList.toggle('active', attraction.isFavorite);
        favoriteButton.innerHTML = attraction.isFavorite ? '❤️' : '🤍';
    }

    logger.log(`Favorito ${attraction.isFavorite ? 'adicionado' : 'removido'}:`, attraction.name);
}

function initLazyLoading() {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    setTimeout(() => {
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }, 100);
}

function renderAttractions() {
    const container = document.getElementById('attractions-container');
    if (!container) return;

    if (filteredAttractions.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>Nenhuma atração encontrada</h3>
                <p>Tente ajustar os filtros ou busca.</p>
                <button onclick="clearAllFilters()" class="btn btn-primary">Limpar Filtros</button>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredAttractions.map(attraction => `
        <div class="attraction-card" data-attraction-id="${attraction.id}">
            <div class="card-image">
                <img data-src="${attraction.image}" 
                     alt="${attraction.name}" 
                     class="lazy"
                     src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3C/svg%3E">
                <button class="favorite-btn ${attraction.isFavorite ? 'active' : ''}"
                        onclick="toggleFavorite(${attraction.id})">
                    ${attraction.isFavorite ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="card-content">
                <h3>${attraction.name}</h3>
                <p class="location">📍 ${attraction.location}</p>
                <p class="description">${attraction.description}</p>
                <div class="card-meta">
                    <span class="rating">⭐ ${attraction.rating}</span>
                    <span class="reviews">(${attraction.reviews} avaliações)</span>
                    <span class="difficulty difficulty-${attraction.difficulty}">
                        ${attraction.difficulty}
                    </span>
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="viewAttractionDetails(${attraction.id})">
                        Ver Detalhes
                    </button>
                    <button class="btn btn-secondary" onclick="shareAttraction(${attraction.id})">
                        Compartilhar
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    initLazyLoading();
}

function updateFilterCount() {
    const countElement = document.getElementById('results-count');
    if (countElement) {
        countElement.textContent = `${filteredAttractions.length} de ${attractionsData.length} atrações`;
    }
}

function clearAllFilters() {
    currentFilters = {
        category: '',
        location: '',
        difficulty: '',
        search: ''
    };

    document.querySelectorAll('.filter-btn.active').forEach(btn => {
        btn.classList.remove('active');
    });

    document.querySelectorAll('.filter-select').forEach(select => {
        select.value = '';
    });

    const searchInput = document.getElementById('attraction-search');
    if (searchInput) searchInput.value = '';

    applyFilters();
    updateFilterCount();
}

function viewAttractionDetails(attractionId) {
    const attraction = attractionsData.find(a => a.id === attractionId);
    if (attraction) {
        logger.log('Visualizando detalhes:', attraction.name);
        window.location.href = `attraction-detail.html?id=${attractionId}`;
    }
}

function shareAttraction(attractionId) {
    const attraction = attractionsData.find(a => a.id === attractionId);
    if (!attraction) return;

    if (navigator.share) {
        navigator.share({
            title: attraction.name,
            text: attraction.description,
            url: `${window.location.origin}/attraction-detail.html?id=${attractionId}`
        });
    } else {
        const link = `${window.location.origin}/attraction-detail.html?id=${attractionId}`;
        navigator.clipboard.writeText(link).then(() => {
            alert('Link copiado para a área de transferência!');
        });
    }
}

function showErrorState() {
    const container = document.getElementById('attractions-container');
    if (container) {
        container.innerHTML = `
            <div class="error-state">
                <h3>❌ Erro ao carregar atrações</h3>
                <p>Por favor, tente recarregar a página.</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    Recarregar
                </button>
            </div>
        `;
    }
}

function getActiveFilters() {
    const activeFilters = {};

    Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key]) {
            activeFilters[key] = currentFilters[key];
        }
    });

    return activeFilters;
}

export {
    initAttractionsPageEnhancements,
    applyQuickFilter,
    getActiveFilters,
    toggleFavorite,
    clearAllFilters,
    viewAttractionDetails,
    shareAttraction
};