// Hidden Gems Explorer - About Page JavaScript

import './main.js';

const isDevelopment = false;
const logger = {
    log: isDevelopment ? console.log : () => { },
    warn: isDevelopment ? console.warn : () => { },
    error: isDevelopment ? console.error : () => { }
};

document.addEventListener('DOMContentLoaded', () => {
    initAboutPageEnhancements();
});

function initAboutPageEnhancements() {
    initEnhancedFormValidation();
    initFormAutoSave();
    initCharacterCounters();
    initFormAnalytics();
}