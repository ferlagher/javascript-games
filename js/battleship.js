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
            svg.style.width = `calc(clamp(24px, 5vw, 40px) * ${ship.size})`;
            svg.classList.add(`game__ship`);
            this.shipsContainer.append(svg)
        })
        this.shipList = Array.from(this.shipsContainer.children)
    },

    wait() {this.boards[1].classList.toggle('game__board--disabled')}
}

class Ship {
    constructor(name, id, size) {
        this.name = name;
        this.id = id;
        this.size = size;
        this.fleetCells = [];
        this.radarCells = [];
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

let selectedShip;
let isVertical = false;

const randomElement = arr => {
    const n = Math.floor(Math.random() * arr.length);
    return arr[n];
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
    const temporalDivs = Array.from(document.querySelectorAll('[data-temporal]'));
    const invalidPlace = temporalDivs.some(div => div.classList.contains('game__svg--invalid'));
    
    if (invalidPlace) {
        temporalDivs.forEach(div => {
            div.classList.add('game__svg--shake');
            setTimeout(() => {
                div.classList.remove('game__svg--shake');
            }, 500);
        })
    } else {
        temporalDivs.forEach(div => {
            const cell = div.parentElement;
            cell.dataset.ship = selectedShip.id;
            cell.addEventListener('click', replaceShip)
            div.removeAttribute('data-temporal');
            selectedShip.fleetCells.push(cell);
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
            game.start.removeAttribute('disabled');
        }
    }
};

const mosueLeave = () => {
    document.querySelectorAll('[data-temporal]').forEach(cell => cell.remove());
};

const mouseEnter = e => {
    if (selectedShip) {
    coord = parseInt(e.target.dataset.coord);
    selectedShip.placeShip(coord, game.fleetCells);
        e.target.addEventListener('mouseleave', mosueLeave);
        e.target.addEventListener('click', setPlace);
    };
}

const placeIaFleet = () => {
    ships.forEach(ship => {
        const emptyCells = game.radarCells.filter(cell => !cell.hasAttribute('data-ship'))
        const emptyCoords = [];
        let invalidPlace;
        
        emptyCells.forEach(cell => emptyCoords.push(parseInt(cell.dataset.coord)));
        isVertical = Math.random() < 0.5;
        
        do {
            const coord = randomElement(emptyCoords);
            ship.placeShip(coord, game.radarCells);
            const temporalDivs = Array.from(document.querySelectorAll('[data-temporal]'));
            invalidPlace = temporalDivs.some(div => div.classList.contains('game__svg--invalid'));
            if (invalidPlace) {
                temporalDivs.forEach(div => div.remove());
            } else {
                temporalDivs.forEach(div => {
                    const cell = div.parentElement;
                    div.removeAttribute('data-temporal');
                    div.dataset.hidden = '';
                    cell.dataset.ship = ship.id;
                    ship.radarCells.push(cell);
                })
            }
        } while (invalidPlace);
    });
    isVertical = false;
    game.radarCells.forEach(cell => cell.addEventListener('click', playerTurn));
}

const shoot = (target, cells) => {
    const isShip = target.hasAttribute('data-ship');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('game__effect');
    svg.innerHTML = `<use xlink:href="../images/misc.svg#${isShip ? 'explosion' : 'water'}"></use>`;
    target.dataset.hit= '';

    if (!isShip){
        target.append(svg);
    } else {
        if (cells === 'radarCells') {target.append(svg)};

        const targetShip = ships.find(ship => ship.id === target.dataset.ship);
        const isSunk = targetShip[cells].every(cell => cell.hasAttribute('data-hit'));

        if (isSunk) {
            targetShip[cells].forEach(cell => cell.dataset.sunk = '');
            if (cells === 'radarCells') {
                targetShip[cells].forEach(cell => {
                    cell.children[0].removeAttribute('data-hidden');
                    cell.children[1].remove();
                });
            }
            if (ships.every(ship => ship[cells].every(cell => cell.hasAttribute('data-sunk')))) {
                console.log('Game Over');
            }
        };
    }
    game.wait();
}

const iaTurn = () => {
    const validCells = game.fleetCells.filter(cell => !cell.hasAttribute('data-hit'));
    const previousHits = game.fleetCells.filter(cell => cell.hasAttribute('data-ship') && cell.hasAttribute('data-hit') && !cell.hasAttribute('data-sunk'));
    const numberHits = previousHits.length;
    let target;

    const chooseValidCell = coords => {
        const validCoords = coords.filter(coord => 0 <= coord < 100);
        const cells = validCells.filter(cell => validCoords.includes(parseInt(cell.dataset.coord)));
        return randomElement(cells);
    }
    
    const pushRow = (n, m, arr) => {
        if (Math.floor(n / 10) === Math.floor(m / 10)) {arr.push(m)};
    };

    const adjacentCell = n => {
        const coords = [
            n + 10,
            n - 10,
        ];

        pushRow(n, n + 1, coords);
        pushRow(n, n - 1, coords);

        return chooseValidCell(coords);
    }

    const trySunk = () => {
        const parseCoord = cell => parseInt(cell.dataset.coord);

        const firstCoord = parseCoord(previousHits[0]);
        const lastCoord = parseCoord(previousHits[numberHits - 1]);
        const delta = previousHits.reduce((a, b) => parseCoord(b) - a, firstCoord);
        console.log("🚀 ~ file: battleship.js ~ line 286 ~ trySunk ~ delta", delta)
        const coords = [];

        if (delta === 1) {
            pushRow(firstCoord, firstCoord - delta, coords);
            pushRow(lastCoord, lastCoord + delta, coords);
        } else {
            coords.push(firstCoord - delta, lastCoord + delta)
        }

        let cell = chooseValidCell(coords)
        while (!cell) {
            cell ||= adjacentCell((randomElement(previousHits)).dataset.coord);
        }
        return cell
    }
    
    if (numberHits > 1) {
        target = trySunk()
    } else if (numberHits === 1) {
        const n = parseInt(previousHits[0].dataset.coord);
        target = adjacentCell(n);
    } else {
        target = randomElement(validCells);
    }
    
    console.log(target.dataset.coord);

    shoot(target, 'fleetCells');
};

const playerTurn = e => {
    shoot(e.target, 'radarCells');
    iaTurn();
}

const changeLayout = () => {
    const layout = document.querySelector('section');
    const radar = game.boards[1];
    const buttons = document.querySelectorAll('button')
    layout.style.opacity = '0';
    setTimeout(() => {
        radar.toggleAttribute('data-hidden');
        game.shipsContainer.toggleAttribute('data-hidden');
        buttons.forEach(button => button.toggleAttribute('data-hidden'))
        layout.style.opacity = '1';
    }, 250);
};

const selectShip = (id) => {
    if (selectedShip) {
        const previousShip = game.shipList.find(ship => ship.id === selectedShip.id);
        previousShip.classList.remove('game__ship--selected');
        isVertical = false;
    }
    selectedShip = ships.find(ship => ship.id === id);
    game.rotate.removeAttribute('disabled');
}

game.createCells();

game.createShips(ships);

game.shipList.forEach(ship => {
    ship.addEventListener('click', () => {
        selectShip(ship.id);
        ship.classList.add('game__ship--selected');
    });
});

game.fleetCells.forEach(cell => cell.addEventListener('mouseenter', mouseEnter));

game.rotate.addEventListener('click', () => isVertical = !isVertical);

game.start.addEventListener('click', () => {
    game.fleetCells.forEach(cell => {
        cell.removeEventListener('mouseenter', mouseEnter);
        cell.removeEventListener('click', replaceShip)
    })
    game.shipList.forEach(ship => ship.classList.remove('game__ship--selected'));
    game.shipsContainer.style.pointerEvents = 'none';

    placeIaFleet();
    changeLayout();
});

game.reset.addEventListener('click', () => {
    const clearBoard = board => {
        board.forEach(cell => {
            cell.removeAttribute('data-ship');
            cell.removeAttribute('data-hit');
            cell.innerHTML = '';
        })
    }

    clearBoard(game.radarCells);
    clearBoard(game.fleetCells);
    game.fleetCells.forEach(cell => cell.addEventListener('mouseenter', mouseEnter))
    ships.forEach(ship => {
        ship.fleetCells = [];
        ship.radarCells = [];
    })
    game.shipsContainer.removeAttribute('style');
    game.start.setAttribute('disabled', '')

    changeLayout();
});