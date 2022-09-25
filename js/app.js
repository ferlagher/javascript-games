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

            div.append(svg);
        };
    };
};

const games = [
    new Game('Piedra, papel, tijera', 'rspls', 'hands', ['rock', 'scissors', 'paper', 'lizard', 'spock']),
    new Game('Ta-Te-Ti', 'tictactoe', 'xo', ['x', 'o']),
    new Game('Buscar parejas', 'pairs', 'animals', ['dragon', 'cat', 'kiwi', 'spider', 'horse', 'dog', 'frog', 'bird']),
    new Game('Batalla naval', 'battleship', 'ships', ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer']),
];

const main = document.querySelector('main');

if (location.pathname === '/' || location.pathname.includes('index.html')) { 
    
    games.forEach(game => {
        const section = document.createElement('section');
        const a = document.createElement('a')
        const h2 = document.createElement('h2');
        const decoTop = document.createElement('div')
        const decoBottom = document.createElement('div')
        
        h2.innerText = game.name;
        h2.classList.add('card__title');
        a.append(h2);
        a.href = game.path;
        a.classList.add('card__link');
        section.append(a);
        section.classList.add('card', game.bkg);
        section.id = game.id;
    
        decoTop.classList.add('decorations', 'decorations--top', `decorations--${game.id}`)
        decoBottom.classList.add('decorations', 'decorations--bottom', `decorations--${game.id}`)
    
        game.background(decoTop, 10, 'lg');
        game.background(decoBottom, 10, 'lg');
    
        main.append(section);
        main.append(decoTop);
        main.append(decoBottom);
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
        li.append(a);
        navlist.append(li);
    });

    document.querySelector('#expand').addEventListener('click', () => {
        document.querySelector('.header__nav').classList.toggle('header__nav--show');
    });
};

let player = JSON.parse(localStorage.getItem('player'));

const changeAvatar = () => {
    const playerAvatar = document.querySelector('#playerAvatar');

    if (playerAvatar) {
        playerAvatar.innerHTML = `<use xlink:href="../images/avatars.svg#${player.avatar}"></use>`
    };
};

const editPlayer = () => {
    const modal = document.createElement('dialog');
    const title = player ? 'Editar perfil' : 'Bienvenido';
    const text = player ? '' : 'Para continuar, elije un nombre de usuario y un avatar.';
    let radios = '';

    for (let i = 0; i < 6; i++) {
        const checked = player?.avatar === `avatar${i+1}` ? 'checked' : ''; 
        radios += `
            <label for="avatar${i+1}" class="radio">
                <input id="avatar${i+1}" value="avatar${i+1}" type="radio" name="playerAvatar" ${checked} required>
                <svg>
                    <use xlink:href="../images/avatars.svg#avatar${i+1}"></use>
                </svg>
            </label>
        `;
    }

    const temp = `
            <h2>${title}</h2>
            <p>${text}</p>
            <form id="playerForm">
                <input type="text" name="playerName" placeholder="Nombre" value="${player?.name || ''}" required>
                <div class="config__radio">
                ${radios}
                </div>
                <div class="config__buttons">
                    ${player ? '<button id="dismiss">Cancelar</button>' : ''}
                    <button type="submit">Guardar</button>
                </div>
            </form>
    `;

    modal.classList.add('config')
    modal.innerHTML = temp;
    main.append(modal);
    modal.showModal();

    const form = document.querySelector('#playerForm');
    
    form.addEventListener('submit', e => {
        e.preventDefault();

        player = {
            name: document.querySelector('input[name="playerName"]').value,
            avatar: document.querySelector('input[name="playerAvatar"]:checked').value,
        }

        localStorage.setItem('player', JSON.stringify(player));
        modal.remove();
        changeAvatar();
    });
};

if (!player) {editPlayer()};

changeAvatar();