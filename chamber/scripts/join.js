document.addEventListener('DOMContentLoaded', function () {
    const timestampField = document.getElementById('timestamp');
    const currentDateTime = new Date().toISOString();
    timestampField.value = currentDateTime;

    const lastModified = document.getElementById('lastModified');
    if (lastModified) {
        lastModified.textContent = document.lastModified;
    }
});

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.showModal();

        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.focus();
        }

        modal.addEventListener('keydown', handleEscapeKey);
        modal.addEventListener('click', handleBackdropClick);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.close();
        modal.removeEventListener('keydown', handleEscapeKey);
        modal.removeEventListener('click', handleBackdropClick);
    }
}

function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        const modal = event.target.closest('dialog');
        if (modal) {
            closeModal(modal.id);
        }
    }
}

function handleBackdropClick(event) {
    const modal = event.currentTarget;
    const modalContent = modal.querySelector('.modal-content');

    if (!modalContent.contains(event.target)) {
        closeModal(modal.id);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.membership-form');

    if (form) {
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            field.addEventListener('invalid', function (e) {
                e.preventDefault();

                if (field.validity.valueMissing) {
                    field.setCustomValidity(`Please fill out the ${field.title || field.name} field.`);
                } else if (field.validity.typeMismatch) {
                    if (field.type === 'email') {
                        field.setCustomValidity('Please enter a valid email address.');
                    } else if (field.type === 'tel') {
                        field.setCustomValidity('Please enter a valid phone number.');
                    }
                } else if (field.validity.patternMismatch) {
                    if (field.id === 'title') {
                        field.setCustomValidity('Title must be at least 7 characters and contain only letters, spaces, and hyphens.');
                    }
                }

                field.reportValidity();
            });

            field.addEventListener('input', function () {
                field.setCustomValidity('');
            });
        });

        form.addEventListener('submit', function (e) {
            const timestampField = document.getElementById('timestamp');
            timestampField.value = new Date().toISOString();
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('mainNav');

    if (hamburger && mainNav) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            mainNav.classList.toggle('active');
        });

        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });

        document.addEventListener('click', function (e) {
            if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
                hamburger.classList.remove('active');
                mainNav.classList.remove('active');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const phoneField = document.getElementById('phone');
    if (phoneField && !phoneField.getAttribute('aria-label')) {
        phoneField.setAttribute('aria-label', 'Mobile phone number');
    }

    const emailField = document.getElementById('email');
    if (emailField && !emailField.getAttribute('aria-label')) {
        emailField.setAttribute('aria-label', 'Email address');
    }

    const modals = document.querySelectorAll('.membership-modal');
    modals.forEach(modal => {
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');

        const title = modal.querySelector('.modal-header h3');
        if (title && !modal.getAttribute('aria-labelledby')) {
            title.id = title.id || `modal-title-${modal.id}`;
            modal.setAttribute('aria-labelledby', title.id);
        }
    });

    const infoButtons = document.querySelectorAll('.info-btn');
    infoButtons.forEach(button => {
        const cardTitle = button.closest('.membership-card').querySelector('h3').textContent;
        button.setAttribute('aria-label', `Learn more about ${cardTitle}`);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        const cards = document.querySelectorAll('.membership-card');
        cards.forEach(card => {
            card.style.animation = 'none';
            card.style.opacity = '1';
            card.style.transform = 'none';
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.membership-form');
    if (form) {
        form.addEventListener('invalid', function () {
            const firstInvalid = form.querySelector(':invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                setTimeout(() => firstInvalid.focus(), 300);
            }
        }, true);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const formFields = document.querySelectorAll('input, select, textarea');

    formFields.forEach(field => {
        field.addEventListener('focus', function () {
            this.parentElement.classList.add('field-focused');
        });

        field.addEventListener('blur', function () {
            this.parentElement.classList.remove('field-focused');
            if (this.value !== '') {
                this.parentElement.classList.add('field-filled');
            } else {
                this.parentElement.classList.remove('field-filled');
            }
        });

        if (field.value !== '') {
            field.parentElement.classList.add('field-filled');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const textarea = document.getElementById('description');
    if (textarea) {
        const maxLength = 500;

        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.textContent = `0/${maxLength} characters`;
        textarea.parentElement.appendChild(counter);

        textarea.setAttribute('maxlength', maxLength);

        textarea.addEventListener('input', function () {
            const length = this.value.length;
            counter.textContent = `${length}/${maxLength} characters`;

            if (length > maxLength * 0.8) {
                counter.style.color = '#ef4444';
            } else if (length > maxLength * 0.6) {
                counter.style.color = '#f59e0b';
            } else {
                counter.style.color = '#6b7280';
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');

            if (value.length >= 6) {
                value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6, 10);
            } else if (value.length >= 3) {
                value = value.substring(0, 3) + '-' + value.substring(3);
            }

            e.target.value = value;
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.membership-form');
    if (form) {
        const formId = 'chamber-join-form';

        const savedData = sessionStorage.getItem(formId);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                Object.keys(data).forEach(key => {
                    const field = form.querySelector(`[name="${key}"]`);
                    if (field && key !== 'timestamp') {
                        field.value = data[key];
                        field.dispatchEvent(new Event('input'));
                        field.dispatchEvent(new Event('blur'));
                    }
                });
            } catch (e) {
                console.log('Error loading saved form data:', e);
            }
        }

        const saveData = () => {
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                if (key !== 'timestamp') {
                    data[key] = value;
                }
            }
            sessionStorage.setItem(formId, JSON.stringify(data));
        };

        let saveTimeout;
        form.addEventListener('input', function () {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveData, 1000);
        });

        form.addEventListener('submit', function () {
            sessionStorage.removeItem(formId);
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const modals = document.querySelectorAll('.membership-modal');

    modals.forEach(modal => {
        modal.addEventListener('keydown', function (e) {
            if (e.key === 'Tab') {
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    });
});