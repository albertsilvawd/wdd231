// Hidden Gems Explorer - About Page JavaScript
import './main.js';

const isDevelopment = false;
const logger = {
    log: isDevelopment ? console.log : () => { },
    warn: isDevelopment ? console.warn : () => { },
    error: isDevelopment ? console.error : () => { }
};

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    initAboutPageEnhancements();
});

// Função principal de inicialização
function initAboutPageEnhancements() {
    logger.log('Inicializando melhorias da página About');

    initEnhancedFormValidation();
    initFormAutoSave();
    initCharacterCounters();
    initFormAnalytics();
}

// Validação aprimorada de formulário
function initEnhancedFormValidation() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        // Validação em tempo real
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });

    form.addEventListener('submit', handleFormSubmit);
}

// Validação de campo individual
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;

    clearFieldError(event);

    let isValid = true;
    let errorMessage = '';

    // Validações específicas por tipo de campo
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

// Verificação de email válido
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Mostrar erro no campo
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

// Limpar erro do campo
function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('error');

    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

// Auto-save do formulário
function initFormAutoSave() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        // Carregar dados salvos
        const savedValue = localStorage.getItem(`form_${input.name}`);
        if (savedValue && !input.value) {
            input.value = savedValue;
        }

        // Salvar automaticamente
        input.addEventListener('input', () => {
            localStorage.setItem(`form_${input.name}`, input.value);
        });
    });

    // Limpar dados salvos após envio bem-sucedido
    form.addEventListener('submit', () => {
        inputs.forEach(input => {
            localStorage.removeItem(`form_${input.name}`);
        });
    });
}

// Contadores de caracteres
function initCharacterCounters() {
    const textareas = document.querySelectorAll('textarea[maxlength]');

    textareas.forEach(textarea => {
        const maxLength = parseInt(textarea.getAttribute('maxlength'));

        // Criar elemento contador
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        textarea.parentNode.appendChild(counter);

        // Atualizar contador
        const updateCounter = () => {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `${remaining} caracteres restantes`;
            counter.classList.toggle('warning', remaining < 50);
        };

        textarea.addEventListener('input', updateCounter);
        updateCounter(); // Inicializar
    });
}

// Analytics básico do formulário
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

// Manipulador principal de envio do formulário
async function submitForm(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Validar todos os campos
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

    // Mostrar loading
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Enviando...';
    submitButton.disabled = true;

    try {
        // Simular envio (substituir por API real)
        await simulateFormSubmission(formData);

        showSuccessMessage();
        form.reset();

    } catch (error) {
        logger.error('Erro ao enviar formulário:', error);
        showErrorMessage();

    } finally {
        // Restaurar botão
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Simulação de envio (substituir por integração real)
function simulateFormSubmission(formData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simular sucesso na maioria das vezes
            if (Math.random() > 0.1) {
                resolve({ success: true });
            } else {
                reject(new Error('Erro simulado'));
            }
        }, 2000);
    });
}

// Mostrar mensagem de sucesso
function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <h3>✅ Mensagem enviada com sucesso!</h3>
        <p>Obrigado pelo seu contato. Responderemos em breve.</p>
    `;

    const form = document.getElementById('contact-form');
    form.parentNode.insertBefore(message, form);

    // Remover mensagem após 5 segundos
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Mostrar mensagem de erro
function showErrorMessage() {
    const message = document.createElement('div');
    message.className = 'error-message-global';
    message.innerHTML = `
        <h3>❌ Erro ao enviar mensagem</h3>
        <p>Por favor, tente novamente em alguns minutos.</p>
    `;

    const form = document.getElementById('contact-form');
    form.parentNode.insertBefore(message, form);

    // Remover mensagem após 5 segundos
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Exportar funções que podem ser necessárias em outros módulos
export {
    initAboutPageEnhancements,
    submitForm,
    validateField,
    isValidEmail
};