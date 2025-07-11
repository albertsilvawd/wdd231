// Declarar URL e elemento cards
const url = 'https://byui-cse.github.io/cse-ww-program/data/latter-day-prophets.json';
const cards = document.querySelector('#cards');

// Função async para buscar dados dos profetas
async function getProphetData() {
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Verificar dados no console (remover depois)
        console.table(data.prophets);

        // Chamar função para exibir profetas
        displayProphets(data.prophets);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

// Função para exibir os profetas
const displayProphets = (prophets) => {
    prophets.forEach((prophet) => {
        // Criar elementos HTML
        let card = document.createElement('section');
        let fullName = document.createElement('h2');
        let portrait = document.createElement('img');
        let birthDate = document.createElement('p');
        let birthPlace = document.createElement('p');

        // Preencher conteúdo do nome
        fullName.textContent = `${prophet.name} ${prophet.lastname}`;

        // Configurar imagem
        portrait.setAttribute('src', prophet.imageurl);
        portrait.setAttribute('alt', `Portrait of ${prophet.name} ${prophet.lastname}`);
        portrait.setAttribute('loading', 'lazy');
        portrait.setAttribute('width', '340');
        portrait.setAttribute('height', '440');

        // Preencher informações adicionais
        birthDate.innerHTML = `<strong>Date of Birth:</strong> ${prophet.birthdate}`;
        birthPlace.innerHTML = `<strong>Place of Birth:</strong> ${prophet.birthplace}`;

        // Montar o card
        card.appendChild(fullName);
        card.appendChild(birthDate);
        card.appendChild(birthPlace);
        card.appendChild(portrait);

        // Adicionar card ao container
        cards.appendChild(card);
    });
}

// Chamar a função principal
getProphetData();