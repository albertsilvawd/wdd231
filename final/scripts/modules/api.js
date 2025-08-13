// Hidden Gems Explorer - API Services Module
// Albert Silva - WDD 231 Final Project

// API Configuration
const API_CONFIG = {
    weather: {
        baseUrl: 'https://api.openweathermap.org/data/2.5',
        key: 'YOUR_API_KEY_HERE', // Replace with your actual OpenWeather API key
        units: 'metric'
    },
    countries: {
        baseUrl: 'https://restcountries.com/v3.1'
    },
    attractions: {
        localPath: './data/attractions.json'
    }
};

// API Service Class with proper error handling and try/catch blocks
class ApiService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    // Generic fetch method with comprehensive error handling and caching
    async fetchData(url, cacheKey = null, options = {}) {
        // Check cache first
        if (cacheKey && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log(`âœ… Using cached data for: ${cacheKey}`);
                return cached.data;
            } else {
                // Remove expired cache entry
                this.cache.delete(cacheKey);
            }
        }

        // Retry logic with exponential backoff
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`ðŸŒ Fetching data from: ${url} (attempt ${attempt})`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const response = await fetch(url, {
                    method: 'GET',
                    signal: controller.signal,
                    ...options
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                // Cache the successful response
                if (cacheKey) {
                    this.cache.set(cacheKey, {
                        data,
                        timestamp: Date.now()
                    });
                    console.log(`ðŸ’¾ Cached data for: ${cacheKey}`);
                }

                console.log(`âœ… Successfully fetched data from: ${url}`);
                return data;

            } catch (error) {
                console.warn(`âŒ Attempt ${attempt} failed for ${url}:`, error.message);

                // If it's the last attempt, throw the error
                if (attempt === this.retryAttempts) {
                    const enhancedError = new Error(`Failed to fetch data after ${this.retryAttempts} attempts: ${error.message}`);
                    enhancedError.originalError = error;
                    enhancedError.url = url;
                    enhancedError.attempts = attempt;
                    throw enhancedError;
                }

                // Wait before retrying (exponential backoff)
                await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
            }
        }
    }

    // Utility method for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get weather data for a city with proper try/catch
    async getWeatherData(city) {
        try {
            console.log(`ðŸŒ¤ï¸ Fetching weather data for: ${city}`);

            // Check if we have a valid API key
            if (!API_CONFIG.weather.key || API_CONFIG.weather.key === 'YOUR_API_KEY_HERE') {
                console.warn('âš ï¸ No valid weather API key configured, using mock data');
                return this.getMockWeatherData(city);
            }

            const url = `${API_CONFIG.weather.baseUrl}/weather?q=${encodeURIComponent(city)}&appid=${API_CONFIG.weather.key}&units=${API_CONFIG.weather.units}`;
            const cacheKey = `weather_${city.toLowerCase()}`;

            const weatherData = await this.fetchData(url, cacheKey);

            // Validate weather data structure
            if (!weatherData.main || !weatherData.weather || !Array.isArray(weatherData.weather)) {
                throw new Error('Invalid weather data structure received');
            }

            console.log(`âœ… Weather data loaded for ${city}: ${weatherData.main.temp}Â°C`);
            return weatherData;

        } catch (error) {
            console.error(`âŒ Weather API failed for ${city}:`, error);

            // Fallback to mock data
            console.log('ðŸ”„ Falling back to mock weather data');
            return this.getMockWeatherData(city);
        }
    }

    // Get country information with proper try/catch
    async getCountryInfo(countryName) {
        try {
            console.log(`ðŸŒ Fetching country info for: ${countryName}`);

            const url = `${API_CONFIG.countries.baseUrl}/name/${encodeURIComponent(countryName)}?fields=name,capital,population,region,languages,currencies,flags,timezones`;
            const cacheKey = `country_${countryName.toLowerCase()}`;

            const countryData = await this.fetchData(url, cacheKey);

            // Validate country data structure
            if (!Array.isArray(countryData) || countryData.length === 0) {
                throw new Error('No country data found');
            }

            const country = countryData[0];
            if (!country.name || !country.capital) {
                throw new Error('Invalid country data structure');
            }

            console.log(`âœ… Country data loaded for ${countryName}: ${country.capital[0]}`);
            return countryData;

        } catch (error) {
            console.error(`âŒ Countries API failed for ${countryName}:`, error);

            // Fallback to mock data
            console.log('ðŸ”„ Falling back to mock country data');
            return this.getMockCountryData(countryName);
        }
    }

    // Get attractions data from local JSON with proper try/catch
    async getAttractionsData() {
        try {
            console.log('ðŸ—ºï¸ Fetching attractions data from local JSON');

            const cacheKey = 'attractions_data';

            // Check cache first
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    console.log('âœ… Using cached attractions data');
                    return cached.data;
                }
            }

            const response = await fetch(API_CONFIG.attractions.localPath);

            if (!response.ok) {
                throw new Error(`Failed to load attractions: HTTP ${response.status}`);
            }

            const data = await response.json();

            // Validate attractions data structure
            if (!data.attractions || !Array.isArray(data.attractions)) {
                throw new Error('Invalid attractions data structure: missing attractions array');
            }

            if (!data.categories || !Array.isArray(data.categories)) {
                throw new Error('Invalid attractions data structure: missing categories array');
            }

            // Validate each attraction has required fields
            const requiredFields = ['id', 'name', 'category', 'description', 'location', 'cost', 'accessibility', 'rating'];
            data.attractions.forEach((attraction, index) => {
                requiredFields.forEach(field => {
                    if (!attraction.hasOwnProperty(field)) {
                        throw new Error(`Attraction ${index} missing required field: ${field}`);
                    }
                });
            });

            // Update category counts based on actual data
            data.categories = data.categories.map(category => {
                const count = data.attractions.filter(attr => attr.category === category.name).length;
                return { ...category, count };
            });

            // Cache the validated data
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            console.log(`âœ… Loaded ${data.attractions.length} attractions and ${data.categories.length} categories`);
            return data;

        } catch (error) {
            console.error('âŒ Failed to load attractions data:', error);

            // Fallback to embedded data
            console.log('ðŸ”„ Falling back to embedded attractions data');
            return this.getFallbackAttractionsData();
        }
    }

    // Mock weather data for demo/fallback purposes
    getMockWeatherData(city) {
        console.log(`ðŸŽ­ Generating mock weather data for: ${city}`);

        const mockData = {
            'Buenos Aires': {
                name: 'Buenos Aires',
                main: {
                    temp: 22,
                    feels_like: 24,
                    humidity: 65,
                    pressure: 1013,
                    temp_min: 18,
                    temp_max: 26
                },
                weather: [{
                    id: 802,
                    main: 'Clouds',
                    description: 'partly cloudy',
                    icon: '02d'
                }],
                wind: {
                    speed: 3.5,
                    deg: 120
                },
                visibility: 10000,
                dt: Math.floor(Date.now() / 1000)
            }
        };

        const cityData = mockData[city] || {
            name: city,
            main: {
                temp: 20 + Math.random() * 10,
                feels_like: 22 + Math.random() * 8,
                humidity: 50 + Math.random() * 40,
                pressure: 1010 + Math.random() * 20,
                temp_min: 15 + Math.random() * 5,
                temp_max: 25 + Math.random() * 10
            },
            weather: [{
                id: 800,
                main: 'Clear',
                description: 'clear sky',
                icon: '01d'
            }],
            wind: {
                speed: 2 + Math.random() * 5,
                deg: Math.random() * 360
            },
            visibility: 10000,
            dt: Math.floor(Date.now() / 1000)
        };

        // Round temperature values
        cityData.main.temp = Math.round(cityData.main.temp);
        cityData.main.feels_like = Math.round(cityData.main.feels_like);

        return cityData;
    }

    // Mock country data for demo/fallback purposes
    getMockCountryData(countryName) {
        console.log(`ðŸŽ­ Generating mock country data for: ${countryName}`);

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
            population: 1000000,
            region: 'Unknown',
            languages: { en: 'English' },
            currencies: { USD: { name: 'US Dollar', symbol: '$' } },
            flags: { svg: '', png: '' },
            timezones: ['UTC+00:00']
        }];
    }

    // Comprehensive fallback attractions data
    getFallbackAttractionsData() {
        console.log('ðŸŽ­ Using embedded fallback attractions data');

        return {
            attractions: [
                {
                    id: 1,
                    name: "Secret Rooftop Garden",
                    category: "Nature",
                    description: "Hidden oasis above the city with panoramic views and exotic plants. A peaceful escape featuring rare botanical specimens and stunning sunset vistas over Buenos Aires.",
                    location: "Microcentro, above GalerÃ­a GÃ¼emes",
                    cost: "Free",
                    accessibility: "Limited Access",
                    rating: 4.8,
                    difficulty: "Easy",
                    bestTime: "Golden hour (5-7 PM)",
                    tips: "Enter through the old GalerÃ­a building, take elevator to top floor",
                    image: "ancient-trees.webp",
                    coordinates: [-34.6037, -58.3816],
                    tags: ["photography", "peaceful", "views", "plants", "sunset"],
                    historicalInfo: "Created in 1987 by local artist Maria Santos as a community green space."
                },
                {
                    id: 2,
                    name: "Underground Art Gallery",
                    category: "Culture",
                    description: "Former subway tunnel transformed into a vibrant underground art space showcasing local street artists and experimental installations.",
                    location: "Barracas, near Parque Lezama",
                    cost: "Low",
                    accessibility: "Partially Accessible",
                    rating: 4.6,
                    difficulty: "Easy",
                    bestTime: "Weekday afternoons",
                    tips: "Look for the metal door with graffiti murals, open Tuesday-Sunday",
                    image: "graffiti-hall.webp",
                    coordinates: [-34.6298, -58.3713],
                    tags: ["art", "unique", "underground", "local artists", "murals"],
                    historicalInfo: "Abandoned subway tunnel from 1920s, converted to art space in 2015."
                },
                {
                    id: 3,
                    name: "Historic Clock Tower",
                    category: "Architecture",
                    description: "19th-century clock tower with original mechanisms still functioning. Offers guided tours and incredible city views from the observation deck.",
                    location: "San Telmo, Plaza Dorrego area",
                    cost: "Low",
                    accessibility: "Limited Access",
                    rating: 4.9,
                    difficulty: "Moderate",
                    bestTime: "Morning tours (10 AM)",
                    tips: "Book tours in advance, wear comfortable shoes for climbing",
                    image: "clock-tower.webp",
                    coordinates: [-34.6214, -58.3731],
                    tags: ["history", "architecture", "views", "guided tours", "vintage"],
                    historicalInfo: "Built in 1889, served as the city's main timekeeper for over 80 years."
                }
            ],
            categories: [
                { name: "Nature", icon: "ðŸŒ¿", count: 1, description: "Natural escapes and outdoor experiences" },
                { name: "Culture", icon: "ðŸŽ¨", count: 1, description: "Art, crafts, and cultural experiences" },
                { name: "Architecture", icon: "ðŸ›ï¸", count: 1, description: "Historic buildings and architectural marvels" },
                { name: "History", icon: "ðŸ“œ", count: 0, description: "Historical sites and heritage locations" },
                { name: "Entertainment", icon: "ðŸŽ­", count: 0, description: "Music, performances, and nightlife" },
                { name: "Food", icon: "ðŸ½ï¸", count: 0, description: "Culinary gems and food experiences" },
                { name: "Shopping", icon: "ðŸ›ï¸", count: 0, description: "Unique shopping and market experiences" }
            ],
            stats: {
                totalAttractions: 3,
                totalCategories: 7,
                freeAttractions: 1,
                accessibleAttractions: 0,
                averageRating: 4.8
            }
        };
    }

    // Clear cache method
    clearCache() {
        const cacheSize = this.cache.size;
        this.cache.clear();
        console.log(`ðŸ—‘ï¸ Cleared ${cacheSize} cache entries`);
    }

    // Get cache status and statistics
    getCacheStatus() {
        const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
            key,
            age: Date.now() - value.timestamp,
            ageMinutes: Math.round((Date.now() - value.timestamp) / 60000),
            size: JSON.stringify(value.data).length,
            expired: (Date.now() - value.timestamp) > this.cacheTimeout
        }));

        const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
        const expiredCount = entries.filter(entry => entry.expired).length;

        return {
            totalEntries: this.cache.size,
            totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
            expiredEntries: expiredCount,
            validEntries: this.cache.size - expiredCount,
            entries: entries.sort((a, b) => b.age - a.age) // Sort by age, newest first
        };
    }

    // Clean expired cache entries
    cleanExpiredCache() {
        const initialSize = this.cache.size;
        const now = Date.now();

        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }

        const cleanedCount = initialSize - this.cache.size;
        if (cleanedCount > 0) {
            console.log(`ðŸ§¹ Cleaned ${cleanedCount} expired cache entries`);
        }

        return cleanedCount;
    }

    // Get API health status
    async getApiHealth() {
        const health = {
            weather: { status: 'unknown', latency: null, error: null },
            countries: { status: 'unknown', latency: null, error: null },
            attractions: { status: 'unknown', latency: null, error: null }
        };

        // Test weather API
        try {
            const startTime = Date.now();
            await this.getWeatherData('Buenos Aires');
            health.weather.status = 'healthy';
            health.weather.latency = Date.now() - startTime;
        } catch (error) {
            health.weather.status = 'error';
            health.weather.error = error.message;
        }

        // Test countries API
        try {
            const startTime = Date.now();
            await this.getCountryInfo('Argentina');
            health.countries.status = 'healthy';
            health.countries.latency = Date.now() - startTime;
        } catch (error) {
            health.countries.status = 'error';
            health.countries.error = error.message;
        }

        // Test attractions data
        try {
            const startTime = Date.now();
            await this.getAttractionsData();
            health.attractions.status = 'healthy';
            health.attractions.latency = Date.now() - startTime;
        } catch (error) {
            health.attractions.status = 'error';
            health.attractions.error = error.message;
        }

        return health;
    }
}

// Weather API specific methods with enhanced error handling
class WeatherAPI {
    static async getCurrentWeather(city) {
        try {
            const api = new ApiService();
            return await api.getWeatherData(city);
        } catch (error) {
            console.error(`Weather API error for ${city}:`, error);
            throw new APIError(`Failed to get weather for ${city}`, null, 'weather');
        }
    }

    static async getWeatherForecast(city, days = 5) {
        try {
            console.log(`ðŸŒ¤ï¸ Fetching ${days}-day forecast for ${city}`);

            if (API_CONFIG.weather.key === 'YOUR_API_KEY_HERE') {
                return WeatherAPI.getMockForecast(city, days);
            }

            const api = new ApiService();
            const url = `${API_CONFIG.weather.baseUrl}/forecast?q=${encodeURIComponent(city)}&appid=${API_CONFIG.weather.key}&units=${API_CONFIG.weather.units}&cnt=${days * 8}`;

            const forecastData = await api.fetchData(url, `forecast_${city}_${days}`);

            if (!forecastData.list || !Array.isArray(forecastData.list)) {
                throw new Error('Invalid forecast data structure');
            }

            return forecastData;

        } catch (error) {
            console.error(`Forecast API failed for ${city}:`, error);
            return WeatherAPI.getMockForecast(city, days);
        }
    }

    static getMockForecast(city, days) {
        console.log(`ðŸŽ­ Generating mock ${days}-day forecast for ${city}`);

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
                    humidity: 60 + (Math.random() * 30),
                    pressure: 1010 + (Math.random() * 20)
                },
                weather: [{
                    main: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
                    description: ['clear sky', 'partly cloudy', 'light rain'][Math.floor(Math.random() * 3)],
                    icon: ['01d', '02d', '10d'][Math.floor(Math.random() * 3)]
                }],
                wind: {
                    speed: 2 + Math.random() * 8,
                    deg: Math.random() * 360
                }
            });
        }

        return {
            city: { name: city },
            cnt: forecast.length,
            list: forecast
        };
    }
}

// Countries API specific methods with enhanced error handling
class CountriesAPI {
    static async getCountryByName(name) {
        try {
            const api = new ApiService();
            return await api.getCountryInfo(name);
        } catch (error) {
            console.error(`Countries API error for ${name}:`, error);
            throw new APIError(`Failed to get country info for ${name}`, null, 'countries');
        }
    }

    static async getCountryByCode(code) {
        try {
            console.log(`ðŸŒ Fetching country by code: ${code}`);

            const api = new ApiService();
            const url = `${API_CONFIG.countries.baseUrl}/alpha/${code}?fields=name,capital,population,region,languages,currencies,flags`;
            const countryData = await api.fetchData(url, `country_code_${code}`);

            if (!countryData || !countryData.name) {
                throw new Error('Invalid country data received');
            }

            return countryData;

        } catch (error) {
            console.error(`Country by code API failed for ${code}:`, error);
            return null;
        }
    }

    static async getAllCountries() {
        try {
            console.log('ðŸŒ Fetching all countries data');

            const api = new ApiService();
            const url = `${API_CONFIG.countries.baseUrl}/all?fields=name,capital,population,region,flags`;
            const countriesData = await api.fetchData(url, 'all_countries');

            if (!Array.isArray(countriesData)) {
                throw new Error('Invalid countries data structure');
            }

            return countriesData;

        } catch (error) {
            console.error('All countries API failed:', error);
            return [];
        }
    }

    static async getCountriesByRegion(region) {
        try {
            console.log(`ðŸŒ Fetching countries in region: ${region}`);

            const api = new ApiService();
            const url = `${API_CONFIG.countries.baseUrl}/region/${encodeURIComponent(region)}?fields=name,capital,population,flags`;
            return await api.fetchData(url, `region_${region}`);

        } catch (error) {
            console.error(`Region API failed for ${region}:`, error);
            return [];
        }
    }
}

// Attractions API specific methods with enhanced error handling
class AttractionsAPI {
    static async getAllAttractions() {
        try {
            const api = new ApiService();
            const data = await api.getAttractionsData();
            return data;
        } catch (error) {
            console.error('Attractions API error:', error);
            throw new APIError('Failed to load attractions data', null, 'attractions');
        }
    }

    static async getAttractionsByCategory(category) {
        try {
            const data = await AttractionsAPI.getAllAttractions();
            if (!data || !data.attractions) return [];

            return data.attractions.filter(
                attraction => attraction.category.toLowerCase() === category.toLowerCase()
            );
        } catch (error) {
            console.error(`Error filtering attractions by category ${category}:`, error);
            return [];
        }
    }

    static async getAttractionById(id) {
        try {
            const data = await AttractionsAPI.getAllAttractions();
            if (!data || !data.attractions) return null;

            return data.attractions.find(attraction => attraction.id == id);
        } catch (error) {
            console.error(`Error finding attraction by ID ${id}:`, error);
            return null;
        }
    }

    static async searchAttractions(query) {
        try {
            const data = await AttractionsAPI.getAllAttractions();
            if (!data || !data.attractions) return [];

            const searchTerm = query.toLowerCase();
            return data.attractions.filter(attraction =>
                attraction.name.toLowerCase().includes(searchTerm) ||
                attraction.description.toLowerCase().includes(searchTerm) ||
                attraction.location.toLowerCase().includes(searchTerm) ||
                attraction.category.toLowerCase().includes(searchTerm) ||
                (attraction.tags && attraction.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        } catch (error) {
            console.error(`Error searching attractions for "${query}":`, error);
            return [];
        }
    }

    static async getFeaturedAttractions(count = 3) {
        try {
            const data = await AttractionsAPI.getAllAttractions();
            if (!data || !data.attractions) return [];

            // Return highest rated attractions
            return data.attractions
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, count);
        } catch (error) {
            console.error('Error getting featured attractions:', error);
            return [];
        }
    }

    static async getAttractionsByFilter(filters = {}) {
        try {
            const data = await AttractionsAPI.getAllAttractions();
            if (!data || !data.attractions) return [];

            return data.attractions.filter(attraction => {
                // Category filter
                if (filters.category && attraction.category !== filters.category) {
                    return false;
                }

                // Cost filter
                if (filters.cost && attraction.cost !== filters.cost) {
                    return false;
                }

                // Accessibility filter
                if (filters.accessibility && attraction.accessibility !== filters.accessibility) {
                    return false;
                }

                // Rating filter
                if (filters.minRating && (attraction.rating || 0) < filters.minRating) {
                    return false;
                }

                // Difficulty filter
                if (filters.difficulty && attraction.difficulty !== filters.difficulty) {
                    return false;
                }

                return true;
            });
        } catch (error) {
            console.error('Error filtering attractions:', error);
            return [];
        }
    }

    static async getAttractionStats() {
        try {
            const data = await AttractionsAPI.getAllAttractions();
            if (!data || !data.attractions) return null;

            const attractions = data.attractions;
            const categories = [...new Set(attractions.map(a => a.category))];
            const costs = [...new Set(attractions.map(a => a.cost))];
            const accessibilityLevels = [...new Set(attractions.map(a => a.accessibility))];

            return {
                total: attractions.length,
                categories: categories.length,
                averageRating: attractions.reduce((sum, a) => sum + (a.rating || 0), 0) / attractions.length,
                costBreakdown: costs.map(cost => ({
                    cost,
                    count: attractions.filter(a => a.cost === cost).length
                })),
                accessibilityBreakdown: accessibilityLevels.map(level => ({
                    level,
                    count: attractions.filter(a => a.accessibility === level).length
                })),
                categoryBreakdown: categories.map(category => ({
                    category,
                    count: attractions.filter(a => a.category === category).length
                }))
            };
        } catch (error) {
            console.error('Error getting attraction stats:', error);
            return null;
        }
    }
}

// Enhanced error handling class
class APIError extends Error {
    constructor(message, status = null, endpoint = null, originalError = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.endpoint = endpoint;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            endpoint: this.endpoint,
            timestamp: this.timestamp,
            originalError: this.originalError ? this.originalError.message : null
        };
    }
}

// Enhanced rate limiting utility
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
            console.warn(`âš ï¸ Rate limit exceeded: ${this.requests.length}/${this.maxRequests} requests in ${this.windowMs}ms window`);
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

    getStatus() {
        return {
            requestsInWindow: this.requests.length,
            maxRequests: this.maxRequests,
            remaining: this.getRemainingRequests(),
            resetTime: this.getResetTime(),
            windowMs: this.windowMs
        };
    }
}

// Network connectivity utilities
class NetworkUtils {
    static isOnline() {
        return navigator.onLine;
    }

    static async waitForConnection(timeout = 5000) {
        return new Promise((resolve, reject) => {
            if (navigator.onLine) {
                resolve(true);
                return;
            }

            const timer = setTimeout(() => {
                window.removeEventListener('online', onOnline);
                reject(new Error('Network timeout: No connection available'));
            }, timeout);

            const onOnline = () => {
                clearTimeout(timer);
                window.removeEventListener('online', onOnline);
                resolve(true);
            };

            window.addEventListener('online', onOnline);
        });
    }

    static async retryRequest(requestFn, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await requestFn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;

                console.log(`ðŸ”„ Request failed, retrying in ${delay}ms... (${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            }
        }
    }

    static async checkNetworkSpeed() {
        try {
            const startTime = Date.now();
            const response = await fetch('https://httpbin.org/bytes/1024', { cache: 'no-cache' });
            await response.arrayBuffer();
            const endTime = Date.now();

            const duration = endTime - startTime;
            const speed = 1024 / (duration / 1000); // bytes per second

            return {
                duration,
                speed: Math.round(speed),
                speedKbps: Math.round(speed / 1024),
                quality: speed > 1024 ? 'good' : speed > 512 ? 'moderate' : 'slow'
            };
        } catch (error) {
            console.error('Network speed test failed:', error);
            return { duration: null, speed: null, quality: 'unknown' };
        }
    }
}

// Create instances
const apiService = new ApiService();
const rateLimiter = new RateLimiter();

// Global API utilities
const apiUtils = {
    // Format API errors for user display
    formatError(error) {
        if (error instanceof APIError) {
            return 'Service temporarily unavailable. Please try again later.';
        }
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return 'Network error. Please check your internet connection.';
        }
        if (error.message.includes('timeout')) {
            return 'Request timed out. Please try again.';
        }
        return 'An unexpected error occurred. Please try again.';
    },

    // Check if online
    isOnline() {
        return NetworkUtils.isOnline();
    },

    // Wait for network connectivity
    async waitForConnection(timeout = 5000) {
        return NetworkUtils.waitForConnection(timeout);
    },

    // Retry failed requests with exponential backoff
    async retryRequest(requestFn, maxRetries = 3, delay = 1000) {
        return NetworkUtils.retryRequest(requestFn, maxRetries, delay);
    },

    // Test network connectivity and speed
    async testConnection() {
        try {
            if (!NetworkUtils.isOnline()) {
                return { online: false, speed: null, apis: null };
            }

            const [speed, apis] = await Promise.all([
                NetworkUtils.checkNetworkSpeed(),
                apiService.getApiHealth()
            ]);

            return {
                online: true,
                speed,
                apis,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Connection test failed:', error);
            return {
                online: NetworkUtils.isOnline(),
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    },

    // Get comprehensive API status
    async getSystemStatus() {
        try {
            const [cacheStatus, health, rateLimiterStatus] = await Promise.all([
                apiService.getCacheStatus(),
                apiService.getApiHealth(),
                Promise.resolve(rateLimiter.getStatus())
            ]);

            return {
                cache: cacheStatus,
                apis: health,
                rateLimiter: rateLimiterStatus,
                network: NetworkUtils.isOnline(),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('System status check failed:', error);
            return { error: error.message, timestamp: new Date().toISOString() };
        }
    }
};

// Initialize cleanup interval for cache
setInterval(() => {
    apiService.cleanExpiredCache();
}, 5 * 60 * 1000); // Clean every 5 minutes

// Export all API services and utilities
export {
    apiService,
    WeatherAPI,
    CountriesAPI,
    AttractionsAPI,
    APIError,
    RateLimiter,
    NetworkUtils,
    rateLimiter,
    apiUtils
};