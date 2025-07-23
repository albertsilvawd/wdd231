// Global variables
const hamburger = document.querySelector('.hamburger');
const mainNav = document.querySelector('.main-nav');

let membersData = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    updateFooterDates();
    loadWeatherData();
    loadMemberSpotlights();
});

// Setup event listeners
function setupEventListeners() {
    // Hamburger menu toggle
    if (hamburger && mainNav) {
        hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mainNav.contains(e.target) && !hamburger.contains(e.target)) {
                closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMenu();
            }
        });
    }
}

// Toggle menu function
function toggleMenu() {
    mainNav.classList.toggle('active');
    hamburger.classList.toggle('active');

    // Update aria-expanded for accessibility
    const isExpanded = mainNav.classList.contains('active');
    hamburger.setAttribute('aria-expanded', isExpanded);
}

// Close menu function
function closeMenu() {
    mainNav.classList.remove('active');
    hamburger.classList.remove('active');
    if (hamburger) {
        hamburger.setAttribute('aria-expanded', 'false');
    }
}

// Load weather data with real API
async function loadWeatherData() {
    try {
        // Your real API key
        const WEATHER_API_KEY = '78417727c75ec41d7e3ad135a9700413';
        const CITY_LAT = -34.6118;
        const CITY_LON = -58.3960;

        if (WEATHER_API_KEY && WEATHER_API_KEY !== 'YOUR_API_KEY_HERE') {
            // Current weather
            const currentResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${CITY_LAT}&lon=${CITY_LON}&appid=${WEATHER_API_KEY}&units=metric`
            );

            if (!currentResponse.ok) {
                throw new Error('Weather data not available');
            }

            const currentData = await currentResponse.json();

            // 5-day forecast
            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${CITY_LAT}&lon=${CITY_LON}&appid=${WEATHER_API_KEY}&units=metric`
            );

            if (!forecastResponse.ok) {
                throw new Error('Forecast data not available');
            }

            const forecastData = await forecastResponse.json();

            displayCurrentWeather(currentData);
            displayForecast(forecastData);
        } else {
            // Fallback to mock data if no API key
            const mockCurrentWeather = {
                main: { temp: 24 },
                weather: [{
                    description: "partly cloudy",
                    icon: "02d"
                }]
            };

            const mockForecast = {
                list: [
                    { dt: Date.now() / 1000 + 86400, main: { temp: 26 } },
                    { dt: Date.now() / 1000 + 172800, main: { temp: 22 } },
                    { dt: Date.now() / 1000 + 259200, main: { temp: 28 } }
                ]
            };

            displayCurrentWeather(mockCurrentWeather);
            displayForecast(mockForecast);
        }

    } catch (error) {
        console.error('Error loading weather data:', error);
        displayWeatherError();
    }
}

// Display current weather
function displayCurrentWeather(data) {
    const currentTemp = document.getElementById('current-temp');
    const weatherDesc = document.getElementById('weather-desc');
    const weatherIconContainer = document.getElementById('weather-icon-container');

    if (currentTemp && weatherDesc && weatherIconContainer) {
        currentTemp.textContent = Math.round(data.main.temp);
        weatherDesc.textContent = capitalizeWords(data.weather[0].description);

        // Show weather icon
        if (data.weather[0].icon) {
            weatherIconContainer.innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" style="width: 64px; height: 64px;">`;
        } else {
            weatherIconContainer.innerHTML = '🌤️';
        }
    }
}

// Display forecast
function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast-container');

    if (!forecastContainer) return;

    // Process forecast data
    const dailyForecasts = data.list.slice(0, 3); // Take first 3 items

    forecastContainer.innerHTML = dailyForecasts.map((day, index) => {
        const date = new Date(day.dt * 1000);
        const dayNames = ['Today', 'Tomorrow', 'Day 3'];
        const dayName = dayNames[index] || date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);

        return `
            <div class="forecast-day">
                <h4>${dayName}</h4>
                <p class="forecast-temp">${temp}°C</p>
            </div>
        `;
    }).join('');
}

// Display weather error
function displayWeatherError() {
    const currentTemp = document.getElementById('current-temp');
    const weatherDesc = document.getElementById('weather-desc');
    const forecastContainer = document.getElementById('forecast-container');

    if (currentTemp) currentTemp.textContent = '--';
    if (weatherDesc) weatherDesc.textContent = 'Weather data unavailable';
    if (forecastContainer) {
        forecastContainer.innerHTML = `
            <div style="text-align: center; padding: 1rem; color: #6b7280;">
                <p>Forecast unavailable</p>
            </div>
        `;
    }
}

// Load member spotlights
async function loadMemberSpotlights() {
    try {
        const response = await fetch('data/members.json');

        if (!response.ok) {
            throw new Error('Failed to load member data');
        }

        const data = await response.json();
        membersData = data.members;

        // Filter ONLY gold and silver members (levels 2 and 3) - FIXED
        const qualifiedMembers = membersData.filter(member =>
            member.membershipLevel === 2 || member.membershipLevel === 3
        );

        if (qualifiedMembers.length === 0) {
            throw new Error('No qualified members found');
        }

        // Randomly select exactly 2-3 members
        const numberOfSpotlights = Math.min(3, qualifiedMembers.length);
        const selectedMembers = getRandomMembers(qualifiedMembers, numberOfSpotlights);
        displaySpotlights(selectedMembers);

    } catch (error) {
        console.error('Error loading member data:', error);
        displaySpotlightError();
    }
}

// Get random members
function getRandomMembers(members, count) {
    const shuffled = [...members].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Display spotlights
function displaySpotlights(members) {
    const spotlightContainer = document.getElementById('spotlight-container');

    if (!spotlightContainer) return;

    spotlightContainer.innerHTML = members.map(member => {
        const membershipText = getMembershipLevelText(member.membershipLevel);
        const membershipClass = getMembershipLevelClass(member.membershipLevel);

        return `
            <div class="spotlight-card">
                <div class="membership-level ${membershipClass}">${membershipText}</div>
                <div class="member-image">
                    <img src="images/${member.image}" alt="${member.name} logo" loading="lazy"
                         onload="this.nextElementSibling.style.display='none'" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <div class="fallback-icon">🏢</div>
                </div>
                <div class="member-info">
                    <h3>${member.name}</h3>
                    <p><strong>Industry:</strong> ${member.industry}</p>
                    <p class="member-description">${member.description}</p>
                    <p><strong>📞</strong> ${member.phone}</p>
                    <p><strong>📍</strong> ${member.address.split(',')[0]}</p>
                    <p><a href="${member.website}" target="_blank" rel="noopener noreferrer">Visit Website</a></p>
                </div>
            </div>
        `;
    }).join('');
}

// Get membership level text
function getMembershipLevelText(level) {
    switch (level) {
        case 3: return 'Gold';
        case 2: return 'Silver';
        case 1: return 'Member';
        default: return 'Member';
    }
}

// Get membership level CSS class
function getMembershipLevelClass(level) {
    switch (level) {
        case 3: return 'gold';
        case 2: return 'silver';
        case 1: return 'bronze';
        default: return 'bronze';
    }
}

// Display spotlight error
function displaySpotlightError() {
    const spotlightContainer = document.getElementById('spotlight-container');

    if (spotlightContainer) {
        spotlightContainer.innerHTML = `
            <div class="spotlight-card" style="text-align: center; padding: 2rem; color: #6b7280;">
                <h3>Unable to load member spotlights</h3>
                <p>Please check back later for member highlights.</p>
            </div>
        `;
    }
}

// Update footer dates
function updateFooterDates() {
    // Current year
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Last modified date
    const lastModifiedElement = document.getElementById('lastModified');
    if (lastModifiedElement) {
        lastModifiedElement.textContent = document.lastModified;
    }
}

// Utility Functions
function capitalizeWords(str) {
    return str.replace(/\b\w/g, letter => letter.toUpperCase());
}

// Responsive behavior for window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        if (mainNav) mainNav.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
    }
});