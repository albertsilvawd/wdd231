// Hidden Gems Explorer - Storage Services Module
// Albert Silva - WDD 231 Final Project

// Storage Service Class - Manages local storage with error handling and data validation
class StorageService {
    constructor(namespace = 'hiddenGems') {
        this.namespace = namespace;
        this.storageAvailable = this.checkStorageAvailability();
        this.memoryStore = new Map(); // Fallback for when localStorage isn't available

        if (!this.storageAvailable) {
            console.warn('localStorage not available, using memory storage');
        }
    }

    // Check if localStorage is available
    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Generate namespaced key
    getNamespacedKey(key) {
        return `${this.namespace}_${key}`;
    }

    // Set item in storage with error handling
    setItem(key, value) {
        const namespacedKey = this.getNamespacedKey(key);

        try {
            const serializedValue = JSON.stringify({
                data: value,
                timestamp: Date.now(),
                version: '1.0'
            });

            if (this.storageAvailable) {
                localStorage.setItem(namespacedKey, serializedValue);
            } else {
                this.memoryStore.set(namespacedKey, serializedValue);
            }

            console.log(`Stored item: ${key}`);
            return true;
        } catch (error) {
            console.error(`Error storing item ${key}:`, error);

            // Try to clear some space and retry
            if (error.name === 'QuotaExceededError') {
                this.clearOldEntries();
                try {
                    if (this.storageAvailable) {
                        localStorage.setItem(namespacedKey, JSON.stringify({
                            data: value,
                            timestamp: Date.now(),
                            version: '1.0'
                        }));
                    } else {
                        this.memoryStore.set(namespacedKey, JSON.stringify({
                            data: value,
                            timestamp: Date.now(),
                            version: '1.0'
                        }));
                    }
                    return true;
                } catch (retryError) {
                    console.error(`Retry failed for ${key}:`, retryError);
                    return false;
                }
            }
            return false;
        }
    }

    // Get item from storage with error handling
    getItem(key, defaultValue = null) {
        const namespacedKey = this.getNamespacedKey(key);

        try {
            let stored;

            if (this.storageAvailable) {
                stored = localStorage.getItem(namespacedKey);
            } else {
                stored = this.memoryStore.get(namespacedKey);
            }

            if (stored === null || stored === undefined) {
                return defaultValue;
            }

            const parsed = JSON.parse(stored);

            // Validate stored data structure
            if (!parsed || typeof parsed !== 'object' || !parsed.hasOwnProperty('data')) {
                console.warn(`Invalid stored data for key: ${key}`);
                return defaultValue;
            }

            // Check data freshness (optional expiration)
            if (parsed.timestamp && this.isExpired(parsed.timestamp, key)) {
                this.removeItem(key);
                return defaultValue;
            }

            return parsed.data;
        } catch (error) {
            console.error(`Error retrieving item ${key}:`, error);
            return defaultValue;
        }
    }

    // Remove item from storage
    removeItem(key) {
        const namespacedKey = this.getNamespacedKey(key);

        try {
            if (this.storageAvailable) {
                localStorage.removeItem(namespacedKey);
            } else {
                this.memoryStore.delete(namespacedKey);
            }
            console.log(`Removed item: ${key}`);
            return true;
        } catch (error) {
            console.error(`Error removing item ${key}:`, error);
            return false;
        }
    }

    // Clear all namespaced items
    clear() {
        try {
            if (this.storageAvailable) {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.namespace)) {
                        localStorage.removeItem(key);
                    }
                });
            } else {
                // Clear memory store items with namespace
                for (const key of this.memoryStore.keys()) {
                    if (key.startsWith(this.namespace)) {
                        this.memoryStore.delete(key);
                    }
                }
            }

            console.log('Storage cleared');
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    // Get all namespaced keys
    getAllKeys() {
        try {
            const keys = [];

            if (this.storageAvailable) {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.namespace)) {
                        keys.push(key.replace(`${this.namespace}_`, ''));
                    }
                }
            } else {
                for (const key of this.memoryStore.keys()) {
                    if (key.startsWith(this.namespace)) {
                        keys.push(key.replace(`${this.namespace}_`, ''));
                    }
                }
            }

            return keys;
        } catch (error) {
            console.error('Error getting all keys:', error);
            return [];
        }
    }

    // Check if data is expired (default: 7 days)
    isExpired(timestamp, key, maxAge = 7 * 24 * 60 * 60 * 1000) {
        // Some data types don't expire
        const nonExpiringKeys = ['userPreferences', 'favorites', 'theme'];
        if (nonExpiringKeys.includes(key)) {
            return false;
        }

        return (Date.now() - timestamp) > maxAge;
    }

    // Clear old entries to free up space
    clearOldEntries() {
        try {
            const keys = this.getAllKeys();
            const now = Date.now();
            const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

            keys.forEach(key => {
                const data = this.getItem(key);
                if (data && data.timestamp && data.timestamp < oneWeekAgo) {
                    this.removeItem(key);
                }
            });

            console.log('Old entries cleared');
        } catch (error) {
            console.error('Error clearing old entries:', error);
        }
    }

    // Get storage usage information
    getStorageInfo() {
        try {
            if (!this.storageAvailable) {
                return {
                    available: false,
                    type: 'memory',
                    items: this.memoryStore.size,
                    totalSize: 0,
                    remainingSpace: 'unlimited'
                };
            }

            let totalSize = 0;
            let itemCount = 0;

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.namespace)) {
                    const value = localStorage.getItem(key);
                    totalSize += (key.length + (value ? value.length : 0)) * 2; // UTF-16 uses 2 bytes per character
                    itemCount++;
                }
            }

            // Estimate remaining space (localStorage limit is usually 5-10MB)
            const estimatedLimit = 5 * 1024 * 1024; // 5MB
            const remainingSpace = Math.max(0, estimatedLimit - totalSize);

            return {
                available: true,
                type: 'localStorage',
                items: itemCount,
                totalSize: this.formatBytes(totalSize),
                remainingSpace: this.formatBytes(remainingSpace)
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return {
                available: false,
                error: error.message
            };
        }
    }

    // Format bytes for display
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Export data for backup
    exportData() {
        try {
            const data = {};
            const keys = this.getAllKeys();

            keys.forEach(key => {
                data[key] = this.getItem(key);
            });

            return {
                namespace: this.namespace,
                exportDate: new Date().toISOString(),
                version: '1.0',
                data
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    // Import data from backup
    importData(exportedData) {
        try {
            if (!exportedData || !exportedData.data) {
                throw new Error('Invalid exported data format');
            }

            const imported = {};
            let successCount = 0;
            let errorCount = 0;

            Object.entries(exportedData.data).forEach(([key, value]) => {
                try {
                    if (this.setItem(key, value)) {
                        imported[key] = true;
                        successCount++;
                    } else {
                        imported[key] = false;
                        errorCount++;
                    }
                } catch (error) {
                    imported[key] = false;
                    errorCount++;
                    console.error(`Error importing ${key}:`, error);
                }
            });

            console.log(`Import complete: ${successCount} successful, ${errorCount} failed`);

            return {
                success: true,
                imported: successCount,
                failed: errorCount,
                details: imported
            };
        } catch (error) {
            console.error('Error importing data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Specialized storage services for different data types
class UserPreferencesService extends StorageService {
    constructor() {
        super('hiddenGems_preferences');
        this.defaultPreferences = {
            theme: 'light',
            language: 'en',
            notifications: true,
            autoLocation: false,
            displayMode: 'grid',
            itemsPerPage: 6,
            defaultSort: 'name',
            defaultFilter: 'all'
        };
    }

    getPreferences() {
        return {
            ...this.defaultPreferences,
            ...this.getItem('userPrefs', {})
        };
    }

    setPreference(key, value) {
        const current = this.getPreferences();
        current[key] = value;
        return this.setItem('userPrefs', current);
    }

    resetPreferences() {
        return this.setItem('userPrefs', this.defaultPreferences);
    }

    getTheme() {
        return this.getPreferences().theme;
    }

    setTheme(theme) {
        return this.setPreference('theme', theme);
    }
}

class FavoritesService extends StorageService {
    constructor() {
        super('hiddenGems_favorites');
    }

    getFavorites() {
        return this.getItem('favoritesList', []);
    }

    addFavorite(attractionId) {
        const favorites = this.getFavorites();
        if (!favorites.includes(attractionId)) {
            favorites.push(attractionId);
            return this.setItem('favoritesList', favorites);
        }
        return true;
    }

    removeFavorite(attractionId) {
        const favorites = this.getFavorites();
        const index = favorites.indexOf(attractionId);
        if (index > -1) {
            favorites.splice(index, 1);
            return this.setItem('favoritesList', favorites);
        }
        return true;
    }

    isFavorite(attractionId) {
        return this.getFavorites().includes(attractionId);
    }

    clearFavorites() {
        return this.setItem('favoritesList', []);
    }

    getFavoritesCount() {
        return this.getFavorites().length;
    }
}

class VisitHistoryService extends StorageService {
    constructor() {
        super('hiddenGems_history');
    }

    addVisit(attractionId, timestamp = Date.now()) {
        const history = this.getItem('visitHistory', []);

        // Remove existing entry for this attraction
        const filtered = history.filter(item => item.attractionId !== attractionId);

        // Add new entry at the beginning
        filtered.unshift({
            attractionId,
            timestamp,
            date: new Date(timestamp).toISOString()
        });

        // Keep only last 50 visits
        const trimmed = filtered.slice(0, 50);

        return this.setItem('visitHistory', trimmed);
    }

    getVisitHistory() {
        return this.getItem('visitHistory', []);
    }

    getRecentVisits(count = 10) {
        return this.getVisitHistory().slice(0, count);
    }

    hasVisited(attractionId) {
        const history = this.getVisitHistory();
        return history.some(item => item.attractionId === attractionId);
    }

    getVisitCount(attractionId) {
        const history = this.getVisitHistory();
        return history.filter(item => item.attractionId === attractionId).length;
    }

    clearHistory() {
        return this.setItem('visitHistory', []);
    }

    getVisitStats() {
        const history = this.getVisitHistory();
        const uniqueAttractions = new Set(history.map(item => item.attractionId));

        return {
            totalVisits: history.length,
            uniqueAttractions: uniqueAttractions.size,
            firstVisit: history.length > 0 ? history[history.length - 1].date : null,
            lastVisit: history.length > 0 ? history[0].date : null
        };
    }
}

class SearchHistoryService extends StorageService {
    constructor() {
        super('hiddenGems_search');
    }

    addSearch(query, timestamp = Date.now()) {
        if (!query || query.trim().length < 2) return false;

        const searches = this.getItem('searchHistory', []);
        const normalizedQuery = query.trim().toLowerCase();

        // Remove existing entry
        const filtered = searches.filter(item => item.query !== normalizedQuery);

        // Add new entry at the beginning
        filtered.unshift({
            query: normalizedQuery,
            originalQuery: query.trim(),
            timestamp,
            date: new Date(timestamp).toISOString()
        });

        // Keep only last 20 searches
        const trimmed = filtered.slice(0, 20);

        return this.setItem('searchHistory', trimmed);
    }

    getSearchHistory() {
        return this.getItem('searchHistory', []);
    }

    getRecentSearches(count = 5) {
        return this.getSearchHistory().slice(0, count);
    }

    clearSearchHistory() {
        return this.setItem('searchHistory', []);
    }

    getPopularSearches(count = 5) {
        const searches = this.getSearchHistory();
        const queryCount = {};

        searches.forEach(search => {
            queryCount[search.query] = (queryCount[search.query] || 0) + 1;
        });

        return Object.entries(queryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([query, count]) => ({ query, count }));
    }
}

class CacheService extends StorageService {
    constructor() {
        super('hiddenGems_cache');
        this.defaultCacheTime = 60 * 60 * 1000; // 1 hour
    }

    setCacheItem(key, data, customTTL = null) {
        const ttl = customTTL || this.defaultCacheTime;
        const cacheData = {
            data,
            timestamp: Date.now(),
            ttl,
            expires: Date.now() + ttl
        };

        return this.setItem(`cache_${key}`, cacheData);
    }

    getCacheItem(key) {
        const cacheData = this.getItem(`cache_${key}`);

        if (!cacheData) return null;

        // Check if expired
        if (Date.now() > cacheData.expires) {
            this.removeItem(`cache_${key}`);
            return null;
        }

        return cacheData.data;
    }

    isCacheValid(key) {
        const cacheData = this.getItem(`cache_${key}`);
        return cacheData && Date.now() <= cacheData.expires;
    }

    clearExpiredCache() {
        const keys = this.getAllKeys();
        const now = Date.now();
        let cleared = 0;

        keys.forEach(key => {
            if (key.startsWith('cache_')) {
                const cacheData = this.getItem(key);
                if (cacheData && cacheData.expires && now > cacheData.expires) {
                    this.removeItem(key);
                    cleared++;
                }
            }
        });

        console.log(`Cleared ${cleared} expired cache entries`);
        return cleared;
    }

    getCacheStats() {
        const keys = this.getAllKeys().filter(key => key.startsWith('cache_'));
        const now = Date.now();
        let validCount = 0;
        let expiredCount = 0;
        let totalSize = 0;

        keys.forEach(key => {
            const cacheData = this.getItem(key);
            if (cacheData) {
                totalSize += JSON.stringify(cacheData).length;
                if (cacheData.expires && now <= cacheData.expires) {
                    validCount++;
                } else {
                    expiredCount++;
                }
            }
        });

        return {
            totalEntries: keys.length,
            validEntries: validCount,
            expiredEntries: expiredCount,
            totalSize: this.formatBytes(totalSize * 2) // UTF-16 estimate
        };
    }
}

// Analytics and usage tracking service
class AnalyticsService extends StorageService {
    constructor() {
        super('hiddenGems_analytics');
    }

    trackEvent(eventName, eventData = {}) {
        const events = this.getItem('events', []);

        const event = {
            name: eventName,
            data: eventData,
            timestamp: Date.now(),
            date: new Date().toISOString(),
            sessionId: this.getSessionId(),
            url: window.location.pathname
        };

        events.unshift(event);

        // Keep only last 100 events
        const trimmed = events.slice(0, 100);

        return this.setItem('events', trimmed);
    }

    getSessionId() {
        let sessionId = this.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            this.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    getEvents() {
        return this.getItem('events', []);
    }

    getEventsByType(eventName) {
        const events = this.getEvents();
        return events.filter(event => event.name === eventName);
    }

    getUsageStats() {
        const events = this.getEvents();
        const pageViews = events.filter(e => e.name === 'page_view');
        const interactions = events.filter(e => e.name === 'interaction');

        return {
            totalEvents: events.length,
            pageViews: pageViews.length,
            interactions: interactions.length,
            sessionsCount: new Set(events.map(e => e.sessionId)).size,
            firstEvent: events.length > 0 ? events[events.length - 1].date : null,
            lastEvent: events.length > 0 ? events[0].date : null
        };
    }

    clearAnalytics() {
        this.removeItem('events');
        this.removeItem('sessionId');
    }
}

// Form data service for handling form submissions
class FormDataService extends StorageService {
    constructor() {
        super('hiddenGems_forms');
    }

    saveFormData(formId, formData) {
        const submissions = this.getItem('submissions', []);

        const submission = {
            formId,
            data: formData,
            timestamp: Date.now(),
            date: new Date().toISOString(),
            id: 'form_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        };

        submissions.unshift(submission);

        // Keep only last 50 submissions
        const trimmed = submissions.slice(0, 50);

        return this.setItem('submissions', trimmed);
    }

    getFormSubmissions(formId = null) {
        const submissions = this.getItem('submissions', []);

        if (formId) {
            return submissions.filter(sub => sub.formId === formId);
        }

        return submissions;
    }

    clearFormData() {
        return this.setItem('submissions', []);
    }

    getSubmissionStats() {
        const submissions = this.getFormSubmissions();
        const formTypes = {};

        submissions.forEach(sub => {
            formTypes[sub.formId] = (formTypes[sub.formId] || 0) + 1;
        });

        return {
            totalSubmissions: submissions.length,
            formTypes,
            firstSubmission: submissions.length > 0 ? submissions[submissions.length - 1].date : null,
            lastSubmission: submissions.length > 0 ? submissions[0].date : null
        };
    }
}

// Create service instances
const storageService = new StorageService();
const userPreferencesService = new UserPreferencesService();
const favoritesService = new FavoritesService();
const visitHistoryService = new VisitHistoryService();
const searchHistoryService = new SearchHistoryService();
const cacheService = new CacheService();
const analyticsService = new AnalyticsService();
const formDataService = new FormDataService();

// Storage utilities
const storageUtils = {
    // Clear all application data
    clearAllData() {
        try {
            storageService.clear();
            userPreferencesService.clear();
            favoritesService.clear();
            visitHistoryService.clear();
            searchHistoryService.clear();
            cacheService.clear();
            analyticsService.clear();
            formDataService.clear();

            console.log('All application data cleared');
            return true;
        } catch (error) {
            console.error('Error clearing all data:', error);
            return false;
        }
    },

    // Get complete storage overview
    getStorageOverview() {
        return {
            main: storageService.getStorageInfo(),
            preferences: userPreferencesService.getStorageInfo(),
            favorites: favoritesService.getStorageInfo(),
            history: visitHistoryService.getStorageInfo(),
            search: searchHistoryService.getStorageInfo(),
            cache: cacheService.getStorageInfo(),
            analytics: analyticsService.getStorageInfo(),
            forms: formDataService.getStorageInfo()
        };
    },

    // Export all application data
    exportAllData() {
        return {
            exportDate: new Date().toISOString(),
            version: '1.0',
            services: {
                main: storageService.exportData(),
                preferences: userPreferencesService.exportData(),
                favorites: favoritesService.exportData(),
                history: visitHistoryService.exportData(),
                search: searchHistoryService.exportData(),
                cache: cacheService.exportData(),
                analytics: analyticsService.exportData(),
                forms: formDataService.exportData()
            }
        };
    },

    // Import all application data
    importAllData(exportedData) {
        try {
            if (!exportedData || !exportedData.services) {
                throw new Error('Invalid export data format');
            }

            const results = {};
            const services = {
                main: storageService,
                preferences: userPreferencesService,
                favorites: favoritesService,
                history: visitHistoryService,
                search: searchHistoryService,
                cache: cacheService,
                analytics: analyticsService,
                forms: formDataService
            };

            Object.entries(exportedData.services).forEach(([serviceName, serviceData]) => {
                if (services[serviceName] && serviceData) {
                    results[serviceName] = services[serviceName].importData(serviceData);
                }
            });

            return {
                success: true,
                results
            };
        } catch (error) {
            console.error('Error importing all data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Check storage health
    checkStorageHealth() {
        const health = {
            overall: 'good',
            issues: [],
            recommendations: []
        };

        try {
            // Check if storage is available
            if (!storageService.storageAvailable) {
                health.issues.push('localStorage not available');
                health.overall = 'warning';
            }

            // Check cache size
            const cacheStats = cacheService.getCacheStats();
            if (cacheStats.expiredEntries > 10) {
                health.issues.push(`${cacheStats.expiredEntries} expired cache entries`);
                health.recommendations.push('Clear expired cache');
            }

            // Check storage usage
            const overview = this.getStorageOverview();
            const totalItems = Object.values(overview).reduce((sum, service) =>
                sum + (service.items || 0), 0);

            if (totalItems > 1000) {
                health.issues.push('High storage usage');
                health.recommendations.push('Consider clearing old data');
                health.overall = 'warning';
            }

            return health;
        } catch (error) {
            return {
                overall: 'error',
                issues: ['Storage health check failed'],
                error: error.message
            };
        }
    },

    // Optimize storage
    optimizeStorage() {
        try {
            const results = {
                clearedCache: cacheService.clearExpiredCache(),
                clearedOldEntries: 0
            };

            // Clear old entries from various services
            [storageService, visitHistoryService, searchHistoryService, analyticsService].forEach(service => {
                if (service.clearOldEntries) {
                    service.clearOldEntries();
                    results.clearedOldEntries++;
                }
            });

            console.log('Storage optimization complete:', results);
            return results;
        } catch (error) {
            console.error('Error optimizing storage:', error);
            return { error: error.message };
        }
    }
};

// Export all services and utilities
export {
    StorageService,
    UserPreferencesService,
    FavoritesService,
    VisitHistoryService,
    SearchHistoryService,
    CacheService,
    AnalyticsService,
    FormDataService,
    storageService,
    userPreferencesService,
    favoritesService,
    visitHistoryService,
    searchHistoryService,
    cacheService,
    analyticsService,
    formDataService,
    storageUtils
};