const game = {
    boards: document.querySelectorAll('.game__board'),
    shipsContainer: document.querySelector('.game__ships'),
    fleetCells: undefined,
    radarCells: undefined,

    createCells() {
        this.boards.forEach(board => {
            for (let i = 0; i < 100; i++) {
                const div = document.createElement('div');
                div.classList.add('game__cell');
                div.dataset.cell = i;
                board.appendChild(div);
            }
            this.fleetCells = Array.from(document.querySelector('#fleet').children);
            this.radarCells = Array.from(document.querySelector('#radar').children);
        })
    },

    createShips(arr) {
        arr.forEach(ship => {
            this.shipsContainer.appendChild(ship.svg())
        })
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
        svg.classList.add(`game__ship`);
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

game.createCells();
//game.createShips(ships);

//Prueba
ships[0].horizontalCoords(50).forEach((coord, i) => {
    shipCell = game.fleetCells.find(cell => cell.dataset.cell == coord);
    const svg = ships[0].svg();
    svg.style.width = `calc(100% * ${ships[0].size})`;
    svg.style.marginLeft = `calc(${-i} * 100% - 1px)`;
    shipCell.appendChild(svg);
});
ships[2].verticalCoords(15).forEach((coord, i) => {
    shipCell = game.fleetCells.find(cell => cell.dataset.cell == coord);
    const svg = ships[2].svg();
    svg.style.width = `calc(100% * ${ships[2].size})`;
    svg.style.marginLeft = `calc(${-i} * 100% - 1px)`;
    shipCell.appendChild(svg);
    shipCell.style.transform = 'rotate(90deg)'
});