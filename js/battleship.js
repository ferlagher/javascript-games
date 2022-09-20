const game = {
    boards: document.querySelectorAll('.game__board'),
    shipsContainer: document.querySelector('.game__ships'),
    rotate: document.querySelector('#rotate'),
    start: document.querySelector('#start'),
    reset: document.querySelector('#reset'),

    createCells() {
        this.boards.forEach(board => {
            for (let i = 0; i < 100; i++) {
                const div = document.createElement('div');
                div.classList.add('game__cell');
                div.dataset.coord = i;
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
            svg.style.width = `calc(clamp(16px, 3vw, 32px) * ${ship.size})`;
            svg.classList.add(`game__ship`);
            this.shipsContainer.append(svg)
        })
        this.shipList = Array.from(this.shipsContainer.children)
    },
}

class Ship {
    constructor(name, id, size) {
        this.name = name;
        this.id = id;
        this.size = size;
    };

    svg() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.innerHTML = `<use xlink:href="../images/ships.svg#${this.id}"></use>`;
        return svg;
    };
    
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
    };

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
    };

    placeShip(n, board) {
        const coords = isVertical ? this.verticalCoords(n) : this.horizontalCoords(n);
        const validPlace = coords.every(coord => !board[coord].hasAttribute('data-ship') || board[coord].dataset.ship === this.id);
        coords.forEach((coord, i) => {
            const shipCell = board[coord];
            const div = document.createElement('div');
            const svg = this.svg();

            div.classList.add('game__svg');
            div.dataset.temporal = '';
            if (isVertical) {div.style.transform = 'rotate(90deg)'};
            if (!validPlace) {div.classList.add('game__svg--invalid')};
            
            svg.style.width = `calc(100% * ${this.size})`;
            svg.style.marginLeft = `calc(${-i} * 100% - 1px)`;
            
            div.append(svg);
            shipCell.append(div)
        });
    };
};

const ships = [
    new Ship('Portaviones', 'carrier', 5),
    new Ship('Acorazado', 'battleship', 4),
    new Ship('Submarino', 'submarine', 3),
    new Ship('Crucero', 'cruiser', 2),
    new Ship('Destructor', 'destroyer', 2),
];

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

let selectedShip;
let isVertical = false;

game.createCells();
game.createShips(ships);

const selectShip = (id) => {
    if (selectedShip) {
        const previousShip = game.shipList.find(ship => ship.id === selectedShip.id);
        previousShip.classList.remove('game__ship--selected');
        isVertical = false;
    }
    selectedShip = ships.find(ship => ship.id === id);
    game.rotate.removeAttribute('disabled');
}

game.shipList.forEach(ship => {
    ship.addEventListener('click', () => {
        selectShip(ship.id);
        ship.classList.add('game__ship--selected');
    });
});

const mosueLeave = () => {
    document.querySelectorAll('[data-temporal]').forEach(cell => cell.remove());
};

const replaceShip = e => {
    if (!selectedShip) {
        const id = e.target.dataset.ship;
        const cells = game.fleetCells.filter(cell => cell.dataset.ship === id);
        cells.forEach(cell => {
            const child = cell.children[0];
            
            cell.removeAttribute('data-ship');
            child.dataset.temporal = '';
            if (child.hasAttribute('style')) {isVertical = true}

            cell.removeEventListener('click', replaceShip);
            cell.addEventListener('mouseleave', mosueLeave);
            cell.addEventListener('click', setPlace);
        });
        selectShip(id);
        game.start.setAttribute('disabled', '')
    }
}

const setPlace = () => {
    const cells = Array.from(document.querySelectorAll('[data-temporal]'));
    const invalidPlace = cells.some(cell => cell.classList.contains('game__svg--invalid'));
    if (invalidPlace) {
        cells.forEach(cell => {
            cell.classList.add('game__svg--shake');
            setTimeout(() => {
                cell.classList.remove('game__svg--shake');
            }, 500);
        })
    } else {
        cells.forEach(cell => {
            cell.parentElement.dataset.ship = selectedShip.id;
            cell.parentElement.addEventListener('click', replaceShip)
            cell.removeAttribute('data-temporal');
        })
        game.fleetCells.forEach(cell => {
            cell.removeEventListener('mouseleave', mosueLeave);
            cell.removeEventListener('click', setPlace);
        });
        selectedShip = null;
        isVertical = false;
        game.rotate.setAttribute('disabled', '');
        isFleetPlaced = game.shipList.every(ship => ship.classList.contains('game__ship--selected'));
        
        if (isFleetPlaced) {
            game.start.removeAttribute('disabled')
        }
    }
};

const mouseEnter = e => {
    if (selectedShip) {
    coord = parseInt(e.target.dataset.coord);
    selectedShip.placeShip(coord, game.fleetCells);
        e.target.addEventListener('mouseleave', mosueLeave);
        e.target.addEventListener('click', setPlace);
    };
}

const shoot = e => {
    const target = e.target;
    const isShip = target.hasAttribute('data-ship');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('game__effect')
    svg.innerHTML = `<use xlink:href="../images/misc.svg#${isShip ? 'explosion' : 'water'}"></use>`;
    target.append(svg);
    target.dataset.hit= '';
    
    if (isShip) {
        const id = target.dataset.ship;
        const shipCells = game.radarCells.filter(cell => cell.dataset.ship === id);
        const isSunk = shipCells.every(cell => cell.hasAttribute('data-hit'));

        if (isSunk) {
            const shipIndicator = game.shipList.find(ship => ship.id === id);
            shipIndicator.classList.add('game__ship--selected')
            shipCells.forEach(cell => {
                cell.children[0].removeAttribute('data-hidden');
                cell.children[1].remove();
            });
            isFleetSunk = game.shipList.every(ship => ship.classList.contains('game__ship--selected'));

            if (isFleetSunk) {
                console.log('Game Over')
            }
        }
    }
}

game.fleetCells.forEach(cell => cell.addEventListener('mouseenter', mouseEnter));

const placeIaFleet = () => {
    ships.forEach(ship => {
        const emptyCells = game.radarCells.filter(cell => !cell.hasAttribute('data-ship'))
        const emptyCoords = [];
        
        emptyCells.forEach(cell => emptyCoords.push(parseInt(cell.dataset.coord)));
        isVertical = Math.random() < 0.5;
        
        let invalidPlace;
        do {
            const n = Math.floor(Math.random() * emptyCoords.length);
            const coord = emptyCoords[n];
            ship.placeShip(coord, game.radarCells);
            const shipCells = Array.from(document.querySelectorAll('[data-temporal]'));
            invalidPlace = shipCells.some(cell => cell.classList.contains('game__svg--invalid'));
            if (invalidPlace) {
                shipCells.forEach(cell => cell.remove());
            } else {
                shipCells.forEach(cell => {
                    cell.removeAttribute('data-temporal');
                    cell.dataset.hidden = '';
                    cell.parentElement.dataset.ship = ship.id;
                })
            }
            console.log(invalidPlace, ship.id);
        } while (invalidPlace);
    });
    isVertical = false;

    game.radarCells.forEach(cell => cell.addEventListener('click', shoot))
}

game.rotate.addEventListener('click', () => isVertical = !isVertical);

game.start.addEventListener('click', () => {
    changeLayout();
    game.fleetCells.forEach(cell => {
        cell.removeEventListener('mouseenter', mouseEnter);
        cell.removeEventListener('click', replaceShip)
    })
    game.shipList.forEach(ship => ship.classList.remove('game__ship--selected'));
    game.shipsContainer.style.pointerEvents = 'none';
    placeIaFleet();
});

game.reset.addEventListener('click', () => {
    const clearBoard = board => {
        board.forEach(cell => {
            cell.removeAttribute('data-ship');
            cell.removeAttribute('data-hit');
            cell.innerHTML = '';
        })
    }

    changeLayout();
    clearBoard(game.radarCells);
    clearBoard(game.fleetCells);
    game.fleetCells.forEach(cell => cell.addEventListener('mouseenter', mouseEnter))
    game.shipList.forEach(ship => ship.classList.remove('game__ship--selected'));
    game.shipsContainer.removeAttribute('style');
});