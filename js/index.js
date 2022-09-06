class Game {
    constructor(name, fileName) {
        this.name = name;
        this.path = `./pages/${fileName}.html`
        this.screenshot = `url(./images/${fileName}.png)`
    }
};

const games = [
    new Game('Piedra, papel, tijera, lagarto, spock', 'rspls'),
    new Game('Ta-Te-Ti', 'tictactoe'),
    new Game('Buscar parejas', 'pairs'),
];

const index = document.querySelector('.main--index');

games.forEach(game => {
    const a = document.createElement('a')
    const div = document.createElement('div');
    const h2 = document.createElement('h2');
    
    h2.innerText = game.name;
    div.appendChild(h2);
    a.appendChild(div);
    a.href = game.path;

    div.style.backgroundImage = game.screenshot;

    index.appendChild(a);
})