// Hidden Gems Explorer - About Page JavaScript
// Albert Silva - WDD 231 Final Project

// Import main.js functionality for shared features
import './main.js';

console.log('About page module loaded');

// About page specific enhancements
document.addEventListener('DOMContentLoaded', () => {
    console.log('About page specific initialization...');

    initAboutPageEnhancements();
});

function initAboutPageEnhancements() {
    // Enhanced form validation
    initEnhancedFormValidation();

    // Form auto-save functionality
    initFormAutoSave();

    // Character counters for text areas
    initCharacterCounters();

    // Form analytics
    initFormAnalytics();
}

function initEnhancedFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Real-time validation
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => clearFieldError(field));
    });

    // Enhanced validation rules
    const validationRules = {
        name: {
            required: true,
            minLength: 2,
            maxLength: 100,
            pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
            messages: {
                required: 'Name is required',
                minLength: 'Name must be at least 2 characters',
                maxLength: 'Name cannot exceed 100 characters',
                pattern: 'Name can only contain letters and spaces'
            }
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            maxLength: 254,
            messages: {
                required: 'Email address is required',
                pattern: 'Please enter a valid email address',
                maxLength: 'Email address is too long'
            }
        },
        gemName: {
            required: true,
            minLength: 3,
            maxLength: 200,
            messages: {
                required: 'Hidden gem name is required',
                minLength: 'Name must be at least 3 characters',
                maxLength: 'Name cannot exceed 200 characters'
            }
        },
        category: {
            required: true,
            messages: {
                required: 'Please select a category'
            }
        },
        location: {
            required: true,
            minLength: 5,
            maxLength: 300,
            messages: {
                required: 'Location is required',
                minLength: 'Please provide more location details',
                maxLength: 'Location description is too long'
            }
        },
        description: {
            required: true,
            minLength: 20,
            maxLength: 1000,
            messages: {
                required: 'Description is required',
                minLength: 'Description must be at least 20 characters',
                maxLength: 'Description cannot exceed 1000 characters'
            }
        },
        tips: {
            maxLength: 500,
            messages: {
                maxLength: 'Tips cannot exceed 500 characters'
            }
        }
    };

    function validateField(field) {
        const rules = validationRules[field.name];
        if (!rules) return true;

        const value = field.value.trim();

        // Required validation
        if (rules.required && !value) {
            showFieldError(field, rules.messages.required);
            return false;
        }

        // Skip other validations if field is empty and not required
        if (!value && !rules.required) {
            clearFieldError(field);
            return true;
        }

        // Length validations
        if (rules.minLength && value.length < rules.minLength) {
            showFieldError(field, rules.messages.minLength);
            return false;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            showFieldError(field, rules.messages.maxLength);
            return false;
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            showFieldError(field, rules.messages.pattern);
            return false;
        }

        // All validations passed
        clearFieldError(field);
        return true;
    }

    function showFieldError(field, message) {
        clearFieldError(field);

        field.classList.add('field-error');
        field.setAttribute('aria-invalid', 'true');

        const errorElement = document.createElement('div');
        errorElement.className = 'field-error-message';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');

        field.parentNode.appendChild(errorElement);
    }

    function clearFieldError(field) {
        field.classList.remove('field-error');
        field.removeAttribute('aria-invalid');

        const errorMessage = field.parentNode.querySelector('.field-error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // Form submission with enhanced validation
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;
        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        if (isValid) {
            submitForm(form);
        } else {
            // Focus on first error field
            const firstError = form.querySelector('.field-error');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

function initFormAutoSave() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const AUTOSAVE_KEY = 'form_autosave_contact';

    // Load saved data
    function loadSavedData() {
        try {
            const savedData = localStorage.getItem(AUTOSAVE_KEY);
            if (savedData) {
                const data = JSON.parse(savedData);
                Object.entries(data).forEach(([name, value]) => {
                    const field = form.querySelector(`[name="${name}"]`);
                    if (field && value) {
                        field.value = value;
                    }
                });
                console.log('📋 Loaded auto-saved form data');
            }
        } catch (error) {
            console.error('Error loading auto-saved data:', error);
        }
    }

    // Save form data
    function saveFormData() {
        try {
            const formData = new FormData(form);
            const data = {};

            for (const [name, value] of formData.entries()) {
                if (value.trim()) {
                    data[name] = value.trim();
                }
            }

            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error auto-saving form data:', error);
        }
    }

    // Clear saved data
    function clearSavedData() {
        try {
            localStorage.removeItem(AUTOSAVE_KEY);
            console.log('🧹 Cleared auto-saved form data');
        } catch (error) {
            console.error('Error clearing auto-saved data:', error);
        }
    }

    // Load saved data on page load
    loadSavedData();

    // Auto-save on input changes (debounced)
    let saveTimeout;
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        field.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveFormData, 1000); // Save after 1 second of inactivity
        });
    });

    // Clear saved data on successful submission
    form.addEventListener('submit', () => {
        setTimeout(clearSavedData, 100); // Clear after form processes
    });

    // Show auto-save indicator
    const indicator = document.createElement('div');
    indicator.className = 'autosave-indicator';
    indicator.innerHTML = '💾 Form auto-saved';
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #059669;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 0.9rem;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1000;
    `;
    document.body.appendChild(indicator);

    // Show save indicator temporarily
    function showSaveIndicator() {
        indicator.style.opacity = '1';
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
    }

    // Update save function to show indicator
    const originalSave = saveFormData;
    saveFormData = function () {
        originalSave();
        showSaveIndicator();
    };
}

function initCharacterCounters() {
    const textareas = document.querySelectorAll('textarea');

    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength') || 1000;

        // Create counter element
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = `
            text-align: right;
            font-size: 0.8rem;
            margin-top: 4px;
            color: #6b7280;
        `;

        // Insert counter after textarea
        textarea.parentNode.insertBefore(counter, textarea.nextSibling);

        // Update counter
        function updateCounter() {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `${textarea.value.length}/${maxLength} characters`;

            if (remaining < 50) {
                counter.style.color = '#dc2626'; // Red warning
            } else if (remaining < 100) {
                counter.style.color = '#f59e0b'; // Yellow warning
            } else {
                counter.style.color = '#6b7280'; // Normal
            }
        }

        // Initial count
        updateCounter();

        // Update on input
        textarea.addEventListener('input', updateCounter);
    });
}

function initFormAnalytics() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    let startTime = Date.now();
    let fieldInteractions = {};

    // Track field interactions
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        let fieldStartTime;

        field.addEventListener('focus', () => {
            fieldStartTime = Date.now();
        });

        field.addEventListener('blur', () => {
            if (fieldStartTime) {
                const timeSpent = Date.now() - fieldStartTime;
                if (!fieldInteractions[field.name]) {
                    fieldInteractions[field.name] = [];
                }
                fieldInteractions[field.name].push(timeSpent);
            }
        });
    });

    // Track form submission
    form.addEventListener('submit', () => {
        const totalTime = Date.now() - startTime;

        const analytics = {
            formId: 'contact',
            totalTime,
            fieldInteractions,
            timestamp: new Date().toISOString()
        };

        // Store analytics (could be sent to analytics service)
        try {
            const formAnalytics = JSON.parse(localStorage.getItem('form_analytics') || '[]');
            formAnalytics.push(analytics);

            // Keep only last 50 analytics entries
            if (formAnalytics.length > 50) {
                formAnalytics.splice(0, formAnalytics.length - 50);
            }

            localStorage.setItem('form_analytics', JSON.stringify(formAnalytics));
            console.log('📊 Form analytics recorded:', analytics);
        } catch (error) {
            console.error('Error storing form analytics:', error);
        }
    });
}

function submitForm(form) {
    console.log('📝 Submitting contact form...');

    // Show loading state
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    // Collect form data
    const formData = new FormData(form);
    const submissionData = {
        name: formData.get('name'),
        email: formData.get('email'),
        gemName: formData.get('gemName'),
        category: formData.get('category'),
        location: formData.get('location'),
        description: formData.get('description'),
        accessibility: formData.get('accessibility') || 'Not specified',
        tips: formData.get('tips') || 'None provided',
        timestamp: new Date().toISOString(),
        id: Date.now()
    };

    // Simulate form processing (in real app, this would be an API call)
    setTimeout(() => {
        try {
            // Store submission data
            localStorage.setItem('lastSubmission', JSON.stringify(submissionData));

            // Store in submissions history
            const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
            submissions.unshift(submissionData);
            if (submissions.length > 20) submissions.pop();
            localStorage.setItem('formSubmissions', JSON.stringify(submissions));

            console.log('✅ Form submitted successfully');

            // Clear auto-saved data
            localStorage.removeItem('form_autosave_contact');

            // Redirect to thank you page
            const params = new URLSearchParams({
                name: submissionData.name,
                email: submissionData.email,
                gemName: submissionData.gemName,
                category: submissionData.category,
                location: submissionData.location,
                timestamp: submissionData.timestamp
            });

            window.location.href = `thankyou.html?${params.toString()}`;

        } catch (error) {
            console.error('❌ Form submission error:', error);

            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // Show error message
            alert('Sorry, there was an error submitting your form. Please try again.');
        }
    }, 1000); // Simulate network delay
}

// Export functions that might be needed
export {
    initAboutPageEnhancements,
    submitForm
};