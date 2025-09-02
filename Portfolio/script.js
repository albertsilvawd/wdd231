// Array de projetos - ADICIONE SEUS PROJETOS AQUI
const projetos = [
    {
        titulo: "Projeto 1",
        imagem: "caminho/para/imagem1.jpg",
        descricao: "Descrição breve do primeiro projeto",
        link: "#"
    },
    {
        titulo: "Projeto 2",
        imagem: "caminho/para/imagem2.jpg",
        descricao: "Descrição breve do segundo projeto",
        link: "#"
    }
    // Adicione mais projetos conforme necessário
];

// Função para exibir projetos na página
function exibirProjetos() {
    const container = document.getElementById('projetosContainer');
    container.innerHTML = ''; // Limpa o container antes de adicionar projetos

    projetos.forEach(projeto => {
        const projetoElement = document.createElement('div');
        projetoElement.className = 'projeto-card';

        projetoElement.innerHTML = `
            <img src="${projeto.imagem}" alt="${projeto.titulo}" class="projeto-img">
            <div class="projeto-info">
                <h3>${projeto.titulo}</h3>
                <p>${projeto.descricao}</p>
                <a href="${projeto.link}" target="_blank">Ver projeto</a>
            </div>
        `;

        container.appendChild(projetoElement);
    });
}

// Função para atualizar o ano no footer
function atualizarAno() {
    const anoAtual = new Date().getFullYear();
    document.getElementById('anoAtual').textContent = anoAtual;
}

// Função para configurar o formulário de contato
function configurarFormulario() {
    const form = document.getElementById('contatoForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Mensagem enviada com sucesso! Entrarei em contato em breve.');
        form.reset();
    });
}

// Função para definir o nome do usuário
function definirNomeUsuario() {
    // Substitua 'Seu Nome' pelo nome real do usuário
    document.getElementById('nomeUsuario').textContent = 'Seu Nome';
}

// Inicialização quando o documento carregar
document.addEventListener('DOMContentLoaded', function () {
    definirNomeUsuario();
    exibirProjetos();
    atualizarAno();
    configurarFormulario();
});