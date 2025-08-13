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
    logger.log('Inicializando melhorias da página About');

    initEnhancedFormValidation();
    initFormAutoSave();
    initCharacterCounters();
    initFormAnalytics();
}

function initEnhancedFormValidation() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });

    form.addEventListener('submit', handleFormSubmit);
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;

    clearFieldError(event);

    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
        case 'name':
            if (!value) {
                isValid = false;
                errorMessage = 'Nome é obrigatório';
            } else if (value.length < 2) {
                isValid = false;
                errorMessage = 'Nome deve ter pelo menos 2 caracteres';
            }
            break;

        case 'email':
            if (!value) {
                isValid = false;
                errorMessage = 'Email é obrigatório';
            } else if (!isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Por favor, insira um email válido';
            }
            break;

        case 'message':
            if (!value) {
                isValid = false;
                errorMessage = 'Mensagem é obrigatória';
            } else if (value.length < 10) {
                isValid = false;
                errorMessage = 'Mensagem deve ter pelo menos 10 caracteres';
            }
            break;
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(field, message) {
    field.classList.add('error');

    let errorElement = field.parentNode.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        field.parentNode.appendChild(errorElement);
    }

    errorElement.textContent = message;
}

function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('error');

    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

function initFormAutoSave() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        const savedValue = localStorage.getItem(`form_${input.name}`);
        if (savedValue && !input.value) {
            input.value = savedValue;
        }

        input.addEventListener('input', () => {
            localStorage.setItem(`form_${input.name}`, input.value);
        });
    });

    form.addEventListener('submit', () => {
        inputs.forEach(input => {
            localStorage.removeItem(`form_${input.name}`);
        });
    });
}

function initCharacterCounters() {
    const textareas = document.querySelectorAll('textarea[maxlength]');

    textareas.forEach(textarea => {
        const maxLength = parseInt(textarea.getAttribute('maxlength'));

        const counter = document.createElement('div');
        counter.className = 'char-counter';
        textarea.parentNode.appendChild(counter);

        const updateCounter = () => {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `${remaining} caracteres restantes`;
            counter.classList.toggle('warning', remaining < 50);
        };

        textarea.addEventListener('input', updateCounter);
        updateCounter();
    });
}

function initFormAnalytics() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const startTime = Date.now();
    let interactionCount = 0;

    form.addEventListener('focusin', () => {
        interactionCount++;
    });

    form.addEventListener('submit', () => {
        const timeSpent = Date.now() - startTime;
        logger.log('Form Analytics:', {
            timeSpent: Math.round(timeSpent / 1000),
            interactions: interactionCount,
            timestamp: new Date().toISOString()
        });
    });
}

async function submitForm(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const inputs = form.querySelectorAll('input, textarea');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });

    if (!isValid) {
        logger.warn('Formulário contém erros de validação');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Enviando...';
    submitButton.disabled = true;

    try {
        await simulateFormSubmission(formData);

        showSuccessMessage();
        form.reset();

    } catch (error) {
        logger.error('Erro ao enviar formulário:', error);
        showErrorMessage();

    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

function simulateFormSubmission(formData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.1) {
                resolve({ success: true });
            } else {
                reject(new Error('Erro simulado'));
            }
        }, 2000);
    });
}

function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <h3>✅ Mensagem enviada com sucesso!</h3>
        <p>Obrigado pelo seu contato. Responderemos em breve.</p>
    `;

    const form = document.getElementById('contact-form');
    form.parentNode.insertBefore(message, form);

    setTimeout(() => {
        message.remove();
    }, 5000);
}

function showErrorMessage() {
    const message = document.createElement('div');
    message.className = 'error-message-global';
    message.innerHTML = `
        <h3>❌ Erro ao enviar mensagem</h3>
        <p>Por favor, tente novamente em alguns minutos.</p>
    `;

    const form = document.getElementById('contact-form');
    form.parentNode.insertBefore(message, form);

    setTimeout(() => {
        message.remove();
    }, 5000);
}

export {
    initAboutPageEnhancements,
    submitForm,
    validateField,
    isValidEmail
};