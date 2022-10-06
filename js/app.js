// Libraries

const toasty = mssg => {
    Toastify({
    text: mssg,
    duration: 3000,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    className: "toasty",
    style: {
        color: "#000",
        background: "#E7F0F4",
        cursor: "default",
    },
    offset: {
        y: 50,
    },
}).showToast();
};

const confettiCannons = () => {
    confetti({
        particleCount: 50,
        angle: 60,
        spread: 80,
        origin: {x: 0, y: 0.8},
        colors: ['#E7F0F4'],
    });
    confetti({
        particleCount: 50,
        angle: 120,
        spread: 80,
        origin: {x: 1, y: 0.8},
        colors: ['#E7F0F4']
    });
};

const sound = {
    win: new Howl({
        src: ['../sounds/win.wav']
    }),
    
    loose: new Howl({
        src: ['../sounds/loose.wav']
    }),
    
    good: new Howl({
        src: ['../sounds/good.wav']
    }),
    
    bad: new Howl({
        src: ['../sounds/bad.wav']
    }),
    
    plop: new Howl({
        src: ['../sounds/plop.wav']
    }),
    
    flipCard: new Howl({
        src: ['../sounds/flipCard.mp3']
    }),
    
    shuffleCards: new Howl({
        src: ['../sounds/shuffleCards.mp3']
    }),

    explosion: new Howl({
        src: ['../sounds/explosion.mp3']
    }),

    splash: new Howl({
        src: ['../sounds/splash.mp3']
    }),
};

// Global functions

const random = {
    integer(n) {
        return Math.floor(Math.random() * n);
    },

    element(arr) {
        return arr[this.integer(arr.length)];
    }
}

const formatTime = sec => {
    let mm = `${Math.floor(sec / 60)}`;
    let ss = `${sec % 60}`;

    mm = mm.padStart(2, '0');
    ss = ss.padStart(2, '0');

    return `${mm}:${ss}`
}

const createModal = template => {
    const main = document.querySelector('main');
    const modal = document.createElement('dialog');

    modal.classList.add('modal')
    modal.innerHTML = template;
    main.append(modal);

    return modal;
}

const ai = {
    timer: null,
    
    changeFace(emotion, reset = false) {
        const aiFace = document.querySelector('#aiFace');
        const useAttr = (em = 'smile') => aiFace.setAttribute('xlink:href', `../images/ai.svg#${em}`)
        
        clearTimeout(this.timer);
        useAttr(emotion);
        this.timer = reset && setTimeout(useAttr, 1500);
    },
};

// Classes

class Player {
    constructor(data = {}) {
        Object.assign(this, data);
    };

    saveData() {
        localStorage.setItem('player', JSON.stringify(this));
    };

    editData() {
        let config = document.querySelector('#config');
        if (!config) {
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
        
            const template = `
                    <h2>${title}</h2>
                    <p>${text}</p>
                    <form id="playerForm">
                        <input type="text" name="playerName" placeholder="Nombre" value="${this?.name || ''}" required>
                        <div class="modal__radio">
                        ${radios}
                        </div>
                        <div class="modal__buttons">
                            ${this.name ? '<button type="reset">Cancelar</button>' : ''}
                            <button type="submit">Guardar</button>
                        </div>
                    </form>
            `;

            config = createModal(template);
            config.id = 'config';

            const form = document.querySelector('#playerForm');
    
            form.addEventListener('submit', e => {
                e.preventDefault();
    
                this.name = document.querySelector('input[name="playerName"]').value;
                this.avatar = document.querySelector('input[name="playerAvatar"]:checked').value;
                this.saveData();
    
                config.removeAttribute('style');
                setTimeout(() => {
                    config.close();
                    toasty('Perfil actualizado.');
                }, 200);
                this.updateAvatar();
            });
            
            form.addEventListener('reset', e => {
                e.preventDefault();
                
                config.removeAttribute('style');
                setTimeout(() => {
                    config.close();
                }, 300);
            });
        }
    
        config.showModal();
        config.style.scale = 1;
        config.style.opacity = 1;
    };

    saveScore(game, score) {
        this.scores ||= {};
        this.scores[game] = score;
        this.saveData();
    };

    clearScore() {
        let confirm = document.querySelector('#confirm');
        if (!confirm) {
            const template = `
                <h2>Borrar puntuaciones</h2>
                <p>Se borrarán las puntuaciones de todos los juegos</p>
                    <div class="modal__buttons">
                        <button id="cancel">Cancelar</button>
                        <button id="clear">Borrar</button>
                    </div>
                </form>
            `;

            confirm = createModal(template);
            confirm.id = 'confirm';

            document.querySelector('#clear').addEventListener('click', e => {
                e.preventDefault();

                this.scores = {};
                this.saveData();
                confirm.removeAttribute('style');
                setTimeout(() => confirm.close(), 300);
                toasty('Se han borrado todas las puntuaciones.');
                if (location.pathname.includes('pages/')) {
                    game.clearScores();
                    game.updateScores();
                }
            });

            document.querySelector('#cancel').addEventListener('click', e => {
                e.preventDefault();

                confirm.removeAttribute('style');
                setTimeout(() => confirm.close(), 300);
            });
        }

        confirm.showModal();
        confirm.style.scale = 1;
        confirm.style.opacity = 1;
    };

    updateAvatar() {
        const playerAvatar = document.querySelectorAll('.avatar--player');
        playerAvatar?.forEach(svg => svg.innerHTML = `<use xlink:href="../images/avatars.svg#${player.avatar}"></use>`);
    };
};

const player = new Player(JSON.parse(localStorage.getItem('player')));
player.avatar ? player.updateAvatar() : player.editData();

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
            const symbol = random.element(this.symbols);

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
    new Game('Batalla naval', 'battleship', 'ships', ['cruiser', 'submarine', 'destroyer']),
    new Game('Buscaminas', 'minesweeper', 'mine', ['mine', 'flag']),
];

// Render navegation

if (!location.pathname.includes('pages/')) { 
    const main = document.querySelector('main');
    const nav = document.querySelector('nav');
    
    games.forEach(game => {
        const card = document.createElement('div');
        const decoTop = document.createElement('div');
        const decoBottom = document.createElement('div');

        card.classList.add('card', game.bkg);
        card.id = game.id;
        card.innerHTML = `
            <a href="${game.path}" class="card__link">
                <h2 class="card__title">${game.name}</h2>
            </a>
        `;
    
        decoTop.classList.add('decorations', 'decorations--top', `decorations--${game.id}`);
        decoBottom.classList.add('decorations', 'decorations--bottom', `decorations--${game.id}`);
    
        game.background(decoTop, 10, 'lg');
        game.background(decoBottom, 10, 'lg');
    
        nav.append(card);
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

    svgs.forEach(svg => svg.addEventListener('click', () => {
        const dropdown = svg.nextElementSibling;
        const closeDropdown = e => {
            e.preventDefault();
            if (!e.target.matches('.dropdown__list')) {
                dropdown.classList.remove('dropdown__list--show');
                window.removeEventListener('click', closeDropdown);
            };
        };

        dropdown.classList.add('dropdown__list--show');
        const items = Array.from(dropdown.children);

        items[0].addEventListener('click', e => {
            e.preventDefault();
            player.editData();
        });

        items[1].addEventListener('click', e => {
            e.preventDefault();
            player.clearScore();
        });

        setTimeout(() =>  window.addEventListener('click', closeDropdown), 50);
    }));
};