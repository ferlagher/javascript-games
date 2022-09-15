const game = {
    boards: Array.from(document.querySelectorAll('.game__board')),
    shipsContainer: document.querySelector('.game__ships'),
    rotate: document.querySelector('#rotate'),
    start: document.querySelector('#start'),
    reset: document.querySelector('#reset'),

    createCells() {
        this.boards.forEach(board => {
            for (let i = 0; i < 100; i++) {
                const div = document.createElement('div');
                div.classList.add('game__cell');
                div.dataset.cell = i;
                board.append(div);
            }
            this.fleetCells = Array.from(this.boards[0].children);
            this.radarCells = Array.from(this.boards[1].children);
        })
    },

    createShips(arr) {
        arr.forEach(ship => {
            const svg = ship.svg();
            svg.id = ship.id;
            svg.classList.add(`game__ship`);
            svg.style.width = `calc(clamp(16px, 3vw, 32px) * ${ship.size})`;
            this.shipsContainer.append(svg)
        })
        this.ships = Array.from(this.shipsContainer.children)
    }
}

class Ship {
    constructor(name, id, size) {
        this.name = name;
        this.id = id;
        this.use = `<use xlink:href="../images/ships.svg#${id}"></use>`;
        this.size = size;
    }

    svg() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.innerHTML = this.use;
        return svg;
    }
    
    horizontalCoords(n) {
        const coords = [];
        const row = m => Math.floor(m / 10);
        for (let i = 0; i < this.size; i++) {
            const j = i % 2 ? Math.ceil(i / 2) : Math.ceil(-i / 2);
            let coord = n + j;
            if (row(n) < row(coord)) {
                coords.push(coord - this.size);
            } else if (row(n) > row(coord)) {
                coords.push(coord + this.size);
            } else {
                coords.push(coord);
            }
        }
        coords.sort((a, b) => a - b);
        return coords;
    } 

    verticalCoords(n) {
        const coords = [];
        for (let i = 0; i < this.size; i++) {
            const j = i % 2 ? Math.ceil(i / 2) : Math.ceil(-i / 2);
            let coord = n + j * 10;
            if (coord < 0) {
                coords.push(coord + this.size * 10);
            } else if (coord < 100) {
                coords.push(coord);
            } else {
                coords.push(coord - this.size * 10);
            }
        }
        coords.sort((a, b) => a - b);
        return coords;
    } 
}

const ships = [
    new Ship('Portaviones', 'carrier', 5),
    new Ship('Acorazado', 'battleship', 4),
    new Ship('Submarino', 'submarine', 3),
    new Ship('Crucero', 'cruiser', 2),
    new Ship('Destructor', 'destroyer', 2),
]

const changeLayout = () => {
    const layout = document.querySelector('.game');
    const container = document.querySelector('.game__container');
    const fleet = game.boards[0];
    const radar = game.boards[1];
    layout.style.opacity = '0';
    setTimeout(() => {
        fleet.classList.toggle('game__board--small')
        fleet.parentElement === layout ? container.prepend(fleet) : layout.append(fleet);
        radar.toggleAttribute('data-hidden');
        document.querySelectorAll('button').forEach(button => button.toggleAttribute('data-hidden'));
        layout.style.opacity = '1';
    }, 250);
};

game.createCells();
game.createShips(ships);
game.start.addEventListener('click', changeLayout);
game.reset.addEventListener('click', changeLayout);

let x;
let y;

const mouseDown = e => {
    e.preventDefault();
    const handler = ev => mouseMove(ev, e.target);

    x = e.clientX;
    y = e.clientY;

    const mouseMove = (e, ship) => {
        let dx = e.clientX - x;
        let dy = e.clientY - y;
    
        ship.style.transform = `translate(${dx}px, ${dy}px)`
    }
    
    const mouseUp = e => {
        e.target.style.transform = `translate(0, 0)`
        e.target.style.cursor = 'grab'
        window.removeEventListener('mousemove', handler);
    }
    
    e.target.style.cursor = 'grabbing'
    window.addEventListener('mousemove', handler);
    e.target.addEventListener('mouseup', mouseUp)
}

game.ships.forEach(ship => {
    ship.addEventListener('mousedown', mouseDown)
})