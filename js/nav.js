class Game {
    constructor(name, fileName, svg, symbols) {
        this.name = name;
        this.id = fileName;
        this.path = `../pages/${fileName}.html`;
        this.bkg = `bkg--${fileName}`;
        this.svg = `../images/${svg}.svg`;
        this.symbols = symbols;
    }

    background(div, amount, size) {
        for (let i = 0; i < amount; i++) {
            const n = Math.floor(Math.random() * this.symbols.length);
            const symbol = this.symbols[n];

            let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.classList.add('decorations__svg', `svg--${size}`)
            svg.innerHTML = `<use xlink:href="${this.svg}#${symbol}"></use>`;

            svg.style.left = i * (100 / amount) + Math.random() * (100 / amount) + '%';
            svg.style.top = (i % 2) * 50 + Math.random() * 50 + '%';
            svg.style.transform = `rotate(${Math.random() * 360}deg)`;

            div.appendChild(svg);
        };
    };
};

const games = [
    new Game('Piedra, papel, tijera', 'rspls', 'hands', ['rock', 'scissors', 'paper', 'lizard', 'spock']),
    new Game('Ta-Te-Ti', 'tictactoe', 'xo', ['x', 'o']),
    new Game('Buscar parejas', 'pairs', 'animals', ['dragon', 'cat', 'kiwi', 'spider', 'horse', 'dog', 'frog', 'bird']),
    new Game('Batalla naval', 'battleship', 'ships', ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer']),
];

if (location.pathname === '/' || location.pathname.includes('index.html')) { 
    const main = document.querySelector('#main');
    
    games.forEach(game => {
        const section = document.createElement('section');
        const a = document.createElement('a')
        const h2 = document.createElement('h2');
        const decoTop = document.createElement('div')
        const decoBottom = document.createElement('div')
        
        h2.innerText = game.name;
        h2.classList.add('card__title');
        a.appendChild(h2);
        a.href = game.path;
        a.classList.add('card__link');
        section.appendChild(a);
        section.classList.add('card', game.bkg);
        section.id = game.id;
    
        decoTop.classList.add('decorations', 'decorations--top', `decorations--${game.id}`)
        decoBottom.classList.add('decorations', 'decorations--bottom', `decorations--${game.id}`)
    
        game.background(decoTop, 10, 'lg');
        game.background(decoBottom, 10, 'lg');
    
        main.appendChild(section);
        main.appendChild(decoTop);
        main.appendChild(decoBottom);
    });
    
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            toggleBkg(card);
        });
        card.addEventListener('mouseleave', () => {
            toggleBkg(card);
        });
    })
    
    const toggleBkg = (div) => {
        const body = document.querySelector('.index');
        const bkg = div.classList.item(1);
        const decorations = document.querySelectorAll(`.decorations--${div.id}`);
    
        body.classList.toggle('bkg--index');
        body.classList.toggle(bkg);
        decorations.forEach(deco => {
            deco.classList.toggle('decorations--show');
        });
    }
} else {
    const navlist = document.querySelector('.header__list');

    games.forEach(game => {
        const a = document.createElement('a');
        const li = document.createElement('li');

        a.href = game.path;
        a.innerText = game.name;
        li.appendChild(a);
        navlist.appendChild(li);
    })
};

document.querySelector('#expand').addEventListener('click', () => {
    document.querySelector('.header__nav').classList.toggle('header__nav--show');
});