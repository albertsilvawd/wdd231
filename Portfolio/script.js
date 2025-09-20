/* ========== SISTEMA DE PORTFÓLIO INTERATIVO - JAVASCRIPT PRINCIPAL ========== */

/*
COMO USAR ESTE ARQUIVO:
- Cada função está comentada indicando onde ela afeta HTML e CSS
- Para adicionar funcionalidade: copie uma função similar e modifique
- IDs e classes mencionadas devem existir no HTML
- Estilos CSS são aplicados/removidos dinamicamente
- Event listeners respondem a interações do usuário
*/

/* ========== VARIÁVEIS GLOBAIS E SELETORES DOM ========== */
/*
REFERENCIADO NO HTML: Elementos com IDs específicos
FUNCIONALIDADE: Armazena referências para elementos DOM que serão manipulados
PARA ADICIONAR: const novoElemento = document.getElementById('idDoElemento');
*/

// === ELEMENTOS PRINCIPAIS ===
// REFERENCIADO NO HTML: <body>
// MODIFICADO NO CSS: [data-theme="light"] ou [data-theme="dark"]
const body = document.body;

// REFERENCIADO NO HTML: <header class="header" id="header">
// MODIFICADO NO CSS: .header.scrolled (adicionado/removido dinamicamente)
const header = document.getElementById('header');

// REFERENCIADO NO HTML: <ul class="nav-menu" id="navMenu">
// MODIFICADO NO CSS: .nav-menu.active (controlado via JavaScript)
const navMenu = document.getElementById('navMenu');

// REFERENCIADO NO HTML: <button class="mobile-menu-toggle" id="mobileMenuToggle">
// FUNCIONALIDADE: Controla visibilidade do menu mobile
const mobileMenuToggle = document.getElementById('mobileMenuToggle');

// REFERENCIADO NO HTML: <button class="theme-toggle" id="themeToggle">
// FUNCIONALIDADE: Alterna entre modo claro e escuro
const themeToggle = document.getElementById('themeToggle');

// REFERENCIADO NO HTML: <button class="back-to-top" id="backToTop">
// MODIFICADO NO CSS: .back-to-top.visible (controlado via scroll)
const backToTop = document.getElementById('backToTop');

// REFERENCIADO NO HTML: <div class="progress-bar" id="progressBar">
// MODIFICADO NO CSS: width alterado dinamicamente conforme scroll
const progressBar = document.getElementById('progressBar');

// REFERENCIADO NO HTML: <div class="loading-screen" id="loadingScreen">
// MODIFICADO NO CSS: .loading-screen.hidden (removido após carregamento)
const loadingScreen = document.getElementById('loadingScreen');

// REFERENCIADO NO HTML: <form class="contact-form" id="contactForm">
// FUNCIONALIDADE: Processa envio do formulário de contato
const contactForm = document.getElementById('contactForm');

// REFERENCIADO NO HTML: <div class="modal" id="modal">
// MODIFICADO NO CSS: .modal.active (controlado via JavaScript)
const modal = document.getElementById('modal');

// REFERENCIADO NO HTML: <button class="modal-close" id="modalClose">
// FUNCIONALIDADE: Fecha o modal quando clicado
const modalClose = document.getElementById('modalClose');

// REFERENCIADO NO HTML: <div class="notification" id="notification">
// MODIFICADO NO CSS: .notification.show (controlado via JavaScript)
const notification = document.getElementById('notification');

/* ========== INICIALIZAÇÃO E CARREGAMENTO DA PÁGINA ========== */
/*
FUNCIONALIDADE: Gerencia o processo de carregamento inicial
AFETA HTML: Remove tela de loading
AFETA CSS: Adiciona classe .hidden ao loading screen
*/

// EVENTO DE CARREGAMENTO COMPLETO DA PÁGINA
// REFERENCIADO NO HTML: <div class="loading-screen">
// MODIFICADO NO CSS: .loading-screen.hidden
window.addEventListener('load', () => {
    // Aguarda 1 segundo para dar tempo da animação de carregamento ser vista
    setTimeout(() => {
        // Remove a tela de carregamento adicionando classe CSS
        loadingScreen.classList.add('hidden');
        console.log('🎉 Página carregada com sucesso!');
    }, 1000);
});

/* ========== NAVEGAÇÃO E CONTROLE DE SCROLL ========== */
/*
FUNCIONALIDADE: Gerencia comportamento durante scroll da página
AFETA HTML: Modifica classes de elementos baseado na posição do scroll
AFETA CSS: Ativa/desativa estilos de .header.scrolled, .back-to-top.visible
*/

// EVENTO PRINCIPAL DE SCROLL
// OTIMIZAÇÃO: Usa throttle para melhor performance
window.addEventListener('scroll', throttle(() => {
    // === MEDIÇÕES DE SCROLL ===
    const scrolled = window.pageYOffset;                    // Pixels rolados do topo
    const docHeight = document.documentElement.scrollHeight - window.innerHeight; // Altura total
    const scrollProgress = (scrolled / docHeight) * 100;   // Porcentagem de progresso

    // === ATUALIZAÇÃO DA BARRA DE PROGRESSO ===
    // REFERENCIADO NO HTML: <div class="progress-bar" id="progressBar">
    // MODIFICADO NO CSS: Propriedade width alterada dinamicamente
    progressBar.style.width = scrollProgress + '%';

    // === EFEITO DE HEADER QUANDO ROLADO ===
    // REFERENCIADO NO HTML: <header class="header" id="header">
    // MODIFICADO NO CSS: .header.scrolled (background mais opaco e sombra)
    if (scrolled > 100) {
        header.classList.add('scrolled');
        backToTop.classList.add('visible');
    } else {
        header.classList.remove('scrolled');
        backToTop.classList.remove('visible');
    }

    // === ATUALIZAÇÃO DO LINK ATIVO NA NAVEGAÇÃO ===
    // FUNCIONALIDADE: Destaca o link da seção atual
    updateActiveNavLink();

    // === ANIMAÇÕES DE ELEMENTOS CONFORME SCROLL ===
    // FUNCIONALIDADE: Anima elementos quando entram na tela
    animateOnScroll();

}, 16)); // 60 FPS para scroll suave

// SCROLL SUAVE PARA ÂNCORAS
// REFERENCIADO NO HTML: Todos os links com href="#seção"
// FUNCIONALIDADE: Substitui o scroll padrão por um movimento suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Previne comportamento padrão

        // Encontra o elemento alvo
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Rola suavemente até o elemento
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/* ========== MENU MOBILE ========== */
/*
FUNCIONALIDADE: Controla abertura/fechamento do menu em dispositivos móveis
AFETA HTML: Altera ícones do botão (bars ↔ times)
AFETA CSS: .nav-menu.active (mostra/esconde menu mobile)
*/

// TOGGLE DO MENU MOBILE
// REFERENCIADO NO HTML: <button class="mobile-menu-toggle" id="mobileMenuToggle">
// MODIFICADO NO CSS: .nav-menu.active
mobileMenuToggle.addEventListener('click', () => {
    // Alterna classe active no menu
    navMenu.classList.toggle('active');

    // Muda ícone do botão (hambúrguer ↔ X)
    const icon = mobileMenuToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');

    console.log('📱 Menu mobile alternado');
});

// FECHA MENU MOBILE AO CLICAR EM LINK
// REFERENCIADO NO HTML: <a class="nav-link">
// FUNCIONALIDADE: Melhora UX fechando menu após navegação
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        // Remove classe active do menu
        navMenu.classList.remove('active');

        // Restaura ícone do hambúrguer
        const icon = mobileMenuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

/* ========== SISTEMA DE TEMAS (CLARO/ESCURO) ========== */
/*
FUNCIONALIDADE: Alterna entre modo claro e escuro
AFETA HTML: Modifica atributo data-theme do body
AFETA CSS: [data-theme="light"] vs [data-theme="dark"]
PERSISTÊNCIA: Salva preferência no localStorage
*/

// ALTERNÂNCIA DE TEMA
// REFERENCIADO NO HTML: <button class="theme-toggle" id="themeToggle">
// MODIFICADO NO CSS: [data-theme] no body
themeToggle.addEventListener('click', () => {
    // Obtém tema atual
    const currentTheme = body.getAttribute('data-theme');

    // Determina novo tema
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    // Aplica novo tema
    body.setAttribute('data-theme', newTheme);

    // Salva preferência
    localStorage.setItem('theme', newTheme);

    // Atualiza ícone do botão
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');   // Lua para modo escuro
    icon.classList.toggle('fa-sun');    // Sol para modo claro

    // Feedback visual
    showNotification(`Tema ${newTheme === 'light' ? 'claro' : 'escuro'} ativado!`);

    console.log(`🎨 Tema alterado para: ${newTheme}`);
});

// CARREGAMENTO DE TEMA SALVO
// FUNCIONALIDADE: Restaura tema escolhido em visitas anteriores
// REFERENCIADO NO HTML: <body>
document.addEventListener('DOMContentLoaded', () => {
    // Recupera tema salvo (padrão: dark)
    const savedTheme = localStorage.getItem('theme') || 'dark';

    // Aplica tema
    body.setAttribute('data-theme', savedTheme);

    // Atualiza ícone conforme tema
    if (savedTheme === 'light') {
        themeToggle.querySelector('i').classList.remove('fa-moon');
        themeToggle.querySelector('i').classList.add('fa-sun');
    }

    console.log(`🎨 Tema carregado: ${savedTheme}`);
});

/* ========== BOTÃO VOLTAR AO TOPO ========== */
/*
FUNCIONALIDADE: Scroll suave para o topo da página
AFETA CSS: Visibilidade controlada via .back-to-top.visible
*/

// CLIQUE NO BOTÃO VOLTAR AO TOPO
// REFERENCIADO NO HTML: <button class="back-to-top" id="backToTop">
backToTop.addEventListener('click', () => {
    // Scroll suave para o topo
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    console.log('⬆️ Voltando ao topo');
});

/* ========== ANIMAÇÕES BASEADAS EM SCROLL ========== */
/*
FUNCIONALIDADE: Anima elementos quando entram na área visível
AFETA HTML: Elementos com classe .animate-on-scroll
AFETA CSS: Adiciona classe .animated para ativar animação
OTIMIZAÇÃO: Usa Intersection Observer para melhor performance
*/

// FUNÇÃO DE ANIMAÇÃO NO SCROLL (FALLBACK)
// REFERENCIADO NO HTML: <elemento class="animate-on-scroll">
// MODIFICADO NO CSS: .animate-on-scroll.animated
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const windowHeight = window.innerHeight;

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150; // Trigger 150px antes de entrar na tela

        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('animated');
        }
    });
}

// INTERSECTION OBSERVER (OTIMIZADO)
// FUNCIONALIDADE: Detecta quando elementos entram na tela
const observerOptions = {
    threshold: 0.1,                  // 10% do elemento visível
    rootMargin: '0px 0px -50px 0px'  // Margem de 50px do fundo
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Adiciona classe para animação
            entry.target.classList.add('animated');

            // CASO ESPECIAL: Animar contadores na seção about
            // REFERENCIADO NO HTML: <section id="about">
            if (entry.target.id === 'about') {
                animateCounters();
                observer.unobserve(entry.target); // Anima apenas uma vez
            }
        }
    });
}, observerOptions);

// OBSERVA TODOS OS ELEMENTOS ANIMÁVEIS
// REFERENCIADO NO HTML: <elemento class="animate-on-scroll">
document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

/* ========== NAVEGAÇÃO ATIVA ========== */
/*
FUNCIONALIDADE: Destaca link da seção atualmente visível
AFETA HTML: Links de navegação no header
AFETA CSS: .nav-link.active
*/

// ATUALIZAÇÃO DO LINK ATIVO
// REFERENCIADO NO HTML: <section id="home">, <section id="about">, etc.
// MODIFICADO NO CSS: .nav-link.active
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';

    // Encontra seção atual baseada no scroll
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    // Atualiza classes dos links
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

/* ========== ANIMAÇÃO DE CONTADORES ========== */
/*
FUNCIONALIDADE: Anima números de 0 até valor final
AFETA HTML: Elementos com data-count
AFETA CSS: Valores numéricos são atualizados dinamicamente
*/

// ANIMAÇÃO DOS NÚMEROS ESTATÍSTICOS
// REFERENCIADO NO HTML: <span class="stat-number" data-count="50">
// FUNCIONALIDADE: Conta de 0 até o valor em data-count
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000; // 2 segundos
        const increment = target / (duration / 16); // 60 FPS
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            counter.textContent = Math.floor(current);

            // Para quando atinge o valor alvo
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            }
        }, 16); // ~60 FPS
    });

    console.log('🔢 Contadores animados');
}

/* ========== FORMULÁRIO DE CONTATO ========== */
/*
FUNCIONALIDADE: Processa envio do formulário com validação
AFETA HTML: Formulário de contato e botão de envio
AFETA CSS: Estados de loading do botão
VALIDAÇÃO: Campos obrigatórios e formato de email
*/

// PROCESSAMENTO DO FORMULÁRIO
// REFERENCIADO NO HTML: <form class="contact-form" id="contactForm">
// MODIFICADO NO CSS: Texto e estado do botão durante envio
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Previne envio padrão

    // === PREPARAÇÃO ===
    const formData = new FormData(contactForm);
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;

    // === VALIDAÇÃO BÁSICA ===
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');

    // Validação de campos obrigatórios
    if (!name || !email || !subject || !message) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

    // Validação de email
    if (!isValidEmail(email)) {
        showNotification('Por favor, insira um email válido.', 'error');
        return;
    }

    // === ESTADO DE LOADING ===
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitButton.disabled = true;

    try {
        // === SIMULAÇÃO DE ENVIO ===
        // NOTA: Substitua pela sua API real
        await new Promise(resolve => setTimeout(resolve, 2000));

        // === SUCESSO ===
        showNotification('Mensagem enviada com sucesso! Retornarei em breve.', 'success');
        contactForm.reset(); // Limpa formulário

        // Track evento para analytics
        trackEvent('contact_form_submit', {
            name: name,
            subject: subject
        });

    } catch (error) {
        // === ERRO ===
        console.error('Erro no envio:', error);
        showNotification('Erro ao enviar mensagem. Tente novamente.', 'error');

    } finally {
        // === RESTAURAÇÃO ===
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
});

/* ========== SISTEMA DE MODAL ========== */
/*
FUNCIONALIDADE: Controla abertura e fechamento de modais
AFETA HTML: Modal e seu conteúdo
AFETA CSS: .modal.active, overflow do body
*/

// FUNÇÃO PARA ABRIR MODAL
// REFERENCIADO NO HTML: <div class="modal" id="modal">
// MODIFICADO NO CSS: .modal.active, body overflow
function openModal(title, content) {
    // Atualiza conteúdo do modal
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalText').textContent = content;

    // Mostra modal
    modal.classList.add('active');

    // Previne scroll do body
    body.style.overflow = 'hidden';

    console.log(`📋 Modal aberto: ${title}`);
}

// FUNÇÃO PARA FECHAR MODAL
function closeModal() {
    // Esconde modal
    modal.classList.remove('active');

    // Restaura scroll do body
    body.style.overflow = '';

    console.log('❌ Modal fechado');
}

// EVENT LISTENERS DO MODAL
// REFERENCIADO NO HTML: <button class="modal-close" id="modalClose">
modalClose.addEventListener('click', closeModal);

// Fecha modal clicando fora do conteúdo
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

/* ========== SISTEMA DE NOTIFICAÇÕES ========== */
/*
FUNCIONALIDADE: Exibe mensagens temporárias de feedback
AFETA HTML: Elemento de notificação
AFETA CSS: .notification.show, cores baseadas no tipo
*/

// FUNÇÃO PARA MOSTRAR NOTIFICAÇÃO
// REFERENCIADO NO HTML: <div class="notification" id="notification">
// MODIFICADO NO CSS: .notification.show, border-left-color
function showNotification(message, type = 'info') {
    const notificationText = document.getElementById('notificationText');
    notificationText.textContent = message;

    // Define cor baseada no tipo
    const colors = {
        success: '#10b981', // Verde
        error: '#ef4444',   // Vermelho
        warning: '#f59e0b', // Amarelo
        info: '#3b82f6'     // Azul
    };

    notification.style.borderLeftColor = colors[type] || colors.info;

    // Mostra notificação
    notification.classList.add('show');

    // Remove automaticamente após 4 segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);

    console.log(`🔔 Notificação (${type}): ${message}`);
}

/* ========== NAVEGAÇÃO POR TECLADO ========== */
/*
FUNCIONALIDADE: Atalhos de teclado para melhor acessibilidade
AFETA HTML: Modal, scroll da página
AFETA CSS: Comportamento de scroll e modal
*/

// EVENT LISTENER GLOBAL DE TECLADO
document.addEventListener('keydown', (e) => {
    // === ESC PARA FECHAR MODAL ===
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }

    // === CTRL + / PARA AJUDA ===
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        openModal('Atalhos de Teclado',
            'ESC: Fechar modal\n' +
            'Ctrl + /: Mostrar atalhos\n' +
            'Home: Ir para o topo\n' +
            'End: Ir para o rodapé'
        );
    }

    // === HOME PARA IR AO TOPO ===
    if (e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // === END PARA IR AO RODAPÉ ===
    if (e.key === 'End') {
        e.preventDefault();
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    }
});

/* ========== OTIMIZAÇÕES DE PERFORMANCE ========== */
/*
FUNCIONALIDADE: Throttle e debounce para melhor performance
USO: Limita frequência de execução de funções pesadas
*/

// FUNÇÃO THROTTLE
// USO: Limita execução durante scroll para 60 FPS
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// FUNÇÃO DEBOUNCE
// USO: Aguarda usuário parar de digitar antes de executar
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* ========== GERENCIAMENTO DE PREFERÊNCIAS ========== */
/*
FUNCIONALIDADE: Salva e carrega preferências do usuário
PERSISTÊNCIA: localStorage para dados entre sessões
*/

// SALVAR PREFERÊNCIAS
function saveUserPreferences() {
    const preferences = {
        theme: body.getAttribute('data-theme'),
        lastVisit: new Date().toISOString()
    };
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    console.log('💾 Preferências salvas');
}

// CARREGAR PREFERÊNCIAS
function loadUserPreferences() {
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');

    // Restaura tema
    if (preferences.theme) {
        body.setAttribute('data-theme', preferences.theme);
        if (preferences.theme === 'light') {
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
    }

    // Mensagem de boas-vindas para usuários recorrentes
    if (preferences.lastVisit) {
        const lastVisit = new Date(preferences.lastVisit);
        const now = new Date();
        const daysSinceLastVisit = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));

        if (daysSinceLastVisit > 0) {
            setTimeout(() => {
                showNotification(`Bem-vindo de volta! Última visita: ${daysSinceLastVisit} dia(s) atrás`);
            }, 2000);
        }
    }

    console.log('📁 Preferências carregadas');
}

/* ========== ANALYTICS E TRACKING ========== */
/*
FUNCIONALIDADE: Rastreia interações para análise
AFETA HTML: Links de projetos, formulários
INTEGRAÇÃO: Google Analytics (se configurado)
*/

// FUNÇÃO DE TRACKING
// USO: Rastreia eventos importantes para analytics
function trackEvent(eventName, properties = {}) {
    // Integração com Google Analytics (se disponível)
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }

    // Log para desenvolvimento
    console.log('📊 Event tracked:', eventName, properties);

    // Aqui você pode adicionar outros serviços de analytics
    // exemplo: amplitude, mixpanel, etc.
}

// TRACKING AUTOMÁTICO DE LINKS DE PROJETO
// REFERENCIADO NO HTML: <a class="project-link">
document.querySelectorAll('.project-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const projectTitle = e.target.closest('.project-card').querySelector('.project-title').textContent;
        const linkType = e.target.textContent.includes('Demo') ? 'demo' : 'code';

        trackEvent('project_link_click', {
            project: projectTitle,
            link_type: linkType
        });
    });
});

/* ========== EASTER EGGS E INTERAÇÕES ESPECIAIS ========== */
/*
FUNCIONALIDADE: Funcionalidades divertidas e escondidas
AFETA HTML: Efeitos especiais no body
AFETA CSS: Transformações e animações especiais
*/

// KONAMI CODE EASTER EGG
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);

    // Mantém apenas os últimos 10 códigos
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }

    // Verifica se sequência foi completada
    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
        // Easter egg ativado!
        document.body.style.transform = 'rotate(360deg)';
        document.body.style.transition = 'transform 2s ease-in-out';

        setTimeout(() => {
            document.body.style.transform = '';
            showNotification('🎉 Konami Code ativado! Você é um verdadeiro gamer!');
        }, 2000);

        konamiCode = []; // Reset
        trackEvent('easter_egg_konami_code');
    }
});

/* ========== UTILITÁRIOS E HELPERS ========== */
/*
FUNCIONALIDADE: Funções auxiliares reutilizáveis
USO: Validação, formatação, detecção de dispositivo
*/

// VALIDAÇÃO DE EMAIL
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// FORMATAÇÃO DE NÚMEROS
function formatNumber(num) {
    return new Intl.NumberFormat('pt-BR').format(num);
}

// DETECÇÃO DE DISPOSITIVO MÓVEL
function isMobile() {
    return window.innerWidth <= 768;
}

// CÓPIA PARA CLIPBOARD
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Texto copiado para a área de transferência!');
        return true;
    } catch (err) {
        console.error('Erro ao copiar texto:', err);
        showNotification('Erro ao copiar texto', 'error');
        return false;
    }
}

// SCROLL SUAVE PARA ELEMENTO
function scrollToElement(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
            top: elementPosition - offset,
            behavior: 'smooth'
        });
    }
}

/* ========== TRATAMENTO DE ERROS ========== */
/*
FUNCIONALIDADE: Captura e registra erros JavaScript
USO: Monitoramento de problemas em produção
*/

// HANDLER GLOBAL DE ERROS
window.addEventListener('error', (e) => {
    console.error('❌ JavaScript Error:', e.error);

    // Em produção, envie erros para serviço de monitoramento
    trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno
    });
});

// HANDLER DE PROMISES REJEITADAS
window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Unhandled Promise Rejection:', e.reason);

    trackEvent('promise_rejection', {
        reason: e.reason.toString()
    });
});

/* ========== RESPONSIVIDADE E RESIZE ========== */
/*
FUNCIONALIDADE: Ajusta comportamento conforme tamanho da tela
AFETA HTML: Menu mobile, elementos responsivos
AFETA CSS: Classes e estilos adaptativos
*/

// HANDLER DE REDIMENSIONAMENTO
// FUNCIONALIDADE: Reage a mudanças no tamanho da janela
window.addEventListener('resize', debounce(() => {
    // === FECHAMENTO AUTOMÁTICO DO MENU MOBILE ===
    // REFERENCIADO NO HTML: <ul class="nav-menu">
    // MODIFICADO NO CSS: .nav-menu.active
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
        const icon = mobileMenuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }

    // === RECÁLCULO DE ANIMAÇÕES ===
    animateOnScroll();

    console.log(`📐 Redimensionado para: ${window.innerWidth}x${window.innerHeight}`);
}, 250)); // Espera 250ms após parar de redimensionar

/* ========== INICIALIZAÇÃO FINAL ========== */
/*
FUNCIONALIDADE: Configurações que executam quando DOM está pronto
ORDEM: Executa após todos os elementos HTML serem carregados
*/

// INICIALIZAÇÃO QUANDO DOM ESTÁ PRONTO
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM carregado, iniciando aplicação...');

    // === CARREGAMENTO DE PREFERÊNCIAS ===
    loadUserPreferences();

    // === CONFIGURAÇÕES INICIAIS ===
    // Anima elementos já visíveis na tela
    animateOnScroll();

    // === MENSAGEM DE BOAS-VINDAS ===
    setTimeout(() => {
        showNotification('Bem-vindo ao meu portfólio! 👋');
    }, 1500);

    // === INICIALIZAÇÃO DE COMPONENTES ESPECIAIS ===
    initializeCustomComponents();

    console.log('✅ Aplicação inicializada com sucesso!');
});

// SALVAMENTO DE PREFERÊNCIAS ANTES DE SAIR
// FUNCIONALIDADE: Persiste dados antes do usuário fechar a aba
window.addEventListener('beforeunload', () => {
    saveUserPreferences();
});

/* ========== COMPONENTES PERSONALIZADOS ========== */
/*
FUNCIONALIDADE: Inicializa componentes avançados opcionais
PARA ADICIONAR: Inclua novos componentes aqui
*/

function initializeCustomComponents() {
    // === PARALLAX SIMPLES ===
    // REFERENCIADO NO HTML: <elemento class="parallax">
    initializeParallax();

    // === LAZY LOADING DE IMAGENS ===
    // REFERENCIADO NO HTML: <img data-src="caminho">
    initializeLazyLoading();

    // === TOOLTIPS AVANÇADOS ===
    // REFERENCIADO NO HTML: <elemento class="tooltip" data-tooltip="texto">
    initializeTooltips();

    console.log('🔧 Componentes personalizados inicializados');
}

// PARALLAX SIMPLES
function initializeParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');

    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const rate = scrolled * -0.5; // Velocidade do parallax
                element.style.transform = `translateY(${rate}px)`;
            });
        }, 16));
    }
}

// LAZY LOADING DE IMAGENS
function initializeLazyLoading() {
    // REFERENCIADO NO HTML: <img data-src="url-da-imagem" class="lazy">
    const lazyImages = document.querySelectorAll('img[data-src]');

    if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// TOOLTIPS AVANÇADOS
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('.tooltip[data-tooltip]');

    tooltipElements.forEach(element => {
        // Cria tooltip dinâmico se necessário
        // Esta funcionalidade já está implementada via CSS
        // Mas aqui você pode adicionar lógica JavaScript adicional

        element.addEventListener('mouseenter', () => {
            // Lógica adicional no hover
        });

        element.addEventListener('mouseleave', () => {
            // Lógica adicional quando sai do hover
        });
    });
}

/* ========== SERVICE WORKER (PWA) ========== */
/*
FUNCIONALIDADE: Registra Service Worker para funcionalidade offline
AFETA: Capacidades de PWA (Progressive Web App)
*/

// REGISTRO DO SERVICE WORKER
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('🔄 SW registered: ', registration);

                // Notifica sobre nova versão disponível
                registration.addEventListener('updatefound', () => {
                    showNotification('Nova versão disponível! Recarregue a página.', 'info');
                });
            })
            .catch(registrationError => {
                console.log('❌ SW registration failed: ', registrationError);
            });
    });
}

/* ========== FUNCIONALIDADES AVANÇADAS OPCIONAIS ========== */
/*
FUNCIONALIDADE: Recursos extras que podem ser ativados conforme necessário
PARA ATIVAR: Descomente as funções desejadas
*/

// DETECÇÃO DE CONEXÃO LENTA
function detectSlowConnection() {
    if ('connection' in navigator) {
        const connection = navigator.connection;

        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            // Reduz animações para conexões lentas
            document.body.classList.add('reduced-motion');
            showNotification('Conexão lenta detectada. Animações reduzidas.', 'warning');
        }
    }
}

// MODO ESCURO AUTOMÁTICO BASEADO NO SISTEMA
function detectSystemTheme() {
    if (window.matchMedia && !localStorage.getItem('theme')) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Define tema baseado na preferência do sistema
        const systemTheme = darkModeQuery.matches ? 'dark' : 'light';
        body.setAttribute('data-theme', systemTheme);

        // Atualiza ícone do botão
        if (systemTheme === 'light') {
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }

        // Escuta mudanças na preferência do sistema
        darkModeQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) { // Só se usuário não escolheu manualmente
                const newTheme = e.matches ? 'dark' : 'light';
                body.setAttribute('data-theme', newTheme);
                showNotification(`Tema alterado automaticamente para ${newTheme}`, 'info');
            }
        });
    }
}

// FEEDBACK HÁPTICO (VIBRAÇÃO)
function hapticFeedback(pattern = [100]) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// COMPARTILHAMENTO NATIVO
async function shareContent(title, text, url) {
    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
                text: text,
                url: url
            });

            trackEvent('content_shared', { method: 'native' });
            return true;
        } catch (error) {
            console.log('Compartilhamento cancelado');
            return false;
        }
    } else {
        // Fallback: copia URL para clipboard
        copyToClipboard(url);
        return false;
    }
}

// DETECÇÃO DE INSTALAÇÃO PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Mostra botão de instalação customizado
    showInstallButton();
});

function showInstallButton() {
    // Cria botão de instalação se não existir
    if (!document.getElementById('installButton')) {
        const installButton = document.createElement('button');
        installButton.id = 'installButton';
        installButton.className = 'btn btn-primary';
        installButton.innerHTML = '<i class="fas fa-download"></i> Instalar App';
        installButton.style.position = 'fixed';
        installButton.style.bottom = '20px';
        installButton.style.left = '20px';
        installButton.style.zIndex = '1000';

        installButton.addEventListener('click', installApp);
        document.body.appendChild(installButton);

        setTimeout(() => {
            showNotification('Você pode instalar este app em seu dispositivo!', 'info');
        }, 3000);
    }
}

async function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            trackEvent('pwa_installed');
            document.getElementById('installButton')?.remove();
        }

        deferredPrompt = null;
    }
}

/* ========== FUNCIONALIDADES DE DESENVOLVIMENTO ========== */
/*
FUNCIONALIDADE: Ferramentas úteis durante desenvolvimento
PARA PRODUÇÃO: Remova ou comente essas funções
*/

// CONSOLE ESTILIZADO
function logStyled(message, style = 'color: #667eea; font-weight: bold; font-size: 16px;') {
    console.log(`%c${message}`, style);
}

// DEBUGGING DE PERFORMANCE
function measurePerformance() {
    if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];

        const metrics = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
        };

        console.table(metrics);
        return metrics;
    }
}

// INFORMAÇÕES DO SISTEMA
function logSystemInfo() {
    const info = {
        'User Agent': navigator.userAgent,
        'Language': navigator.language,
        'Platform': navigator.platform,
        'Screen': `${screen.width}x${screen.height}`,
        'Viewport': `${window.innerWidth}x${window.innerHeight}`,
        'Color Depth': screen.colorDepth,
        'Pixel Ratio': window.devicePixelRatio,
        'Online': navigator.onLine,
        'Cookies Enabled': navigator.cookieEnabled
    };

    console.table(info);
}

/* ========== EXPOSIÇÃO GLOBAL PARA DEBUG ========== */
/*
FUNCIONALIDADE: Disponibiliza funções no console para debug
USO: Digite portfolioDebug.openModal() no console do navegador
*/

// OBJETO GLOBAL PARA DEBUGGING
window.portfolioDebug = {
    // Funções principais
    openModal,
    closeModal,
    showNotification,
    trackEvent,
    copyToClipboard,
    scrollToElement,

    // Utilitários
    formatNumber,
    isValidEmail,
    isMobile,
    measurePerformance,
    logSystemInfo,

    // Estado da aplicação
    getTheme: () => body.getAttribute('data-theme'),
    isMenuOpen: () => navMenu.classList.contains('active'),
    isModalOpen: () => modal.classList.contains('active'),

    // Funções de teste
    testNotifications: () => {
        showNotification('Teste de sucesso!', 'success');
        setTimeout(() => showNotification('Teste de erro!', 'error'), 1000);
        setTimeout(() => showNotification('Teste de aviso!', 'warning'), 2000);
        setTimeout(() => showNotification('Teste de info!', 'info'), 3000);
    },

    testModal: () => {
        openModal('Modal de Teste', 'Este é um modal de teste para verificar a funcionalidade.');
    },

    // Ativação de funcionalidades opcionais
    enableSlowConnectionDetection: detectSlowConnection,
    enableSystemThemeDetection: detectSystemTheme,
    enablePerformanceMonitoring: () => {
        setInterval(measurePerformance, 30000); // A cada 30 segundos
    }
};

/* ========== LOG FINAL DE INICIALIZAÇÃO ========== */
/*
FUNCIONALIDADE: Confirma que todo o sistema foi carregado
INFORMAÇÕES: Versão, configurações, estatísticas
*/

// LOG DE INICIALIZAÇÃO COMPLETA
window.addEventListener('load', () => {
    // Banner estilizado
    logStyled('🚀 Portfolio System Loaded Successfully!', 'color: #667eea; font-size: 20px; font-weight: bold;');

    // Informações do sistema
    const systemInfo = {
        'Version': '1.0.0',
        'Theme': body.getAttribute('data-theme'),
        'Screen Size': `${window.innerWidth}x${window.innerHeight}`,
        'Device': isMobile() ? 'Mobile' : 'Desktop',
        'Service Worker': 'serviceWorker' in navigator ? 'Supported' : 'Not Supported',
        'Local Storage': 'localStorage' in window ? 'Available' : 'Not Available'
    };

    console.table(systemInfo);

    // Dicas para desenvolvedores
    console.log(`
🔧 Developer Tips:
• Use portfolioDebug.testNotifications() para testar notificações
• Use portfolioDebug.testModal() para testar modal
• Use portfolioDebug.measurePerformance() para métricas
• Use portfolioDebug.logSystemInfo() para informações do sistema
• Todas as funções estão disponíveis em window.portfolioDebug
    `);

    // Performance inicial
    setTimeout(measurePerformance, 1000);

    // Ativa funcionalidades opcionais se necessário
    // detectSlowConnection();
    // detectSystemTheme();
});

/* ========== COMENTÁRIOS FINAIS E GUIA DE USO ========== */

/*
=== GUIA RÁPIDO PARA DESENVOLVEDORES ===

ADICIONAR NOVA FUNCIONALIDADE:
1. Crie a função seguindo o padrão de comentários
2. Adicione event listeners necessários
3. Referencie elementos HTML corretos
4. Teste com portfolioDebug

MODIFICAR COMPORTAMENTO EXISTENTE:
1. Encontre a função correspondente
2. Modifique mantendo a estrutura de comentários
3. Teste as mudanças em diferentes dispositivos

ADICIONAR NOVO COMPONENTE:
1. Adicione HTML necessário com IDs/classes
2. Crie estilos CSS correspondentes
3. Implemente JavaScript seguindo padrões existentes
4. Adicione ao initializeCustomComponents()

INTEGRAR COM BACKEND:
1. Substitua simulações de API por chamadas reais
2. Adicione tratamento de erro apropriado
3. Implemente loading states
4. Adicione validação do lado servidor

OTIMIZAÇÕES DE PRODUÇÃO:
1. Minifique JavaScript, CSS e HTML
2. Otimize imagens e assets
3. Configure caching apropriado
4. Remova console.logs e funções de debug

DEBUGGING:
• Abra DevTools (F12)
• Use portfolioDebug.* para testar funcionalidades
• Monitore console para erros
• Teste em diferentes dispositivos e navegadores

MANUTENÇÃO:
• Atualize dependências regularmente
• Teste compatibilidade com novos navegadores
• Monitore performance em produção
• Colete feedback dos usuários

ESTRUTURA DE ARQUIVOS RECOMENDADA:
/
├── index.html          (este arquivo HTML)
├── style.css           (este arquivo CSS)
├── script.js           (este arquivo JavaScript)
├── sw.js               (Service Worker - opcional)
├── manifest.json       (PWA Manifest - opcional)
└── assets/
    ├── images/
    ├── fonts/
    └── icons/

VARIÁVEIS IMPORTANTES:
• Todas as variáveis DOM estão no início do arquivo
• Constantes de configuração podem ser movidas para objeto CONFIG
• localStorage keys: 'theme', 'userPreferences'

EVENT LISTENERS PRINCIPAIS:
• window.load: inicialização
• window.scroll: efeitos de scroll
• window.resize: responsividade
• form.submit: processamento de formulários
• button.click: interações de usuário

FUNÇÕES UTILITÁRIAS:
• showNotification(): feedback para usuário
• trackEvent(): analytics
• throttle()/debounce(): performance
• isValidEmail(): validação
• copyToClipboard(): funcionalidade de cópia
*/