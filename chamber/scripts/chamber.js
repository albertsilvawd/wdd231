// Global variables
const hamburger = document.querySelector('.hamburger');
const mainNav = document.querySelector('.main-nav');

let membersData = [];

// Weather API configuration
const WEATHER_API_KEY = '78417727c75ec41d7e3ad135a9700413';
const CITY_LAT = -34.6118;
const CITY_LON = -58.3960;

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    loadMembersData();
    loadWeatherData();
    updateFooter();
});

// Setup event listeners
function setupEventListeners() {
    // Hamburger menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (hamburger && mainNav && !hamburger.contains(e.target) && !mainNav.contains(e.target)) {
            closeMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });

    // Close menu when clicking on nav links
    if (mainNav) {
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
}

// Toggle hamburger menu
function toggleMenu() {
    const isOpen = hamburger.classList.contains('active');
    if (isOpen) {
        closeMenu();
    } else {
        openMenu();
    }
}

// Open menu
function openMenu() {
    hamburger.classList.add('active');
    mainNav.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
}

// Close menu
function closeMenu() {
    if (hamburger && mainNav) {
        hamburger.classList.remove('active');
        mainNav.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }
}

// Load members data from JSON
async function loadMembersData() {
    try {
        const response = await fetch('data/members.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        membersData = data.members;
        displaySpotlights(getRandomSpotlights());
        console.log('Members loaded successfully:', membersData.length);
    } catch (error) {
        console.error('Error loading members data:', error);
        // Display fallback message
        const spotlightContainer = document.getElementById('spotlight-container');
        if (spotlightContainer) {
            spotlightContainer.innerHTML = '<p>Unable to load member spotlights at this time.</p>';
        }
    }
}

// Get random spotlights (Gold and Silver members only)
function getRandomSpotlights() {
    // Filter for Gold (level 3) and Silver (level 2) members only
    const goldSilverMembers = membersData.filter(member => member.membershipLevel >= 2);

    // Shuffle array using Fisher-Yates algorithm
    const shuffled = [...goldSilverMembers];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return 2-3 random members
    const count = Math.min(3, shuffled.length);
    return shuffled.slice(0, count);
}

// Display spotlights with badges in title
function displaySpotlights(members) {
    const spotlightContainer = document.getElementById('spotlight-container');

    if (!spotlightContainer) {
        console.warn('Spotlight container not found');
        return;
    }

    if (!members || members.length === 0) {
        spotlightContainer.innerHTML = '<p>No qualified members available for spotlight.</p>';
        return;
    }

    spotlightContainer.innerHTML = members.map(member => {
        const membershipText = getMembershipLevelText(member.membershipLevel);
        const membershipBadge = `<span style="background: ${getBadgeColor(member.membershipLevel)}; color: ${getBadgeTextColor(member.membershipLevel)}; padding: 2px 6px; border-radius: 8px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-left: 8px;">${membershipText}</span>`;

        return `
            <div class="spotlight-card">
                <div class="member-image">
                    <div class="fallback-icon">🏢</div>
                </div>
                <h3>${member.name} ${membershipBadge}</h3>
                <p class="industry"><strong>Industry:</strong> ${member.industry}</p>
                <p>${member.description}</p>
                <div class="contact-info">
                    <p>📞 ${member.phone}</p>
                    <p>📍 ${member.address.split(',')[0]}</p>
                    <p><a href="${member.website}" target="_blank" rel="noopener">Visit Website</a></p>
                </div>
            </div>
        `;
    }).join('');

    // Load images after HTML is created
    loadSpotlightImages(members);

    console.log(`Displayed ${members.length} spotlights (Gold/Silver members only)`);
}

// Load images for spotlight cards
function loadSpotlightImages(members) {
    const spotlightContainer = document.getElementById('spotlight-container');
    if (!spotlightContainer) return;

    members.forEach((member, index) => {
        const cards = spotlightContainer.querySelectorAll('.spotlight-card');
        const card = cards[index];
        if (!card) return;

        const imageContainer = card.querySelector('.member-image');
        const fallbackIcon = card.querySelector('.fallback-icon');

        if (member.image && imageContainer && fallbackIcon) {
            const img = document.createElement('img');
            img.src = `images/${member.image}`;
            img.alt = `${member.name} logo`;
            img.loading = 'lazy';
            img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; object-position: center; border-radius: 6px; display: none;';

            img.onload = function () {
                fallbackIcon.style.display = 'none';
                img.style.display = 'block';
                console.log(`Image loaded for ${member.name}`);
            };

            img.onerror = function () {
                console.warn(`Failed to load image for ${member.name}: ${member.image}`);
                fallbackIcon.style.display = 'flex';
            };

            imageContainer.appendChild(img);
        }
    });
}

// Get badge background color
function getBadgeColor(level) {
    switch (level) {
        case 1: return '#f3f4f6';
        case 2: return '#e5e7eb';
        case 3: return '#fbbf24';
        default: return '#f3f4f6';
    }
}

// Get badge text color
function getBadgeTextColor(level) {
    switch (level) {
        case 1: return '#374151';
        case 2: return '#374151';
        case 3: return '#1e3a8a';
        default: return '#374151';
    }
}

// Get membership level text
function getMembershipLevelText(level) {
    switch (level) {
        case 1: return 'Member';
        case 2: return 'Silver';
        case 3: return 'Gold';
        default: return 'Member';
    }
}

// Load weather data with real API
async function loadWeatherData() {
    try {
        console.log('Loading weather data from OpenWeatherMap API...');

        if (!WEATHER_API_KEY || WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
            throw new Error('Weather API key not configured');
        }

        // Fetch current weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${CITY_LAT}&lon=${CITY_LON}&appid=${WEATHER_API_KEY}&units=metric`
        );

        if (!currentResponse.ok) {
            throw new Error(`Weather API error: ${currentResponse.status} - ${currentResponse.statusText}`);
        }

        const currentData = await currentResponse.json();
        console.log('Current weather data received:', currentData);

        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${CITY_LAT}&lon=${CITY_LON}&appid=${WEATHER_API_KEY}&units=metric`
        );

        if (!forecastResponse.ok) {
            throw new Error(`Forecast API error: ${forecastResponse.status} - ${forecastResponse.statusText}`);
        }

        const forecastData = await forecastResponse.json();
        console.log('Forecast data received:', forecastData);

        // Display weather data
        displayCurrentWeather(currentData);
        displayForecast(forecastData);

        console.log('Weather data loaded successfully from real API');

    } catch (error) {
        console.error('Error loading weather data:', error);

        // Fallback to mock data to ensure page functionality
        console.log('Falling back to mock weather data');
        displayMockWeather();
    }
}

// Display current weather with organized layout
function displayCurrentWeather(data) {
    const currentWeatherSection = document.querySelector('.current-weather');

    if (!currentWeatherSection) {
        console.warn('Current weather section not found');
        return;
    }

    // Get weather icon
    const weatherIcon = getWeatherIcon(data.weather[0].icon);

    // Clear existing content and create organized layout
    currentWeatherSection.innerHTML = `
        <div style="text-align: center !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; height: 100% !important; width: 100% !important; padding: 1rem !important;">
            <div style="font-size: 2rem; margin-bottom: 0.75rem; text-align: center !important;">${weatherIcon}</div>
            <div style="font-size: 1.8rem; font-weight: bold; color: var(--primary-color); margin-bottom: 0.5rem; text-align: center !important;">${Math.round(data.main.temp)}°C</div>
            <div style="font-size: 0.9rem; color: var(--text-color); text-transform: capitalize; margin-bottom: 0.75rem; text-align: center !important;">${data.weather[0].description}</div>
            <div style="font-size: 0.85rem; color: var(--secondary-color); font-weight: 500; text-align: center !important;">${data.name || 'Buenos Aires'}</div>
        </div>
    `;

    console.log('Current weather display updated with real API data');
}

// Display 3-day forecast
function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast-container') ||
        document.querySelector('.forecast') ||
        document.querySelector('[id*="forecast"]');

    if (!forecastContainer) {
        console.warn('Forecast container not found');
        return;
    }

    // Get next 3 days from forecast (every 8th item = next day at same time)
    const dailyForecasts = [];
    for (let i = 8; i < data.list.length && dailyForecasts.length < 3; i += 8) {
        dailyForecasts.push(data.list[i]);
    }

    forecastContainer.innerHTML = dailyForecasts.map((forecast, index) => {
        const date = new Date(forecast.dt * 1000);
        const dayLabels = ['Today', 'Tomorrow', 'Day 3'];

        return `
            <div class="forecast-day">
                <h4>${dayLabels[index]}</h4>
                <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
            </div>
        `;
    }).join('');

    console.log(`Forecast updated with ${dailyForecasts.length} days from real API`);
}

// Get weather icon emoji
function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': '☀️', // clear sky day
        '01n': '🌙', // clear sky night
        '02d': '⛅', // few clouds day
        '02n': '☁️', // few clouds night
        '03d': '☁️', // scattered clouds
        '03n': '☁️',
        '04d': '☁️', // broken clouds
        '04n': '☁️',
        '09d': '🌧️', // shower rain
        '09n': '🌧️',
        '10d': '🌦️', // rain day
        '10n': '🌧️', // rain night
        '11d': '⛈️', // thunderstorm
        '11n': '⛈️',
        '13d': '❄️', // snow
        '13n': '❄️',
        '50d': '🌫️', // mist
        '50n': '🌫️'
    };

    return iconMap[iconCode] || '🌤️';
}

// Fallback mock weather data
function displayMockWeather() {
    const mockCurrentData = {
        main: { temp: 24 },
        weather: [{ description: 'broken clouds', icon: '04d' }],
        name: 'Buenos Aires'
    };

    const mockForecastData = {
        list: [
            { dt: Date.now() / 1000 + 86400, main: { temp: 26 }, weather: [{ icon: '01d' }] },
            { dt: Date.now() / 1000 + 172800, main: { temp: 23 }, weather: [{ icon: '03d' }] },
            { dt: Date.now() / 1000 + 259200, main: { temp: 25 }, weather: [{ icon: '02d' }] }
        ]
    };

    displayCurrentWeather(mockCurrentData);
    displayForecast(mockForecastData);

    console.log('Mock weather data displayed as fallback');
}

// Update footer with current date and last modified
function updateFooter() {
    try {
        const currentDate = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);

        const footerDate = document.getElementById('currentDate');
        if (footerDate) {
            footerDate.textContent = formattedDate;
        }

        const lastModified = document.getElementById('lastModified');
        if (lastModified) {
            lastModified.textContent = document.lastModified;
        }

        console.log('Footer updated with current date');
    } catch (error) {
        console.error('Error updating footer:', error);
    }
}

// Error handling for missing elements
window.addEventListener('error', function (e) {
    console.error('JavaScript error:', e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled promise rejection:', e.reason);
});

console.log('Chamber of Commerce page script loaded successfully');