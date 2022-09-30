import Toastify from 'toastify-js';
import Player from './player';
import Game from './game';
import "toastify-js/src/toastify.css";
import "./style.css";

Toastify({
    text: "Embeces la bida no es como queremos",
    duration: 3000,
    destination: "https://github.com/apvarun/toastify-js",
    newWindow: true,
    close: true,
    gravity: "bottom", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "linear-gradient(to right, #f00, #96c93d)",
    },
    onClick: function(){} // Callback after click
  }).showToast();

////////////////////////////////////////////////////////////////////////////////

const random = {
    integer(n) {
        return Math.floor(Math.random() * n);
    },

    element(arr) {
        return arr[this.integer(arr.length)];
    }
}

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
];

const player = new Player(JSON.parse(localStorage.getItem('player')));
console.log(player);
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