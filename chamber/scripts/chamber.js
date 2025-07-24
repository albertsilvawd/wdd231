// Global variables
const hamburger = document.querySelector('.hamburger');
const mainNav = document.querySelector('.main-nav');

let membersData = [];

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
    hamburger.addEventListener('click', toggleMenu);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
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
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
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
    hamburger.classList.remove('active');
    mainNav.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
}

// Load members data from JSON
async function loadMembersData() {
    try {
        const response = await fetch('data/members.json');
        const data = await response.json();
        membersData = data.members;
        displaySpotlights(getRandomSpotlights());
        console.log('Members loaded:', membersData.length);
    } catch (error) {
        console.error('Error loading members data:', error);
    }
}

// Get random spotlights (Gold and Silver members only)
function getRandomSpotlights() {
    const goldSilverMembers = membersData.filter(member => member.membershipLevel >= 2);
    const shuffled = goldSilverMembers.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

// Display spotlights - VERSÃO SIMPLES COM BADGE NO TÍTULO
function displaySpotlights(members) {
    const spotlightContainer = document.getElementById('spotlight-container');

    if (!spotlightContainer) return;

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
                    <p><a href="${member.website}" target="_blank">Visit Website</a></p>
                </div>
            </div>
        `;
    }).join('');

    // Load images after HTML is created
    members.forEach((member, index) => {
        const cards = spotlightContainer.querySelectorAll('.spotlight-card');
        const card = cards[index];
        const imageContainer = card.querySelector('.member-image');
        const fallbackIcon = card.querySelector('.fallback-icon');

        if (member.image) {
            const img = document.createElement('img');
            img.src = `images/${member.image}`;
            img.alt = `${member.name} logo`;
            img.loading = 'lazy';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.objectPosition = 'center';
            img.style.borderRadius = '6px';

            img.onload = function () {
                fallbackIcon.style.display = 'none';
                imageContainer.appendChild(img);
            };

            img.onerror = function () {
                fallbackIcon.style.display = 'flex';
            };
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
        case 1:
            return 'Member';
        case 2:
            return 'Silver';
        case 3:
            return 'Gold';
        default:
            return 'Member';
    }
}

// Load weather data with real API
async function loadWeatherData() {
    try {
        console.log('Loading weather data...');

        // Mock data - mais realista
        const mockCurrent = {
            main: { temp: 24 },
            weather: [{ description: 'overcast clouds', icon: '04d' }],
            name: 'Buenos Aires'
        };

        const mockForecast = {
            list: [
                { dt_txt: '2025-01-23', main: { temp: 26 }, weather: [{ description: 'sunny', icon: '01d' }] },
                { dt_txt: '2025-01-24', main: { temp: 23 }, weather: [{ description: 'cloudy', icon: '03d' }] },
                { dt_txt: '2025-01-25', main: { temp: 25 }, weather: [{ description: 'partly cloudy', icon: '02d' }] }
            ]
        };

        console.log('Mock weather data created');
        displayCurrentWeather(mockCurrent);
        displayForecast(mockForecast);

        // Real API - uncomment when ready
        // const WEATHER_API_KEY = '78417727c75ec41d7e3ad135a9700413';
        // const CITY_LAT = -34.6118;
        // const CITY_LON = -58.3960;

        // if (WEATHER_API_KEY && WEATHER_API_KEY !== 'YOUR_API_KEY_HERE') {
        //     const currentResponse = await fetch(
        //         `https://api.openweathermap.org/data/2.5/weather?lat=${CITY_LAT}&lon=${CITY_LON}&appid=${WEATHER_API_KEY}&units=metric`
        //     );
        //     const currentData = await currentResponse.json();

        //     const forecastResponse = await fetch(
        //         `https://api.openweathermap.org/data/2.5/forecast?lat=${CITY_LAT}&lon=${CITY_LON}&appid=${WEATHER_API_KEY}&units=metric`
        //     );
        //     const forecastData = await forecastResponse.json();

        //     displayCurrentWeather(currentData);
        //     displayForecast(forecastData);
        // }

    } catch (error) {
        console.error('Error loading weather data:', error);
        // Fallback to mock data
        const mockCurrent = {
            main: { temp: 24 },
            weather: [{ description: 'broken clouds', icon: '04d' }]
        };

        const mockForecast = {
            list: [
                { dt_txt: '2025-01-23', main: { temp: 26 }, weather: [{ description: 'sunny' }] },
                { dt_txt: '2025-01-24', main: { temp: 23 }, weather: [{ description: 'cloudy' }] },
                { dt_txt: '2025-01-25', main: { temp: 25 }, weather: [{ description: 'partly cloudy' }] }
            ]
        };

        displayCurrentWeather(mockCurrent);
        displayForecast(mockForecast);
    }
}

// Display current weather
function displayCurrentWeather(data) {
    // Find the current weather section
    const currentWeatherSection = document.querySelector('.current-weather');

    if (!currentWeatherSection) {
        console.log('Current weather section not found');
        return;
    }

    // Clear existing content and create organized layout
    currentWeatherSection.innerHTML = `
        <div style="text-align: center !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; height: 100% !important; width: 100% !important; padding: 1rem !important;">
            <div style="font-size: 2rem; margin-bottom: 0.75rem; text-align: center !important;">☁️</div>
            <div style="font-size: 1.8rem; font-weight: bold; color: var(--primary-color); margin-bottom: 0.5rem; text-align: center !important;">${Math.round(data.main.temp)}°C</div>
            <div style="font-size: 0.9rem; color: var(--text-color); text-transform: capitalize; margin-bottom: 0.75rem; text-align: center !important;">${data.weather[0].description}</div>
            <div style="font-size: 0.85rem; color: var(--secondary-color); font-weight: 500; text-align: center !important;">${data.name || 'Buenos Aires'}</div>
        </div>
    `;

    // Update icon based on weather condition
    const iconElement = currentWeatherSection.querySelector('div[style*="font-size: 2rem"]');
    if (iconElement) {
        const iconMap = {
            '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        iconElement.textContent = iconMap[data.weather[0].icon] || '🌤️';
    }

    console.log('Weather display updated with organized layout');
}

// Display forecast
function displayForecast(data) {
    // Try multiple possible selectors
    const forecastContainer = document.getElementById('forecast-container') ||
        document.querySelector('.forecast') ||
        document.querySelector('[id*="forecast"]');

    if (!forecastContainer) {
        console.log('Forecast container not found');
        return;
    }

    const dailyForecasts = data.list.slice(0, 3);

    forecastContainer.innerHTML = dailyForecasts.map((forecast, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index + 1);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        return `
            <div class="forecast-day">
                <h4>${index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : `Day ${index + 1}`}</h4>
                <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
            </div>
        `;
    }).join('');

    console.log('Forecast updated with', dailyForecasts.length, 'days');
}

// Update footer with current date
function updateFooter() {
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
}