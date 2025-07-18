// DOM Elements
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const currentYear = document.getElementById('current-year');
const lastModified = document.getElementById('last-modified');

// Navigation Toggle
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Footer Date Information
currentYear.textContent = new Date().getFullYear();
lastModified.textContent = document.lastModified;

// Weather API Configuration - Buenos Aires
const WEATHER_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeatherMap API key
const CITY_LAT = -34.6118; // Buenos Aires latitude
const CITY_LON = -58.3960; // Buenos Aires longitude

// Weather Functions
async function getWeatherData() {
    try {
        // Current weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${CITY_LAT}&lon=${CITY_LON}&appid=${WEATHER_API_KEY}&units=metric`
        );
        const currentData = await currentResponse.json();

        // 5-day forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${CITY_LAT}&lon=${CITY_LON}&appid=${WEATHER_API_KEY}&units=metric`
        );
        const forecastData = await forecastResponse.json();

        displayCurrentWeather(currentData);
        displayForecast(forecastData);

    } catch (error) {
        console.error('Error fetching weather data:', error);
        displayWeatherError();
    }
}

function displayCurrentWeather(data) {
    const currentTemp = document.getElementById('current-temp');
    const weatherDesc = document.getElementById('weather-desc');
    const weatherIcon = document.getElementById('weather-icon');

    currentTemp.textContent = Math.round(data.main.temp);
    weatherDesc.textContent = capitalizeWords(data.weather[0].description);

    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast-container');

    // Get daily forecasts (every 8th item represents next day at same time)
    const dailyForecasts = data.list.filter((item, index) => index % 8 === 0).slice(0, 3);

    forecastContainer.innerHTML = dailyForecasts.map(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);

        return `
            <div class="forecast-day">
                <h4>${dayName}</h4>
                <p class="forecast-temp">${temp}°C</p>
            </div>
        `;
    }).join('');
}

function displayWeatherError() {
    const currentTemp = document.getElementById('current-temp');
    const weatherDesc = document.getElementById('weather-desc');

    currentTemp.textContent = '--';
    weatherDesc.textContent = 'Weather data unavailable';
}

// Member Spotlight Functions
async function loadMemberSpotlights() {
    try {
        const response = await fetch('data/members.json');
        const data = await response.json();

        // Filter gold and silver members (levels 2 and 3)
        const qualifiedMembers = data.members.filter(member =>
            member.membershipLevel === 2 || member.membershipLevel === 3
        );

        // Randomly select 2-3 members
        const selectedMembers = getRandomMembers(qualifiedMembers, 3);
        displaySpotlights(selectedMembers);

    } catch (error) {
        console.error('Error loading member data:', error);
        displaySpotlightError();
    }
}

function getRandomMembers(members, count) {
    const shuffled = [...members].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function displaySpotlights(members) {
    const spotlightContainer = document.getElementById('spotlight-container');

    spotlightContainer.innerHTML = members.map(member => {
        const membershipText = getMembershipText(member.membershipLevel);
        const membershipClass = getMembershipClass(member.membershipLevel);

        return `
            <div class="spotlight-card">
                <img src="images/${member.image}" alt="${member.name} logo" loading="lazy">
                <h3>${member.name}</h3>
                <p><strong>Phone:</strong> ${member.phone}</p>
                <p><strong>Address:</strong> ${member.address}</p>
                <p><strong>Industry:</strong> ${member.industry}</p>
                <p class="member-description">${member.description}</p>
                <p><a href="${member.website}" target="_blank" rel="noopener">Visit Website</a></p>
                <span class="membership-level ${membershipClass}">${membershipText}</span>
            </div>
        `;
    }).join('');
}

function getMembershipText(level) {
    switch (level) {
        case 3: return 'Gold Member';
        case 2: return 'Silver Member';
        case 1: return 'Bronze Member';
        default: return 'Member';
    }
}

function getMembershipClass(level) {
    switch (level) {
        case 3: return 'gold';
        case 2: return 'silver';
        case 1: return 'bronze';
        default: return 'member';
    }
}

function displaySpotlightError() {
    const spotlightContainer = document.getElementById('spotlight-container');
    spotlightContainer.innerHTML = '<p>Unable to load member spotlights at this time.</p>';
}

// Utility Functions
function capitalizeWords(str) {
    return str.replace(/\b\w/g, letter => letter.toUpperCase());
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    getWeatherData();
    loadMemberSpotlights();
});