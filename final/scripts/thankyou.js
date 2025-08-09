// Hidden Gems Explorer - Thank You Page JavaScript
// Albert Silva - WDD 231 Final Project

// Import main.js functionality for shared features
import './main.js';

console.log('Thank you page module loaded');

// Thank you page specific functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('Thank you page specific initialization...');

    initThankYouPageEnhancements();
});

function initThankYouPageEnhancements() {
    // Display submission data from URL or localStorage
    displaySubmissionData();

    // Add celebration animation
    initCelebrationAnimation();

    // Add sharing functionality
    initSharingFeatures();

    // Add feedback collection
    initFeedbackCollection();

    // Add navigation suggestions
    initNavigationSuggestions();
}

function displaySubmissionData() {
    console.log('📋 Loading submission data...');

    // Get data from URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    let submissionData = {};

    // Try URL parameters first (from form submission)
    if (urlParams.has('name')) {
        submissionData = {
            name: urlParams.get('name'),
            email: urlParams.get('email'),
            gemName: urlParams.get('gemName'),
            category: urlParams.get('category'),
            location: urlParams.get('location'),
            timestamp: urlParams.get('timestamp') || new Date().toISOString()
        };
        console.log('📋 Using URL parameters for submission data');
    } else {
        // Fallback to localStorage
        try {
            const stored = localStorage.getItem('lastSubmission');
            if (stored) {
                submissionData = JSON.parse(stored);
                console.log('📋 Using localStorage for submission data');
            }
        } catch (error) {
            console.error('Error reading localStorage:', error);
        }
    }

    if (submissionData.name) {
        populateSubmissionDisplay(submissionData);

        // Store for analytics
        storeSubmissionAnalytics(submissionData);
    } else {
        showNoDataMessage();
    }
}

function populateSubmissionDisplay(data) {
    const elements = {
        submitterName: data.name || '-',
        submitterEmail: data.email || '-',
        gemName: data.gemName || '-',
        gemCategory: data.category || '-',
        gemLocation: data.location || '-',
        submissionDate: data.timestamp ?
            new Date(data.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) :
            new Date().toLocaleDateString()
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;

            // Add fade-in animation
            element.style.opacity = '0';
            element.style.transform = 'translateY(10px)';

            setTimeout(() => {
                element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, Math.random() * 500); // Staggered animation
        }
    });

    console.log(`✅ Populated submission data for: ${data.name}`);
}

function showNoDataMessage() {
    const detailsSection = document.querySelector('.submission-details');
    if (detailsSection) {
        detailsSection.innerHTML = `
            <div class="no-data-message">
                <h3>🤔 No Submission Data Found</h3>
                <p>It looks like you arrived here directly. To submit a hidden gem suggestion, please visit our About page.</p>
                <div class="action-buttons" style="margin-top: 1.5rem;">
                    <a href="about.html" class="primary-btn">📝 Submit a Hidden Gem</a>
                    <a href="index.html" class="secondary-btn">🏠 Return Home</a>
                </div>
            </div>
        `;
    }
}

function initCelebrationAnimation() {
    // Add confetti or celebration effect
    const celebrationContainer = document.createElement('div');
    celebrationContainer.className = 'celebration-container';
    celebrationContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
    `;
    document.body.appendChild(celebrationContainer);

    // Create floating elements
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createFloatingElement(celebrationContainer);
        }, i * 100);
    }

    // Remove container after animation
    setTimeout(() => {
        celebrationContainer.remove();
    }, 5000);
}

function createFloatingElement(container) {
    const elements = ['🌟', '✨', '🎉', '🎊', '💎', '🏆'];
    const element = document.createElement('div');
    element.textContent = elements[Math.floor(Math.random() * elements.length)];
    element.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 20 + 20}px;
        left: ${Math.random() * 100}%;
        top: 100%;
        animation: floatUp ${Math.random() * 3 + 2}s ease-out forwards;
        opacity: 0.8;
    `;

    container.appendChild(element);

    // Remove element after animation
    setTimeout(() => {
        element.remove();
    }, 5000);
}

function initSharingFeatures() {
    const sharingSection = document.createElement('section');
    sharingSection.className = 'sharing-section';
    sharingSection.innerHTML = `
        <div class="content-container">
            <h3>📢 Share Your Experience</h3>
            <p>Help others discover hidden gems too!</p>
            <div class="sharing-buttons">
                <button class="share-btn" data-platform="twitter">
                    🐦 Share on Twitter
                </button>
                <button class="share-btn" data-platform="facebook">
                    📘 Share on Facebook
                </button>
                <button class="share-btn" data-platform="copy">
                    📋 Copy Link
                </button>
            </div>
        </div>
    `;

    // Insert after the thank you section
    const thankYouSection = document.querySelector('.thank-you-section');
    if (thankYouSection) {
        thankYouSection.parentNode.insertBefore(sharingSection, thankYouSection.nextSibling);
    }

    // Add sharing functionality
    sharingSection.addEventListener('click', (e) => {
        if (e.target.classList.contains('share-btn')) {
            const platform = e.target.dataset.platform;
            handleSharing(platform);
        }
    });
}

function handleSharing(platform) {
    const url = window.location.origin + '/index.html';
    const text = 'I just submitted a hidden gem to Hidden Gems Explorer! Discover amazing secret locations in Buenos Aires.';

    switch (platform) {
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            break;
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
            break;
        case 'copy':
            copyToClipboard(url);
            showCopySuccess();
            break;
    }

    // Track sharing analytics
    try {
        const analytics = JSON.parse(localStorage.getItem('sharing_analytics') || '[]');
        analytics.push({
            platform,
            timestamp: new Date().toISOString(),
            page: 'thankyou'
        });
        localStorage.setItem('sharing_analytics', JSON.stringify(analytics.slice(-50)));
    } catch (error) {
        console.error('Error tracking sharing analytics:', error);
    }
}

async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
}

function showCopySuccess() {
    const message = document.createElement('div');
    message.textContent = '✅ Link copied to clipboard!';
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #059669;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 10000;
        animation: fadeInOut 2s ease-in-out forwards;
    `;

    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 2000);
}

function initFeedbackCollection() {
    const feedbackSection = document.createElement('section');
    feedbackSection.className = 'feedback-section';
    feedbackSection.innerHTML = `
        <div class="content-container">
            <h3>💭 Quick Feedback</h3>
            <p>How was your experience submitting a hidden gem?</p>
            <div class="feedback-buttons">
                <button class="feedback-btn" data-rating="5">😍 Excellent</button>
                <button class="feedback-btn" data-rating="4">😊 Good</button>
                <button class="feedback-btn" data-rating="3">😐 Okay</button>
                <button class="feedback-btn" data-rating="2">😕 Poor</button>
            </div>
            <div class="feedback-result" style="display: none;">
                <p>Thank you for your feedback! 🙏</p>
            </div>
        </div>
    `;

    // Insert before continue exploring section
    const continueSection = document.querySelector('.continue-exploring');
    if (continueSection) {
        continueSection.parentNode.insertBefore(feedbackSection, continueSection);
    }

    // Add feedback functionality
    feedbackSection.addEventListener('click', (e) => {
        if (e.target.classList.contains('feedback-btn')) {
            const rating = e.target.dataset.rating;
            handleFeedback(rating);

            // Hide buttons, show result
            feedbackSection.querySelector('.feedback-buttons').style.display = 'none';
            feedbackSection.querySelector('.feedback-result').style.display = 'block';
        }
    });
}

function handleFeedback(rating) {
    try {
        const feedback = {
            rating: parseInt(rating),
            page: 'thankyou',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent.substring(0, 100)
        };

        // Store feedback
        const feedbackData = JSON.parse(localStorage.getItem('user_feedback') || '[]');
        feedbackData.push(feedback);

        // Keep only last 100 feedback entries
        if (feedbackData.length > 100) {
            feedbackData.splice(0, feedbackData.length - 100);
        }

        localStorage.setItem('user_feedback', JSON.stringify(feedbackData));

        console.log(`📝 Feedback recorded: ${rating}/5 stars`);

        // Show appreciation message based on rating
        if (rating >= 4) {
            setTimeout(() => {
                showAppreciationMessage("We're thrilled you had a great experience! 🌟");
            }, 1000);
        } else if (rating <= 2) {
            setTimeout(() => {
                showAppreciationMessage("Thanks for the feedback. We'll work to improve! 💪");
            }, 1000);
        }

    } catch (error) {
        console.error('Error storing feedback:', error);
    }
}

function showAppreciationMessage(message) {
    const appreciation = document.createElement('div');
    appreciation.textContent = message;
    appreciation.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2563eb;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInFromRight 0.5s ease-out forwards;
    `;

    document.body.appendChild(appreciation);

    setTimeout(() => {
        appreciation.style.animation = 'slideOutToRight 0.5s ease-in forwards';
        setTimeout(() => appreciation.remove(), 500);
    }, 3000);
}

function initNavigationSuggestions() {
    // Suggest next actions based on submission data
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    if (category) {
        const suggestionsSection = document.createElement('section');
        suggestionsSection.className = 'suggestions-section';
        suggestionsSection.innerHTML = `
            <div class="content-container">
                <h3>🔍 You Might Also Like</h3>
                <p>Since you're interested in <strong>${category}</strong> attractions, check these out:</p>
                <div class="suggestion-buttons">
                    <a href="attractions.html?category=${encodeURIComponent(category)}" class="suggestion-btn">
                        🎯 View All ${category} Attractions
                    </a>
                    <a href="attractions.html" class="suggestion-btn">
                        🗺️ Explore All Hidden Gems
                    </a>
                </div>
            </div>
        `;

        // Insert before continue exploring section
        const continueSection = document.querySelector('.continue-exploring');
        if (continueSection) {
            continueSection.parentNode.insertBefore(suggestionsSection, continueSection);
        }
    }

    // Add recent submissions counter
    addRecentSubmissionsCounter();
}

function addRecentSubmissionsCounter() {
    try {
        const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
        const userSubmissions = submissions.length;

        if (userSubmissions > 1) {
            const counterSection = document.createElement('div');
            counterSection.className = 'submissions-counter';
            counterSection.innerHTML = `
                <div class="counter-badge">
                    <span class="counter-number">${userSubmissions}</span>
                    <span class="counter-label">Hidden Gems Submitted</span>
                    <p class="counter-description">Thank you for contributing to our community! 🎉</p>
                </div>
            `;

            // Insert at the top of main content
            const main = document.querySelector('main');
            const firstSection = main.querySelector('section');
            if (firstSection) {
                main.insertBefore(counterSection, firstSection);
            }
        }
    } catch (error) {
        console.error('Error adding submissions counter:', error);
    }
}

function storeSubmissionAnalytics(submissionData) {
    try {
        const analytics = {
            submissionId: submissionData.id,
            category: submissionData.category,
            timestamp: submissionData.timestamp,
            pageLoadTime: Date.now(),
            userAgent: navigator.userAgent.substring(0, 100),
            referrer: document.referrer,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        const submissionAnalytics = JSON.parse(localStorage.getItem('submission_analytics') || '[]');
        submissionAnalytics.push(analytics);

        // Keep only last 50 analytics entries
        if (submissionAnalytics.length > 50) {
            submissionAnalytics.splice(0, submissionAnalytics.length - 50);
        }

        localStorage.setItem('submission_analytics', JSON.stringify(submissionAnalytics));

        console.log('📊 Submission analytics stored');

    } catch (error) {
        console.error('Error storing submission analytics:', error);
    }
}

// Add CSS animations for the page
function addAnimationStyles() {
    if (document.getElementById('thankyou-animations')) return;

    const styles = document.createElement('style');
    styles.id = 'thankyou-animations';
    styles.textContent = `
        @keyframes floatUp {
            from {
                transform: translateY(0) rotate(0deg);
                opacity: 0.8;
            }
            to {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
        
        @keyframes slideInFromRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutToRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .feedback-buttons {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            flex-wrap: wrap;
            margin: 1rem 0;
        }
        
        .feedback-btn {
            background: #f3f4f6;
            border: 2px solid #e5e7eb;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9rem;
        }
        
        .feedback-btn:hover {
            background: #e5e7eb;
            transform: translateY(-1px);
        }
        
        .sharing-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin: 1.5rem 0;
        }
        
        .share-btn {
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-weight: 500;
        }
        
        .share-btn:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
        }
        
        .suggestion-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin: 1.5rem 0;
        }
        
        .suggestion-btn {
            background: #059669;
            color: white;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            transition: all 0.2s ease;
            font-weight: 500;
        }
        
        .suggestion-btn:hover {
            background: #047857;
            transform: translateY(-1px);
        }
        
        .counter-badge {
            background: linear-gradient(135deg, #2563eb, #059669);
            color: white;
            padding: 1.5rem;
            border-radius: 12px;
            text-align: center;
            margin: 1rem 0;
        }
        
        .counter-number {
            display: block;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .counter-label {
            display: block;
            font-size: 1.1rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
        }
        
        .counter-description {
            font-size: 0.9rem;
            opacity: 0.9;
            margin: 0;
        }
        
        .no-data-message {
            text-align: center;
            padding: 2rem;
            background: #f9fafb;
            border-radius: 12px;
            border: 2px dashed #d1d5db;
        }
        
        .no-data-message h3 {
            color: #374151;
            margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
            .feedback-buttons,
            .sharing-buttons,
            .suggestion-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .feedback-btn,
            .share-btn,
            .suggestion-btn {
                width: 100%;
                max-width: 250px;
            }
        }
    `;

    document.head.appendChild(styles);
}

// Initialize animations styles when DOM is loaded
document.addEventListener('DOMContentLoaded', addAnimationStyles);

// Track page performance
window.addEventListener('load', () => {
    try {
        const loadTime = performance.now();
        const pagePerformance = {
            page: 'thankyou',
            loadTime: Math.round(loadTime),
            timestamp: new Date().toISOString()
        };

        const performanceData = JSON.parse(localStorage.getItem('page_performance') || '[]');
        performanceData.push(pagePerformance);

        if (performanceData.length > 20) {
            performanceData.splice(0, performanceData.length - 20);
        }

        localStorage.setItem('page_performance', JSON.stringify(performanceData));
        console.log(`⚡ Thank you page loaded in ${Math.round(loadTime)}ms`);

    } catch (error) {
        console.error('Error tracking page performance:', error);
    }
});

// Export functions that might be needed
export {
    initThankYouPageEnhancements,
    displaySubmissionData,
    handleFeedback
};