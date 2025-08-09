// Hidden Gems Explorer - UI Helpers Module
// Albert Silva - WDD 231 Final Project

// UI Helpers Class - Provides utility functions for DOM manipulation and UI interactions
class UIHelpers {
    constructor() {
        this.activeModals = [];
        this.activeToasts = [];
        this.loaders = new Map();
        this.observers = new Map();

        // Initialize global UI features
        this.initGlobalStyles();
        this.initAccessibilityFeatures();
    }

    // Initialize global styles and CSS custom properties
    initGlobalStyles() {
        // Add dynamic CSS custom properties
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);

        // Update on resize
        window.addEventListener('resize', () => {
            document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        });
    }

    // Initialize accessibility features
    initAccessibilityFeatures() {
        // Add focus management for better keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });

        // Add skip links if they don't exist
        this.addSkipLinks();
    }

    // Add skip navigation links for accessibility
    addSkipLinks() {
        const existingSkipLink = document.querySelector('.skip-link');
        if (existingSkipLink) return;

        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            z-index: 1000;
            padding: 8px;
            background: var(--primary-blue);
            color: white;
            text-decoration: none;
            border-radius: 4px;
            transition: top 0.3s;
        `;

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Show loading spinner
    showLoader(selector, message = 'Loading...') {
        const container = this.getElement(selector);
        if (!container) return false;

        const loaderId = `loader_${Date.now()}`;
        const loader = document.createElement('div');
        loader.id = loaderId;
        loader.className = 'loading-container';
        loader.setAttribute('aria-live', 'polite');
        loader.setAttribute('aria-label', message);

        loader.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p class="loading-text">${message}</p>
            </div>
        `;

        // Add CSS if not already present
        this.addLoaderStyles();

        container.appendChild(loader);
        this.loaders.set(selector, loaderId);

        return loaderId;
    }

    // Hide loading spinner
    hideLoader(selector) {
        const loaderId = this.loaders.get(selector);
        if (!loaderId) return false;

        const loader = document.getElementById(loaderId);
        if (loader) {
            loader.remove();
            this.loaders.delete(selector);
            return true;
        }
        return false;
    }

    // Add loader styles to document
    addLoaderStyles() {
        if (document.getElementById('loader-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'loader-styles';
        styles.textContent = `
            .loading-container {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 2rem;
                min-height: 100px;
            }
            
            .loading-spinner {
                text-align: center;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f4f6;
                border-top: 4px solid var(--primary-blue);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-text {
                color: var(--neutral-gray);
                font-size: 0.9rem;
                margin: 0;
            }
        `;

        document.head.appendChild(styles);
    }

    // Show toast notification
    showToast(message, type = 'info', duration = 4000, actions = []) {
        const toastId = `toast_${Date.now()}`;
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');

        const iconMap = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const actionsHTML = actions.length > 0 ?
            `<div class="toast-actions">
                ${actions.map(action =>
                `<button class="toast-action" data-action="${action.action}">${action.label}</button>`
            ).join('')}
            </div>` : '';

        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${iconMap[type] || iconMap.info}</span>
                <span class="toast-message">${message}</span>
                ${actionsHTML}
                <button class="toast-close" aria-label="Close notification">&times;</button>
            </div>
        `;

        // Add toast styles if not present
        this.addToastStyles();

        // Add to container or create one
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        container.appendChild(toast);
        this.activeToasts.push(toastId);

        // Add event listeners
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.hideToast(toastId));

        // Action buttons
        toast.querySelectorAll('.toast-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleToastAction(action, toastId);
            });
        });

        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => this.hideToast(toastId), duration);
        }

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('toast-show');
        });

        return toastId;
    }

    // Hide toast notification
    hideToast(toastId) {
        const toast = document.getElementById(toastId);
        if (!toast) return false;

        toast.classList.add('toast-hide');

        setTimeout(() => {
            toast.remove();
            const index = this.activeToasts.indexOf(toastId);
            if (index > -1) {
                this.activeToasts.splice(index, 1);
            }
        }, 300);

        return true;
    }

    // Handle toast action clicks
    handleToastAction(action, toastId) {
        // Emit custom event for action handling
        const event = new CustomEvent('toastAction', {
            detail: { action, toastId }
        });
        document.dispatchEvent(event);

        // Hide toast after action
        this.hideToast(toastId);
    }

    // Add toast styles
    addToastStyles() {
        if (document.getElementById('toast-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            }
            
            .toast {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                margin-bottom: 12px;
                transform: translateX(100%);
                transition: all 0.3s ease;
                border-left: 4px solid var(--primary-blue);
            }
            
            .toast-success { border-left-color: var(--explorer-green); }
            .toast-error { border-left-color: var(--discovery-red); }
            .toast-warning { border-left-color: #f59e0b; }
            .toast-info { border-left-color: var(--primary-blue); }
            
            .toast-show {
                transform: translateX(0);
            }
            
            .toast-hide {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .toast-content {
                display: flex;
                align-items: center;
                padding: 16px;
                gap: 12px;
            }
            
            .toast-icon {
                font-size: 1.2rem;
                flex-shrink: 0;
            }
            
            .toast-message {
                flex: 1;
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            .toast-actions {
                display: flex;
                gap: 8px;
                margin-left: auto;
            }
            
            .toast-action {
                background: var(--primary-blue);
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .toast-action:hover {
                background: #1d4ed8;
            }
            
            .toast-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                margin-left: 8px;
                flex-shrink: 0;
            }
            
            .toast-close:hover {
                color: #374151;
            }
            
            @media (max-width: 768px) {
                .toast-container {
                    left: 20px;
                    right: 20px;
                    max-width: none;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // Create and show modal
    createModal(content, options = {}) {
        const modalId = `modal_${Date.now()}`;
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', `${modalId}-title`);

        const defaultOptions = {
            closable: true,
            title: '',
            size: 'medium',
            animation: 'fade'
        };

        const config = { ...defaultOptions, ...options };

        modal.innerHTML = `
            <div class="modal-dialog modal-${config.size}">
                <div class="modal-content">
                    ${config.title ? `<div class="modal-header">
                        <h2 id="${modalId}-title" class="modal-title">${config.title}</h2>
                        ${config.closable ? '<button class="modal-close" aria-label="Close modal">&times;</button>' : ''}
                    </div>` : ''}
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;

        // Add modal styles if not present
        this.addModalStyles();

        document.body.appendChild(modal);
        this.activeModals.push(modalId);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Event listeners
        if (config.closable) {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hideModal(modalId));
            }

            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modalId);
                }
            });

            // Close on Escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    this.hideModal(modalId);
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        }

        // Focus management
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('modal-show');
        });

        return modalId;
    }

    // Show existing modal
    showModal(modalElement, options = {}) {
        if (typeof modalElement === 'string') {
            return this.createModal(modalElement, options);
        }

        // If it's a DOM element, show it
        modalElement.classList.add('modal-show');
        document.body.style.overflow = 'hidden';

        return modalElement.id;
    }

    // Hide modal
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;

        modal.classList.add('modal-hide');

        setTimeout(() => {
            modal.remove();
            const index = this.activeModals.indexOf(modalId);
            if (index > -1) {
                this.activeModals.splice(index, 1);
            }

            // Restore body scroll if no more modals
            if (this.activeModals.length === 0) {
                document.body.style.overflow = '';
            }
        }, 300);

        return true;
    }

    // Add modal styles
    addModalStyles() {
        if (document.getElementById('modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .modal-show {
                opacity: 1;
            }
            
            .modal-hide {
                opacity: 0;
            }
            
            .modal-dialog {
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                transform: scale(0.95) translateY(-20px);
                transition: transform 0.3s ease;
                max-height: 90vh;
                overflow-y: auto;
                margin: 20px;
            }
            
            .modal-show .modal-dialog {
                transform: scale(1) translateY(0);
            }
            
            .modal-small { max-width: 400px; }
            .modal-medium { max-width: 600px; }
            .modal-large { max-width: 800px; }
            .modal-xl { max-width: 1200px; }
            
            .modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 24px 24px 0;
                border-bottom: 1px solid #e5e7eb;
                margin-bottom: 24px;
            }
            
            .modal-title {
                font-size: 1.5rem;
                font-weight: 600;
                margin: 0;
                color: var(--neutral-gray);
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6b7280;
                padding: 8px;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .modal-body {
                padding: 24px;
            }
            
            @media (max-width: 768px) {
                .modal-dialog {
                    margin: 10px;
                    max-height: 95vh;
                }
                
                .modal-header {
                    padding: 16px 16px 0;
                    margin-bottom: 16px;
                }
                
                .modal-body {
                    padding: 16px;
                }
                
                .modal-small,
                .modal-medium,
                .modal-large,
                .modal-xl {
                    max-width: none;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // Form validation helper
    validateForm(form, rules = {}) {
        const errors = [];
        const formData = new FormData(form);

        for (const [fieldName, fieldRules] of Object.entries(rules)) {
            const value = formData.get(fieldName);
            const field = form.querySelector(`[name="${fieldName}"]`);

            // Clear previous errors
            this.clearFieldError(field);

            for (const rule of fieldRules) {
                if (!this.validateField(value, rule, formData)) {
                    const error = { field: fieldName, rule: rule.type, message: rule.message };
                    errors.push(error);
                    this.showFieldError(field, rule.message);
                    break; // Stop at first error for this field
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validate individual field
    validateField(value, rule, formData = null) {
        switch (rule.type) {
            case 'required':
                return value && value.trim().length > 0;

            case 'email':
                return !value || this.validateEmail(value);

            case 'minLength':
                return !value || value.length >= rule.value;

            case 'maxLength':
                return !value || value.length <= rule.value;

            case 'pattern':
                return !value || new RegExp(rule.value).test(value);

            case 'match':
                return !value || value === formData.get(rule.field);

            case 'custom':
                return rule.validator(value, formData);

            default:
                return true;
        }
    }

    // Show field error
    showFieldError(field, message) {
        if (!field) return;

        field.classList.add('field-error');
        field.setAttribute('aria-invalid', 'true');

        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error-message';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');

        field.parentNode.appendChild(errorElement);
    }

    // Clear field error
    clearFieldError(field) {
        if (!field) return;

        field.classList.remove('field-error');
        field.removeAttribute('aria-invalid');

        const errorMessage = field.parentNode.querySelector('.field-error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // Email validation
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Animate element into view
    animateIntoView(element, animation = 'fadeInUp', duration = 600) {
        const el = this.getElement(element);
        if (!el) return false;

        // Add animation styles if not present
        this.addAnimationStyles();

        el.style.animationDuration = `${duration}ms`;
        el.classList.add('animate', animation);

        // Remove animation class after completion
        setTimeout(() => {
            el.classList.remove('animate', animation);
        }, duration);

        return true;
    }

    // Add animation styles
    addAnimationStyles() {
        if (document.getElementById('animation-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'animation-styles';
        styles.textContent = `
            .animate {
                animation-fill-mode: both;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeInDown {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeInLeft {
                from {
                    opacity: 0;
                    transform: translateX(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes fadeInRight {
                from {
                    opacity: 0;
                    transform: translateX(30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            
            @keyframes zoomIn {
                from {
                    opacity: 0;
                    transform: scale(0.3);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes bounce {
                0%, 20%, 53%, 80%, 100% {
                    transform: translate3d(0,0,0);
                }
                40%, 43% {
                    transform: translate3d(0, -20px, 0);
                }
                70% {
                    transform: translate3d(0, -10px, 0);
                }
                90% {
                    transform: translate3d(0, -4px, 0);
                }
            }
            
            .fadeIn { animation-name: fadeIn; }
            .fadeInUp { animation-name: fadeInUp; }
            .fadeInDown { animation-name: fadeInDown; }
            .fadeInLeft { animation-name: fadeInLeft; }
            .fadeInRight { animation-name: fadeInRight; }
            .slideUp { animation-name: slideUp; }
            .zoomIn { animation-name: zoomIn; }
            .bounce { animation-name: bounce; }
            
            .field-error {
                border-color: var(--discovery-red) !important;
                box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
            }
            
            .field-error-message {
                color: var(--discovery-red);
                font-size: 0.875rem;
                margin-top: 0.25rem;
                display: block;
            }
        `;

        document.head.appendChild(styles);
    }

    // Intersection Observer for scroll animations
    observeElements(selector, callback, options = {}) {
        const defaultOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const config = { ...defaultOptions, ...options };
        const elements = document.querySelectorAll(selector);

        if (elements.length === 0) return null;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target, entry);
                }
            });
        }, config);

        elements.forEach(el => observer.observe(el));

        const observerId = `observer_${Date.now()}`;
        this.observers.set(observerId, observer);

        return observerId;
    }

    // Disconnect observer
    disconnectObserver(observerId) {
        const observer = this.observers.get(observerId);
        if (observer) {
            observer.disconnect();
            this.observers.delete(observerId);
            return true;
        }
        return false;
    }

    // Debounce function
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Get element helper
    getElement(selector) {
        if (typeof selector === 'string') {
            return document.querySelector(selector);
        }
        return selector; // Assume it's already a DOM element
    }

    // Format date for display
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        const config = { ...defaultOptions, ...options };

        if (typeof date === 'string') {
            date = new Date(date);
        }

        return date.toLocaleDateString('en-US', config);
    }

    // Format relative time (e.g., "2 hours ago")
    formatRelativeTime(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(diffInSeconds / interval.seconds);
            if (count > 0) {
                return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
            }
        }

        return 'just now';
    }

    // Copy text to clipboard
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return true;
                } catch (err) {
                    document.body.removeChild(textArea);
                    return false;
                }
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
            return false;
        }
    }

    // Format numbers for display
    formatNumber(number, options = {}) {
        const defaultOptions = {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        };

        const config = { ...defaultOptions, ...options };

        if (typeof number === 'string') {
            number = parseFloat(number);
        }

        if (isNaN(number)) return '0';

        return number.toLocaleString('en-US', config);
    }

    // Truncate text with ellipsis
    truncateText(text, maxLength = 100, suffix = '...') {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + suffix;
    }

    // Generate random ID
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Check if element is in viewport
    isInViewport(element) {
        const el = this.getElement(element);
        if (!el) return false;

        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Smooth scroll to element
    scrollToElement(selector, offset = 0, behavior = 'smooth') {
        const element = this.getElement(selector);
        if (!element) return false;

        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: behavior
        });

        return true;
    }

    // Toggle class on element
    toggleClass(selector, className) {
        const element = this.getElement(selector);
        if (!element) return false;

        element.classList.toggle(className);
        return element.classList.contains(className);
    }

    // Add ripple effect to buttons
    addRippleEffect(selector) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(element => {
            element.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = element.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                `;

                element.style.position = 'relative';
                element.style.overflow = 'hidden';
                element.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add ripple animation CSS
        if (!document.getElementById('ripple-styles')) {
            const styles = document.createElement('style');
            styles.id = 'ripple-styles';
            styles.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // Cleanup all UI resources
    cleanup() {
        // Hide all active toasts
        this.activeToasts.forEach(toastId => this.hideToast(toastId));

        // Hide all active modals
        this.activeModals.forEach(modalId => this.hideModal(modalId));

        // Disconnect all observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();

        // Clear all loaders
        this.loaders.clear();

        // Restore body scroll
        document.body.style.overflow = '';

        console.log('UI cleanup completed');
    }
}

// Create and export UI helpers instance
const uiHelpers = new UIHelpers();

// Export everything
export {
    UIHelpers,
    uiHelpers
};