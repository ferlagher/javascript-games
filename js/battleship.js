const game = {
    boards: document.querySelectorAll('.game__board'),
    cells: undefined,

    createCells () {
        this.boards.forEach(board => {
            for (let i = 0; i < 100; i++) {
                const div = document.createElement('div');
                div.classList.add('game__cell');
                div.dataset.cell = i;
                board.appendChild(div);
            }
            this.cells = Array.from(document.querySelectorAll('[data-cell]'))
        })
    }
}

class Ship {
    constructor(name, id, size) {
        this.name = name;
        this.id = id;
        this.svg = `../images/ships.svg#${id}`;
        this.size = size;
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
        return coords
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
        return coords
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

//Prueba de coordenadas, luego lo borro
ships[0].verticalCoords(99).forEach(coord => {
    shipCell = game.cells.find(cell => cell.dataset.cell == coord);
    shipCell.classList.add('fill')
});

ships[1].horizontalCoords(50).forEach(coord => {
    shipCell = game.cells.find(cell => cell.dataset.cell == coord);
    shipCell.classList.add('fill')
});

ships[2].horizontalCoords(29).forEach(coord => {
    shipCell = game.cells.find(cell => cell.dataset.cell == coord);
    shipCell.classList.add('fill')
});

ships[3].verticalCoords(0).forEach(coord => {
    shipCell = game.cells.find(cell => cell.dataset.cell == coord);
    shipCell.classList.add('fill')
});

ships[4].verticalCoords(75).forEach(coord => {
    shipCell = game.cells.find(cell => cell.dataset.cell == coord);
    shipCell.classList.add('fill')
});