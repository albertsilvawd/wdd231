// Hidden Gems Explorer - Storage Services Module
// Albert Silva - WDD 231 Final Project

// Storage Service Class - Manages local storage with comprehensive error handling and data validation
class StorageService {
    constructor(namespace = 'hiddenGems') {
        this.namespace = namespace;
        this.storageAvailable = this.checkStorageAvailability();
        this.memoryStore = new Map(); // Fallback for when localStorage isn't available
        this.maxStorageSize = 5 * 1024 * 1024; // 5MB estimate
        this.version = '1.0';

        if (!this.storageAvailable) {
            console.warn('âš ï¸ localStorage not available, using memory storage fallback');
        } else {
            console.log('âœ… localStorage available and ready');
        }

        // Initialize cleanup
        this.initCleanup();
    }

    // Check if localStorage is available and functional
    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.error('localStorage availability check failed:', error);
            return false;
        }
    }

    // Initialize periodic cleanup
    initCleanup() {
        // Clean up expired entries on initialization
        this.cleanupExpiredEntries();

        // Set up periodic cleanup (every 10 minutes)
        setInterval(() => {
            this.cleanupExpiredEntries();
        }, 10 * 60 * 1000);
    }

    // Generate namespaced key
    getNamespacedKey(key) {
        return `${this.namespace}_${key}`;
    }

    // Set item in storage with comprehensive error handling
    setItem(key, value, expirationHours = null) {
        const namespacedKey = this.getNamespacedKey(key);

        try {
            const storageData = {
                data: value,
                timestamp: Date.now(),
                version: this.version,
                type: typeof value,
                expires: expirationHours ? Date.now() + (expirationHours * 60 * 60 * 1000) : null
            };

            const serializedValue = JSON.stringify(storageData);

            // Check size before storing
            if (serializedValue.length > 1024 * 1024) { // 1MB per item limit
                console.warn(`âš ï¸ Large data size for key ${key}: ${(serializedValue.length / 1024).toFixed(2)}KB`);
            }

            if (this.storageAvailable) {
                // Check available space
                if (this.getStorageUsage().percentage > 80) {
                    console.warn('âš ï¸ Storage usage high, cleaning up...');
                    this.cleanupExpiredEntries();
                    this.cleanupOldEntries();
                }

                localStorage.setItem(namespacedKey, serializedValue);
            } else {
                this.memoryStore.set(namespacedKey, serializedValue);
            }

            console.log(`âœ… Stored item: ${key} (${(serializedValue.length / 1024).toFixed(2)}KB)`);
            return true;

        } catch (error) {
            console.error(`âŒ Error storing item ${key}:`, error);

            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError' || error.code === 22) {
                console.warn('ðŸ’¾ Storage quota exceeded, attempting cleanup...');

                try {
                    this.cleanupExpiredEntries();
                    this.cleanupOldEntries();

                    // Retry after cleanup
                    const storageData = {
                        data: value,
                        timestamp: Date.now(),
                        version: this.version,
                        type: typeof value,
                        expires: expirationHours ? Date.now() + (expirationHours * 60 * 60 * 1000) : null
                    };

                    const serializedValue = JSON.stringify(storageData);

                    if (this.storageAvailable) {
                        localStorage.setItem(namespacedKey, serializedValue);
                    } else {
                        this.memoryStore.set(namespacedKey, serializedValue);
                    }

                    console.log(`âœ… Stored item after cleanup: ${key}`);
                    return true;

                } catch (retryError) {
                    console.error(`âŒ Retry failed for ${key}:`, retryError);

                    // Last resort: try to store in memory
                    try {
                        this.memoryStore.set(namespacedKey, JSON.stringify(storageData));
                        console.log(`ðŸ’¾ Stored in memory fallback: ${key}`);
                        return true;
                    } catch (memoryError) {
                        console.error(`âŒ Memory fallback failed for ${key}:`, memoryError);
                        return false;
                    }
                }
            }

            return false;
        }
    }

    // Get item from storage with comprehensive error handling
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
                console.warn(`âš ï¸ Invalid stored data structure for key: ${key}, returning default`);
                this.removeItem(key); // Clean up invalid data
                return defaultValue;
            }

            // Check if data has expired
            if (parsed.expires && Date.now() > parsed.expires) {
                console.log(`â° Data expired for key: ${key}, removing`);
                this.removeItem(key);
                return defaultValue;
            }

            // Version compatibility check
            if (parsed.version && parsed.version !== this.version) {
                console.warn(`âš ï¸ Version mismatch for key: ${key} (stored: ${parsed.version}, current: ${this.version})`);
                // Could add migration logic here if needed
            }

            return parsed.data;

        } catch (error) {
            console.error(`âŒ Error retrieving item ${key}:`, error);

            // Try to clean up corrupted data
            try {
                this.removeItem(key);
            } catch (cleanupError) {
                console.error(`âŒ Failed to clean up corrupted data for ${key}:`, cleanupError);
            }

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

            console.log(`ðŸ—‘ï¸ Removed item: ${key}`);
            return true;

        } catch (error) {
            console.error(`âŒ Error removing item ${key}:`, error);
            return false;
        }
    }

    // Clear all namespaced items
    clear() {
        try {
            let removedCount = 0;

            if (this.storageAvailable) {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.namespace)) {
                        localStorage.removeItem(key);
                        removedCount++;
                    }
                });
            } else {
                // Clear memory store items with namespace
                for (const key of this.memoryStore.keys()) {
                    if (key.startsWith(this.namespace)) {
                        this.memoryStore.delete(key);
                        removedCount++;
                    }
                }
            }

            console.log(`ðŸ§¹ Cleared ${removedCount} items from storage`);
            return true;

        } catch (error) {
            console.error('âŒ Error clearing storage:', error);
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
            console.error('âŒ Error getting all keys:', error);
            return [];
        }
    }

    // Get storage usage information
    getStorageUsage() {
        try {
            if (!this.storageAvailable) {
                const memorySize = Array.from(this.memoryStore.values())
                    .reduce((total, value) => total + value.length, 0);

                return {
                    available: false,
                    type: 'memory',
                    items: this.memoryStore.size,
                    usedBytes: memorySize,
                    usedKB: Math.round(memorySize / 1024),
                    percentage: 0,
                    remainingBytes: 'unlimited'
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

            const percentage = (totalSize / this.maxStorageSize) * 100;
            const remainingBytes = Math.max(0, this.maxStorageSize - totalSize);

            return {
                available: true,
                type: 'localStorage',
                items: itemCount,
                usedBytes: totalSize,
                usedKB: Math.round(totalSize / 1024),
                usedMB: Math.round(totalSize / (1024 * 1024)),
                percentage: Math.round(percentage),
                remainingBytes,
                remainingKB: Math.round(remainingBytes / 1024),
                remainingMB: Math.round(remainingBytes / (1024 * 1024))
            };

        } catch (error) {
            console.error('âŒ Error getting storage usage:', error);
            return {
                available: false,
                error: error.message
            };
        }
    }

    // Clean up expired entries
    cleanupExpiredEntries() {
        try {
            const keys = this.getAllKeys();
            let expiredCount = 0;
            const now = Date.now();

            keys.forEach(key => {
                try {
                    const namespacedKey = this.getNamespacedKey(key);
                    let stored;

                    if (this.storageAvailable) {
                        stored = localStorage.getItem(namespacedKey);
                    } else {
                        stored = this.memoryStore.get(namespacedKey);
                    }

                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (parsed.expires && now > parsed.expires) {
                            this.removeItem(key);
                            expiredCount++;
                        }
                    }
                } catch (error) {
                    // If parsing fails, consider it corrupted and remove it
                    console.warn(`âš ï¸ Removing corrupted data for key: ${key}`);
                    this.removeItem(key);
                    expiredCount++;
                }
            });

            if (expiredCount > 0) {
                console.log(`ðŸ§¹ Cleaned up ${expiredCount} expired entries`);
            }

            return expiredCount;

        } catch (error) {
            console.error('âŒ Error cleaning expired entries:', error);
            return 0;
        }
    }

    // Clean up old entries based on age
    cleanupOldEntries(maxAgeHours = 168) { // Default: 1 week
        try {
            const keys = this.getAllKeys();
            let removedCount = 0;
            const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);

            // Non-expiring keys that should be preserved
            const preserveKeys = ['favorites', 'userPreferences', 'theme', 'settings'];

            keys.forEach(key => {
                if (preserveKeys.includes(key)) return;

                try {
                    const namespacedKey = this.getNamespacedKey(key);
                    let stored;

                    if (this.storageAvailable) {
                        stored = localStorage.getItem(namespacedKey);
                    } else {
                        stored = this.memoryStore.get(namespacedKey);
                    }

                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (parsed.timestamp && parsed.timestamp < cutoffTime) {
                            this.removeItem(key);
                            removedCount++;
                        }
                    }
                } catch (error) {
                    console.warn(`âš ï¸ Error processing old entry ${key}, removing:`, error);
                    this.removeItem(key);
                    removedCount++;
                }
            });

            if (removedCount > 0) {
                console.log(`ðŸ§¹ Cleaned up ${removedCount} old entries`);
            }

            return removedCount;

        } catch (error) {
            console.error('âŒ Error cleaning old entries:', error);
            return 0;
        }
    }

    // Export data for backup
    exportData() {
        try {
            const data = {};
            const keys = this.getAllKeys();
            let exportedCount = 0;

            keys.forEach(key => {
                try {
                    const value = this.getItem(key);
                    if (value !== null) {
                        data[key] = value;
                        exportedCount++;
                    }
                } catch (error) {
                    console.warn(`âš ï¸ Failed to export key ${key}:`, error);
                }
            });

            const exportData = {
                namespace: this.namespace,
                exportDate: new Date().toISOString(),
                version: this.version,
                itemCount: exportedCount,
                data
            };

            console.log(`ðŸ“¤ Exported ${exportedCount} items`);
            return exportData;

        } catch (error) {
            console.error('âŒ Error exporting data:', error);
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
                    console.error(`âŒ Error importing ${key}:`, error);
                }
            });

            console.log(`ðŸ“¥ Import complete: ${successCount} successful, ${errorCount} failed`);

            return {
                success: true,
                imported: successCount,
                failed: errorCount,
                details: imported
            };

        } catch (error) {
            console.error('âŒ Error importing data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get detailed storage statistics
    getStorageStats() {
        try {
            const keys = this.getAllKeys();
            const stats = {
                total: keys.length,
                byType: {},
                byAge: { hour: 0, day: 0, week: 0, month: 0, older: 0 },
                bySize: { small: 0, medium: 0, large: 0 },
                expired: 0,
                corrupted: 0
            };

            const now = Date.now();
            const hour = 60 * 60 * 1000;
            const day = 24 * hour;
            const week = 7 * day;
            const month = 30 * day;

            keys.forEach(key => {
                try {
                    const namespacedKey = this.getNamespacedKey(key);
                    let stored;

                    if (this.storageAvailable) {
                        stored = localStorage.getItem(namespacedKey);
                    } else {
                        stored = this.memoryStore.get(namespacedKey);
                    }

                    if (stored) {
                        const parsed = JSON.parse(stored);

                        // Type statistics
                        const type = parsed.type || 'unknown';
                        stats.byType[type] = (stats.byType[type] || 0) + 1;

                        // Age statistics
                        const age = now - (parsed.timestamp || now);
                        if (age < hour) stats.byAge.hour++;
                        else if (age < day) stats.byAge.day++;
                        else if (age < week) stats.byAge.week++;
                        else if (age < month) stats.byAge.month++;
                        else stats.byAge.older++;

                        // Size statistics
                        const size = stored.length;
                        if (size < 1024) stats.bySize.small++;
                        else if (size < 10240) stats.bySize.medium++;
                        else stats.bySize.large++;

                        // Expiration check
                        if (parsed.expires && now > parsed.expires) {
                            stats.expired++;
                        }
                    }
                } catch (error) {
                    stats.corrupted++;
                }
            });

            return stats;

        } catch (error) {
            console.error('âŒ Error getting storage stats:', error);
            return null;
        }
    }
}

// Specialized Favorites Service
class FavoritesService extends StorageService {
    constructor() {
        super('hiddenGems_favorites');
        this.favoritesKey = 'favoritesList';
    }

    getFavorites() {
        const favorites = this.getItem(this.favoritesKey, []);
        return Array.isArray(favorites) ? favorites : [];
    }

    addFavorite(attractionId) {
        try {
            const favorites = this.getFavorites();
            const idString = attractionId.toString();

            if (!favorites.includes(idString)) {
                favorites.push(idString);
                const success = this.setItem(this.favoritesKey, favorites);

                if (success) {
                    console.log(`â¤ï¸ Added to favorites: ${attractionId}`);
                    return true;
                }
            } else {
                console.log(`â„¹ï¸ Already in favorites: ${attractionId}`);
                return true;
            }

            return false;
        } catch (error) {
            console.error(`âŒ Error adding favorite ${attractionId}:`, error);
            return false;
        }
    }

    removeFavorite(attractionId) {
        try {
            const favorites = this.getFavorites();
            const idString = attractionId.toString();
            const index = favorites.indexOf(idString);

            if (index > -1) {
                favorites.splice(index, 1);
                const success = this.setItem(this.favoritesKey, favorites);

                if (success) {
                    console.log(`ðŸ’” Removed from favorites: ${attractionId}`);
                    return true;
                }
            } else {
                console.log(`â„¹ï¸ Not in favorites: ${attractionId}`);
                return true;
            }

            return false;
        } catch (error) {
            console.error(`âŒ Error removing favorite ${attractionId}:`, error);
            return false;
        }
    }

    isFavorite(attractionId) {
        try {
            const favorites = this.getFavorites();
            return favorites.includes(attractionId.toString());
        } catch (error) {
            console.error(`âŒ Error checking favorite ${attractionId}:`, error);
            return false;
        }
    }

    toggleFavorite(attractionId) {
        return this.isFavorite(attractionId)
            ? this.removeFavorite(attractionId)
            : this.addFavorite(attractionId);
    }

    clearFavorites() {
        try {
            const success = this.setItem(this.favoritesKey, []);
            if (success) {
                console.log('ðŸ§¹ Cleared all favorites');
            }
            return success;
        } catch (error) {
            console.error('âŒ Error clearing favorites:', error);
            return false;
        }
    }

    getFavoritesCount() {
        return this.getFavorites().length;
    }

    getFavoritesStats() {
        try {
            const favorites = this.getFavorites();
            return {
                total: favorites.length,
                addedToday: 0, // Would need timestamp tracking for this
                mostRecent: favorites.length > 0 ? favorites[favorites.length - 1] : null
            };
        } catch (error) {
            console.error('âŒ Error getting favorites stats:', error);
            return { total: 0, addedToday: 0, mostRecent: null };
        }
    }
}

// Visit History Service
class VisitHistoryService extends StorageService {
    constructor() {
        super('hiddenGems_history');
        this.historyKey = 'visitHistory';
        this.maxHistoryItems = 100;
    }

    addVisit(attractionId, attractionName = null, timestamp = Date.now()) {
        try {
            const history = this.getItem(this.historyKey, []);

            // Remove existing entry for this attraction
            const filtered = history.filter(item => item.attractionId !== attractionId.toString());

            // Add new entry at the beginning
            filtered.unshift({
                attractionId: attractionId.toString(),
                attractionName,
                timestamp,
                date: new Date(timestamp).toISOString(),
                id: `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });

            // Keep only the most recent visits
            const trimmed = filtered.slice(0, this.maxHistoryItems);

            const success = this.setItem(this.historyKey, trimmed);
            if (success) {
                console.log(`ðŸ“ Recorded visit to: ${attractionId}`);
            }
            return success;
        } catch (error) {
            console.error(`âŒ Error adding visit ${attractionId}:`, error);
            return false;
        }
    }

    getVisitHistory() {
        return this.getItem(this.historyKey, []);
    }

    getRecentVisits(count = 10) {
        const history = this.getVisitHistory();
        return history.slice(0, count);
    }

    hasVisited(attractionId) {
        try {
            const history = this.getVisitHistory();
            return history.some(item => item.attractionId === attractionId.toString());
        } catch (error) {
            console.error(`âŒ Error checking visit ${attractionId}:`, error);
            return false;
        }
    }

    getVisitCount(attractionId) {
        try {
            const history = this.getVisitHistory();
            return history.filter(item => item.attractionId === attractionId.toString()).length;
        } catch (error) {
            console.error(`âŒ Error getting visit count ${attractionId}:`, error);
            return 0;
        }
    }

    clearHistory() {
        try {
            const success = this.setItem(this.historyKey, []);
            if (success) {
                console.log('ðŸ§¹ Cleared visit history');
            }
            return success;
        } catch (error) {
            console.error('âŒ Error clearing history:', error);
            return false;
        }
    }

    getVisitStats() {
        try {
            const history = this.getVisitHistory();
            const uniqueAttractions = new Set(history.map(item => item.attractionId));

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
            const thisMonth = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

            const visitsToday = history.filter(visit => new Date(visit.timestamp) >= today).length;
            const visitsThisWeek = history.filter(visit => new Date(visit.timestamp) >= thisWeek).length;
            const visitsThisMonth = history.filter(visit => new Date(visit.timestamp) >= thisMonth).length;

            return {
                totalVisits: history.length,
                uniqueAttractions: uniqueAttractions.size,
                visitsToday,
                visitsThisWeek,
                visitsThisMonth,
                firstVisit: history.length > 0 ? history[history.length - 1].date : null,
                lastVisit: history.length > 0 ? history[0].date : null
            };
        } catch (error) {
            console.error('âŒ Error getting visit stats:', error);
            return null;
        }
    }
}

// User Preferences Service
class UserPreferencesService extends StorageService {
    constructor() {
        super('hiddenGems_preferences');
        this.preferencesKey = 'userPrefs';
        this.defaultPreferences = {
            theme: 'light',
            language: 'en',
            notifications: true,
            autoLocation: false,
            displayMode: 'grid',
            itemsPerPage: 6,
            defaultSort: 'rating',
            defaultFilter: 'all',
            showTips: true,
            animationsEnabled: true,
            compactMode: false
        };
    }

    getPreferences() {
        try {
            const stored = this.getItem(this.preferencesKey, {});
            return {
                ...this.defaultPreferences,
                ...stored
            };
        } catch (error) {
            console.error('âŒ Error getting preferences:', error);
            return this.defaultPreferences;
        }
    }

    setPreference(key, value) {
        try {
            const current = this.getPreferences();
            current[key] = value;

            const success = this.setItem(this.preferencesKey, current);
            if (success) {
                console.log(`âš™ï¸ Updated preference ${key}: ${value}`);
            }
            return success;
        } catch (error) {
            console.error(`âŒ Error setting preference ${key}:`, error);
            return false;
        }
    }

    resetPreferences() {
        try {
            const success = this.setItem(this.preferencesKey, this.defaultPreferences);
            if (success) {
                console.log('ðŸ”„ Reset preferences to defaults');
            }
            return success;
        } catch (error) {
            console.error('âŒ Error resetting preferences:', error);
            return false;
        }
    }

    getTheme() {
        return this.getPreferences().theme;
    }

    setTheme(theme) {
        return this.setPreference('theme', theme);
    }

    getDisplayMode() {
        return this.getPreferences().displayMode;
    }

    setDisplayMode(mode) {
        return this.setPreference('displayMode', mode);
    }
}

// Form Data Service
class FormDataService extends StorageService {
    constructor() {
        super('hiddenGems_forms');
        this.submissionsKey = 'submissions';
        this.maxSubmissions = 50;
    }

    saveFormData(formId, formData) {
        try {
            const submissions = this.getItem(this.submissionsKey, []);

            const submission = {
                formId,
                data: formData,
                timestamp: Date.now(),
                date: new Date().toISOString(),
                id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };

            submissions.unshift(submission);

            // Keep only recent submissions
            const trimmed = submissions.slice(0, this.maxSubmissions);

            const success = this.setItem(this.submissionsKey, trimmed);
            if (success) {
                console.log(`ðŸ“ Saved form submission: ${formId}`);
            }
            return success;
        } catch (error) {
            console.error(`âŒ Error saving form data ${formId}:`, error);
            return false;
        }
    }

    getFormSubmissions(formId = null) {
        try {
            const submissions = this.getItem(this.submissionsKey, []);

            if (formId) {
                return submissions.filter(sub => sub.formId === formId);
            }

            return submissions;
        } catch (error) {
            console.error('âŒ Error getting form submissions:', error);
            return [];
        }
    }

    getLastSubmission() {
        try {
            const submissions = this.getFormSubmissions();
            return submissions.length > 0 ? submissions[0] : null;
        } catch (error) {
            console.error('âŒ Error getting last submission:', error);
            return null;
        }
    }

    clearFormData() {
        try {
            const success = this.setItem(this.submissionsKey, []);
            if (success) {
                console.log('ðŸ§¹ Cleared form submissions');
            }
            return success;
        } catch (error) {
            console.error('âŒ Error clearing form data:', error);
            return false;
        }
    }

    getSubmissionStats() {
        try {
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
        } catch (error) {
            console.error('âŒ Error getting submission stats:', error);
            return null;
        }
    }
}

// Analytics Service
class AnalyticsService extends StorageService {
    constructor() {
        super('hiddenGems_analytics');
        this.eventsKey = 'events';
        this.maxEvents = 200;
    }

    trackEvent(eventName, eventData = {}) {
        try {
            const events = this.getItem(this.eventsKey, []);

            const event = {
                name: eventName,
                data: eventData,
                timestamp: Date.now(),
                date: new Date().toISOString(),
                sessionId: this.getSessionId(),
                url: window.location.pathname,
                userAgent: navigator.userAgent.substring(0, 100),
                id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };

            events.unshift(event);

            // Keep only recent events
            const trimmed = events.slice(0, this.maxEvents);

            const success = this.setItem(this.eventsKey, trimmed);
            if (success) {
                console.log(`ðŸ“Š Tracked event: ${eventName}`);
            }
            return success;
        } catch (error) {
            console.error(`âŒ Error tracking event ${eventName}:`, error);
            return false;
        }
    }

    getSessionId() {
        let sessionId = this.getItem('sessionId');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.setItem('sessionId', sessionId, 24); // Expire after 24 hours
        }
        return sessionId;
    }

    getEvents() {
        return this.getItem(this.eventsKey, []);
    }

    getEventsByType(eventName) {
        try {
            const events = this.getEvents();
            return events.filter(event => event.name === eventName);
        } catch (error) {
            console.error(`âŒ Error getting events by type ${eventName}:`, error);
            return [];
        }
    }

    getUsageStats() {
        try {
            const events = this.getEvents();
            const pageViews = events.filter(e => e.name === 'page_view');
            const interactions = events.filter(e => e.name === 'interaction');
            const sessions = new Set(events.map(e => e.sessionId));

            return {
                totalEvents: events.length,
                pageViews: pageViews.length,
                interactions: interactions.length,
                sessionsCount: sessions.size,
                firstEvent: events.length > 0 ? events[events.length - 1].date : null,
                lastEvent: events.length > 0 ? events[0].date : null
            };
        } catch (error) {
            console.error('âŒ Error getting usage stats:', error);
            return null;
        }
    }

    clearAnalytics() {
        try {
            this.removeItem(this.eventsKey);
            this.removeItem('sessionId');
            console.log('ðŸ§¹ Cleared analytics data');
            return true;
        } catch (error) {
            console.error('âŒ Error clearing analytics:', error);
            return false;
        }
    }
}

// Create service instances
const storageService = new StorageService();
const favoritesService = new FavoritesService();
const visitHistoryService = new VisitHistoryService();
const userPreferencesService = new UserPreferencesService();
const formDataService = new FormDataService();
const analyticsService = new AnalyticsService();

// Storage utilities
const storageUtils = {
    // Clear all application data
    clearAllData() {
        try {
            const services = [
                storageService,
                favoritesService,
                visitHistoryService,
                userPreferencesService,
                formDataService,
                analyticsService
            ];

            let cleared = 0;
            services.forEach(service => {
                if (service.clear()) {
                    cleared++;
                }
            });

            console.log(`ðŸ§¹ Cleared data from ${cleared} services`);
            return cleared === services.length;
        } catch (error) {
            console.error('âŒ Error clearing all data:', error);
            return false;
        }
    },

    // Get comprehensive storage overview
    getStorageOverview() {
        try {
            return {
                main: storageService.getStorageUsage(),
                favorites: favoritesService.getStorageUsage(),
                history: visitHistoryService.getStorageUsage(),
                preferences: userPreferencesService.getStorageUsage(),
                forms: formDataService.getStorageUsage(),
                analytics: analyticsService.getStorageUsage(),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('âŒ Error getting storage overview:', error);
            return { error: error.message };
        }
    },

    // Export all application data
    exportAllData() {
        try {
            return {
                exportDate: new Date().toISOString(),
                version: '1.0',
                services: {
                    main: storageService.exportData(),
                    favorites: favoritesService.exportData(),
                    history: visitHistoryService.exportData(),
                    preferences: userPreferencesService.exportData(),
                    forms: formDataService.exportData(),
                    analytics: analyticsService.exportData()
                }
            };
        } catch (error) {
            console.error('âŒ Error exporting all data:', error);
            return { error: error.message };
        }
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
                favorites: favoritesService,
                history: visitHistoryService,
                preferences: userPreferencesService,
                forms: formDataService,
                analytics: analyticsService
            };

            Object.entries(exportedData.services).forEach(([serviceName, serviceData]) => {
                if (services[serviceName] && serviceData) {
                    results[serviceName] = services[serviceName].importData(serviceData);
                }
            });

            console.log('ðŸ“¥ Import completed for all services');
            return {
                success: true,
                results
            };
        } catch (error) {
            console.error('âŒ Error importing all data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Optimize storage across all services
    optimizeStorage() {
        try {
            const results = {
                expiredCleanup: 0,
                oldEntriesCleanup: 0,
                errors: []
            };

            const services = [
                storageService,
                favoritesService,
                visitHistoryService,
                userPreferencesService,
                formDataService,
                analyticsService
            ];

            services.forEach(service => {
                try {
                    results.expiredCleanup += service.cleanupExpiredEntries();
                    results.oldEntriesCleanup += service.cleanupOldEntries();
                } catch (error) {
                    results.errors.push(`Error optimizing ${service.constructor.name}: ${error.message}`);
                }
            });

            console.log('ðŸ”§ Storage optimization complete:', results);
            return results;
        } catch (error) {
            console.error('âŒ Error optimizing storage:', error);
            return { error: error.message };
        }
    },

    // Get storage health check
    checkStorageHealth() {
        try {
            const health = {
                overall: 'good',
                issues: [],
                recommendations: []
            };

            const overview = this.getStorageOverview();

            // Check if storage is available
            if (!storageService.storageAvailable) {
                health.issues.push('localStorage not available, using memory fallback');
                health.overall = 'warning';
                health.recommendations.push('Some data may be lost when browser is closed');
            }

            // Check storage usage
            if (overview.main.percentage > 80) {
                health.issues.push(`High storage usage: ${overview.main.percentage}%`);
                health.overall = 'warning';
                health.recommendations.push('Clear old data or increase storage limits');
            }

            // Check for too many items
            const totalItems = Object.values(overview).reduce((sum, service) =>
                sum + (service.items || 0), 0);

            if (totalItems > 1000) {
                health.issues.push(`High item count: ${totalItems} items`);
                health.recommendations.push('Consider archiving old data');
            }

            // Check for errors in recent operations
            const errorLog = storageService.getItem('errorLog', []);
            const recentErrors = errorLog.filter(error =>
                Date.now() - new Date(error.timestamp).getTime() < 24 * 60 * 60 * 1000
            );

            if (recentErrors.length > 10) {
                health.issues.push(`High error rate: ${recentErrors.length} errors in 24h`);
                health.overall = 'poor';
                health.recommendations.push('Check browser console for detailed error information');
            }

            return health;
        } catch (error) {
            return {
                overall: 'error',
                issues: ['Health check failed'],
                error: error.message
            };
        }
    }
};

// Export all services and utilities
export {
    StorageService,
    FavoritesService,
    VisitHistoryService,
    UserPreferencesService,
    FormDataService,
    AnalyticsService,
    storageService,
    favoritesService,
    visitHistoryService,
    userPreferencesService,
    formDataService,
    analyticsService,
    storageUtils
};