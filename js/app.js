class Player {
    constructor(data = {}) {
        Object.assign(this, data);
    };

    saveData() {
        localStorage.setItem('player', JSON.stringify(this));
    }

    editData = () => {
        const modal = document.createElement('dialog');
        const title = this.name ? 'Editar perfil' : 'Bienvenid@';
        const text = this.name ? '' : 'Para continuar, elije un nombre de usuario y un avatar.';
        let radios = '';
    
        for (let i = 0; i < 6; i++) {
            const checked = this?.avatar === `avatar${i+1}` ? 'checked' : ''; 
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
                    <input type="text" name="playerName" placeholder="Nombre" value="${this?.name || ''}" required>
                    <div class="config__radio">
                    ${radios}
                    </div>
                    <div class="config__buttons">
                        ${this?.scores ? '<button id="clearScore">Borrar puntuaciones</button>' : ''}
                        <div class="config__buttons--form">
                            ${this.name ? '<button type="reset">Cancelar</button>' : ''}
                            <button type="submit">Guardar</button>
                        </div>
                    </div>
                </form>
        `;
    
        modal.classList.add('config')
        modal.innerHTML = temp;
        main.append(modal);
        modal.showModal();
        modal.style.scale = 1;
        modal.style.opacity = 1;
    
        const form = document.querySelector('#playerForm');
        const clearScore = document.querySelector('#clearScore');

        form.addEventListener('submit', e => {
            e.preventDefault();

            this.name = document.querySelector('input[name="playerName"]').value;
            this.avatar = document.querySelector('input[name="playerAvatar"]:checked').value;
            this.saveData();

            modal.removeAttribute('style');
            setTimeout(() => {
                modal.remove();
            }, 200);
            this.updateAvatar();
        });

        form.addEventListener('reset', e => {
            e.preventDefault();

            modal.removeAttribute('style');
            setTimeout(() => {
                modal.remove();
            }, 300);
        })

        clearScore?.addEventListener('click', e => {
            e.preventDefault();

            this.scores = {};
            this.saveData();
            location.reload();
        })
    };

    saveScore(game, score) {
        this.scores ||= {};
        this.scores[game] = score;
        this.saveData();
    }

    updateAvatar() {
        const playerAvatar = document.querySelectorAll('.avatar--player');
        playerAvatar?.forEach(svg => svg.innerHTML = `<use xlink:href="../images/avatars.svg#${player.avatar}"></use>`);
    };
};

class Game {
    constructor(name, fileName, svg, symbols) {
        this.name = name;
        this.id = fileName;
        this.path = `../pages/${fileName}.html`;
        this.bkg = `bkg--${fileName}`;
        this.svg = `../images/${svg}.svg`;
        this.symbols = symbols;
    };

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

const ai = {
    changeFace(emotion, reset = false) {
        const aiFace = document.querySelector('#aiFace');
        const useAttr = (em = 'smile') => aiFace.setAttribute('xlink:href', `../images/ai.svg#${em}`)

        useAttr(emotion);
        reset && setTimeout(useAttr, 1500);
    }
}

const games = [
    new Game('Piedra, papel, tijera', 'rspls', 'hands', ['rock', 'scissors', 'paper', 'lizard', 'spock']),
    new Game('Ta-Te-Ti', 'tictactoe', 'xo', ['x', 'o']),
    new Game('Buscar parejas', 'pairs', 'animals', ['dragon', 'cat', 'kiwi', 'spider', 'horse', 'dog', 'frog', 'bird']),
    new Game('Batalla naval', 'battleship', 'ships', ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer']),
    new Game('Buscaminas', 'minesweeper', 'mine', ['mine', 'flag']),
];

const player = new Player(JSON.parse(localStorage.getItem('player')));
const main = document.querySelector('main');

player.avatar ? player.updateAvatar() : player.editData();

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
    const svgs = document.querySelectorAll('header .avatar--player');

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

    svgs.forEach(svg => svg.addEventListener('click', player.editData));
};