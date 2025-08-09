// Hidden Gems Explorer - API Services Module
// Albert Silva - WDD 231 Final Project

// API Configuration
const API_CONFIG = {
    weather: {
        baseUrl: 'https://api.openweathermap.org/data/2.5',
        key: 'demo_key', // Replace with your actual OpenWeather API key
        units: 'metric'
    },
    countries: {
        baseUrl: 'https://restcountries.com/v3.1'
    },
    attractions: {
        localPath: './data/attractions.json'
    }
};

// API Service Class
class ApiService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Generic fetch method with error handling and caching
    async fetchData(url, cacheKey = null, options = {}) {
        try {
            // Check cache first
            if (cacheKey && this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    console.log(`Using cached data for: ${cacheKey}`);
                    return cached.data;
                }
            }

            console.log(`Fetching data from: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Cache the response
            if (cacheKey) {
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
            }

            return data;
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    }

    // Get weather data for a city
    async getWeatherData(city) {
        try {
            // For demo purposes, return mock data if API key is not configured
            if (API_CONFIG.weather.key === 'demo_key') {
                return this.getMockWeatherData(city);
            }

            const url = `${API_CONFIG.weather.baseUrl}/weather?q=${encodeURIComponent(city)}&appid=${API_CONFIG.weather.key}&units=${API_CONFIG.weather.units}`;
            const cacheKey = `weather_${city}`;

            return await this.fetchData(url, cacheKey);
        } catch (error) {
            console.warn('Weather API failed, using mock data:', error);
            return this.getMockWeatherData(city);
        }
    }

    // Get country information
    async getCountryInfo(countryName) {
        try {
            const url = `${API_CONFIG.countries.baseUrl}/name/${encodeURIComponent(countryName)}`;
            const cacheKey = `country_${countryName}`;

            return await this.fetchData(url, cacheKey);
        } catch (error) {
            console.warn('Countries API failed, using mock data:', error);
            return this.getMockCountryData(countryName);
        }
    }

    // Get attractions data from local JSON
    async getAttractionsData() {
        try {
            const cacheKey = 'attractions_data';

            // Check cache first
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            const response = await fetch(API_CONFIG.attractions.localPath);

            if (!response.ok) {
                throw new Error(`Failed to load attractions: ${response.status}`);
            }

            const data = await response.json();

            // Cache the data
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.warn('Failed to load attractions data, using fallback:', error);
            return this.getFallbackAttractionsData();
        }
    }

    // Mock weather data for demo purposes
    getMockWeatherData(city) {
        const mockData = {
            'Buenos Aires': {
                name: 'Buenos Aires',
                main: {
                    temp: 22,
                    feels_like: 24,
                    humidity: 65,
                    pressure: 1013
                },
                weather: [{
                    main: 'Clouds',
                    description: 'partly cloudy',
                    icon: '02d'
                }],
                wind: {
                    speed: 3.5
                },
                visibility: 10000
            }
        };

        return mockData[city] || {
            name: city,
            main: { temp: 20, feels_like: 22, humidity: 60, pressure: 1013 },
            weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
            wind: { speed: 2.5 },
            visibility: 10000
        };
    }

    // Mock country data for demo purposes
    getMockCountryData(countryName) {
        const mockData = {
            'Argentina': [{
                name: {
                    common: 'Argentina',
                    official: 'Argentine Republic'
                },
                capital: ['Buenos Aires'],
                population: 45376763,
                region: 'South America',
                subregion: 'South America',
                languages: {
                    spa: 'Spanish'
                },
                currencies: {
                    ARS: {
                        name: 'Argentine peso',
                        symbol: '$'
                    }
                },
                flags: {
                    svg: 'https://flagcdn.com/ar.svg',
                    png: 'https://flagcdn.com/w320/ar.png'
                },
                timezones: ['UTC-03:00']
            }]
        };

        return mockData[countryName] || [{
            name: { common: countryName, official: countryName },
            capital: ['Unknown'],
            population: 0,
            region: 'Unknown',
            languages: { en: 'English' },
            currencies: { USD: { name: 'US Dollar', symbol: '$' } },
            flags: { svg: '', png: '' }
        }];
    }

    // Fallback attractions data
    getFallbackAttractionsData() {
        return {
            attractions: [
                {
                    id: 1,
                    name: "Secret Rooftop Garden",
                    category: "Nature",
                    description: "Hidden oasis above the city with panoramic views and exotic plants. A peaceful escape featuring rare botanical specimens from around the world.",
                    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop",
                    rating: 4.8,
                    difficulty: "Easy",
                    location: "Palermo, Buenos Aires",
                    coordinates: "-34.5731,-58.4264",
                    tags: ["peaceful", "photography", "sunset", "garden"],
                    bestTime: "Late afternoon for best lighting"
                },
                {
                    id: 2,
                    name: "Underground Art Gallery",
                    category: "Culture",
                    description: "Subterranean art space showcasing local artists in converted subway tunnels. Features rotating exhibitions and interactive installations.",
                    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
                    rating: 4.6,
                    difficulty: "Medium",
                    location: "San Telmo, Buenos Aires",
                    coordinates: "-34.6158,-58.3731",
                    tags: ["art", "underground", "local", "creative"],
                    bestTime: "Weekday evenings when less crowded"
                },
                {
                    id: 3,
                    name: "Vintage Bookstore Café",
                    category: "Culture",
                    description: "Charming bookstore with hidden reading nooks and artisanal coffee. Features rare first editions and cozy atmosphere perfect for book lovers.",
                    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=300&fit=crop",
                    rating: 4.7,
                    difficulty: "Easy",
                    location: "Recoleta, Buenos Aires",
                    coordinates: "-34.5875,-58.3974",
                    tags: ["books", "coffee", "cozy", "literary"],
                    bestTime: "Morning hours for quiet reading"
                }
            ]
        };
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('API cache cleared');
    }

    // Get cache status
    getCacheStatus() {
        const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
            key,
            age: Date.now() - value.timestamp,
            size: JSON.stringify(value.data).length
        }));

        return {
            totalEntries: this.cache.size,
            entries
        };
    }
}

// Weather API specific methods
class WeatherAPI {
    static async getCurrentWeather(city) {
        const api = new ApiService();
        return await api.getWeatherData(city);
    }

    static async getWeatherForecast(city, days = 5) {
        try {
            if (API_CONFIG.weather.key === 'demo_key') {
                return WeatherAPI.getMockForecast(city, days);
            }

            const api = new ApiService();
            const url = `${API_CONFIG.weather.baseUrl}/forecast?q=${encodeURIComponent(city)}&appid=${API_CONFIG.weather.key}&units=${API_CONFIG.weather.units}&cnt=${days * 8}`;

            return await api.fetchData(url, `forecast_${city}_${days}`);
        } catch (error) {
            console.warn('Forecast API failed, using mock data:', error);
            return WeatherAPI.getMockForecast(city, days);
        }
    }

    static getMockForecast(city, days) {
        const forecast = [];
        const baseTemp = 20;

        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);

            forecast.push({
                dt: Math.floor(date.getTime() / 1000),
                dt_txt: date.toISOString(),
                main: {
                    temp: baseTemp + (Math.random() * 10 - 5),
                    temp_max: baseTemp + 5 + (Math.random() * 5),
                    temp_min: baseTemp - 5 + (Math.random() * 5),
                    humidity: 60 + (Math.random() * 30)
                },
                weather: [{
                    main: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
                    description: 'sample weather',
                    icon: '01d'
                }]
            });
        }

        return {
            city: { name: city },
            list: forecast
        };
    }
}

// Countries API specific methods
class CountriesAPI {
    static async getCountryByName(name) {
        const api = new ApiService();
        return await api.getCountryInfo(name);
    }

    static async getCountryByCode(code) {
        try {
            const api = new ApiService();
            const url = `${API_CONFIG.countries.baseUrl}/alpha/${code}`;
            return await api.fetchData(url, `country_code_${code}`);
        } catch (error) {
            console.warn('Country by code API failed:', error);
            return null;
        }
    }

    static async getAllCountries() {
        try {
            const api = new ApiService();
            const url = `${API_CONFIG.countries.baseUrl}/all?fields=name,capital,population,region,flags`;
            return await api.fetchData(url, 'all_countries');
        } catch (error) {
            console.warn('All countries API failed:', error);
            return [];
        }
    }
}

// Attractions API specific methods
class AttractionsAPI {
    static async getAllAttractions() {
        const api = new ApiService();
        return await api.getAttractionsData();
    }

    static async getAttractionsByCategory(category) {
        const data = await AttractionsAPI.getAllAttractions();
        if (!data || !data.attractions) return [];

        return data.attractions.filter(
            attraction => attraction.category.toLowerCase() === category.toLowerCase()
        );
    }

    static async getAttractionById(id) {
        const data = await AttractionsAPI.getAllAttractions();
        if (!data || !data.attractions) return null;

        return data.attractions.find(attraction => attraction.id == id);
    }

    static async searchAttractions(query) {
        const data = await AttractionsAPI.getAllAttractions();
        if (!data || !data.attractions) return [];

        const searchTerm = query.toLowerCase();
        return data.attractions.filter(attraction =>
            attraction.name.toLowerCase().includes(searchTerm) ||
            attraction.description.toLowerCase().includes(searchTerm) ||
            attraction.location.toLowerCase().includes(searchTerm) ||
            attraction.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    static async getFeaturedAttractions(count = 3) {
        const data = await AttractionsAPI.getAllAttractions();
        if (!data || !data.attractions) return [];

        // Return highest rated attractions
        return data.attractions
            .sort((a, b) => b.rating - a.rating)
            .slice(0, count);
    }
}

// Error handling utility
class APIError extends Error {
    constructor(message, status = null, endpoint = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.endpoint = endpoint;
        this.timestamp = new Date().toISOString();
    }
}

// Rate limiting utility
class RateLimiter {
    constructor(maxRequests = 60, windowMs = 60000) {
        this.requests = [];
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    canMakeRequest() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.windowMs);

        if (this.requests.length >= this.maxRequests) {
            return false;
        }

        this.requests.push(now);
        return true;
    }

    getRemainingRequests() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        return Math.max(0, this.maxRequests - this.requests.length);
    }

    getResetTime() {
        if (this.requests.length === 0) return 0;
        const oldestRequest = Math.min(...this.requests);
        return oldestRequest + this.windowMs;
    }
}

// Create instances
const apiService = new ApiService();
const rateLimiter = new RateLimiter();

// Utility functions
const apiUtils = {
    // Format API errors for user display
    formatError(error) {
        if (error instanceof APIError) {
            return 'Service temporarily unavailable. Please try again later.';
        }
        return 'An unexpected error occurred. Please check your connection.';
    },

    // Check if online
    isOnline() {
        return navigator.onLine;
    },

    // Wait for network connectivity
    async waitForConnection(timeout = 5000) {
        return new Promise((resolve, reject) => {
            if (navigator.onLine) {
                resolve(true);
                return;
            }

            const timer = setTimeout(() => {
                window.removeEventListener('online', onOnline);
                reject(new Error('Network timeout'));
            }, timeout);

            const onOnline = () => {
                clearTimeout(timer);
                window.removeEventListener('online', onOnline);
                resolve(true);
            };

            window.addEventListener('online', onOnline);
        });
    },

    // Retry failed requests
    async retryRequest(requestFn, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await requestFn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;

                console.log(`Request failed, retrying in ${delay}ms... (${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            }
        }
    }
};

// Export all API services
export {
    apiService,
    WeatherAPI,
    CountriesAPI,
    AttractionsAPI,
    APIError,
    RateLimiter,
    rateLimiter,
    apiUtils
};