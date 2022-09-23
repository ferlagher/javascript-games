const game = {
    boards: document.querySelectorAll('.game__board'),
    shipsContainer: document.querySelector('.game__ships'),
    rotate: document.querySelector('#rotate'),
    start: document.querySelector('#start'),
    reset: document.querySelector('#reset'),
    
    pScore() {document.querySelector('#pScore').innerHTML = pScore},
    
    iScore() {document.querySelector('#iScore').innerHTML = iScore},
    
    message(mssg) {document.querySelector('#message').innerHTML = mssg},

    createCells() {
        this.boards.forEach(board => {
            for (let i = 0; i < 100; i++) {
                const div = document.createElement('div');
                div.classList.add('game__cell');
                div.dataset.coord = i;
                board.append(div);
            };
        });

        this.fleetCells = Array.from(this.boards[0].children);
        this.radarCells = Array.from(this.boards[1].children);
    },

    createShips(arr) {
        arr.forEach(ship => {
            const svg = ship.svg();
            svg.id = ship.id;
            svg.style.width = `calc(clamp(24px, 5vw, 40px) * ${ship.size})`;
            svg.classList.add(`game__ship`);
            this.shipsContainer.append(svg);
        });

        this.shipList = Array.from(this.shipsContainer.children);
    },

    wait() {
        this.boards[1].classList.toggle('game__board--disabled');
    },
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
            };
        };

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
            };
        };

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

            if (isVertical) {
                div.style.transform = 'rotate(90deg)';
            };
            if (!validPlace) {
                div.classList.add('game__svg--invalid');
            };

            svg.style.width = `calc(100% * ${this.size})`;
            svg.style.marginLeft = `calc(${-i} * 100% - 1px)`;

            div.append(svg);
            shipCell.append(div);
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
let iaMemory = {};
let pScore = 0;
let iScore = 0;
let delay;

const randomElement = arr => {
    const n = Math.floor(Math.random() * arr.length);
    return arr[n];
};

const replaceShip = e => {
    if (!selectedShip) {
        const ship = ships.find(ship => ship.id === e.target.dataset.ship)

        ship.fleetCells.forEach(cell => {
            const child = cell.children[0];

            cell.removeAttribute('data-ship');
            child.dataset.temporal = '';

            if (child.hasAttribute('style')) {
                isVertical = true;
            };

            cell.removeEventListener('click', replaceShip);
            cell.addEventListener('mouseleave', mosueLeave);
            cell.addEventListener('click', setPlace);
        });

        game.start.setAttribute('disabled', '');
        ship.fleetCells = [];
        selectShip(ship.id);
    };
};

const setPlace = () => {
    const temporalDivs = Array.from(document.querySelectorAll('[data-temporal]'));
    const invalidPlace = temporalDivs.some(div => div.classList.contains('game__svg--invalid'));

    if (invalidPlace) {
        temporalDivs.forEach(div => {
            div.classList.add('game__svg--shake');
            setTimeout(() => {
                div.classList.remove('game__svg--shake');
            }, 500);
        });
    } else {
        temporalDivs.forEach(div => {
            const cell = div.parentElement;

            cell.dataset.ship = selectedShip.id;
            cell.addEventListener('click', replaceShip);
            div.removeAttribute('data-temporal');
            selectedShip.fleetCells.push(cell);
        });

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
        };
    };
};

const mosueLeave = () => {
    document.querySelectorAll('[data-temporal]').forEach(cell => cell.remove());
};

const mouseEnter = e => {
    if (selectedShip) {
        const coord = parseInt(e.target.dataset.coord);

        selectedShip.placeShip(coord, game.fleetCells);
        e.target.addEventListener('mouseleave', mosueLeave);
        e.target.addEventListener('click', setPlace);
    };
};

const placeIaFleet = () => {
    ships.forEach(ship => {
        const emptyCells = game.radarCells.filter(cell => !cell.hasAttribute('data-ship'));
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
                game.message('Posición inválida');
            } else {
                temporalDivs.forEach(div => {
                    const cell = div.parentElement;

                    div.removeAttribute('data-temporal');
                    div.dataset.hidden = '';
                    cell.dataset.ship = ship.id;
                    ship.radarCells.push(cell);
                    game.message('');
                });
            };
        } while (invalidPlace);
    });

    isVertical = false;
    game.radarCells.forEach(cell => cell.addEventListener('click', playerTurn));
};

const shoot = (target, cells) => {
    const isShip = target.hasAttribute('data-ship');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let message;

    svg.classList.add('game__effect');
    svg.innerHTML = `<use xlink:href="../images/misc.svg#${isShip ? 'explosion' : 'water'}"></use>`;
    target.dataset.hit = '';

    if (!isShip) {
        target.append(svg);
        message = 'Agua';
    } else {
        const targetShip = ships.find(ship => ship.id === target.dataset.ship);
        const isSunk = targetShip[cells].every(cell => cell.hasAttribute('data-hit'));
        const isPlayerTurn = cells === 'radarCells';

        message = 'Tocado';

        if (isPlayerTurn) {
            target.append(svg);
        };

        if (isSunk) {
            targetShip[cells].forEach(cell => cell.dataset.sunk = '');
            message = `¡${targetShip.name} hundido!`;

            if (isPlayerTurn) {
                targetShip[cells].forEach(cell => {
                    cell.children[0].removeAttribute('data-hidden');
                    cell.children[1].remove();
                });
            } else {
                iaMemory = {};
            };

            if (ships.every(ship => ship[cells].every(cell => cell.hasAttribute('data-sunk')))) {
                if (isPlayerTurn) {
                    pScore++;

                    game.pScore();
                    game.message('Tú ganas');
                } else {
                    iScore++

                    game.iScore();
                    game.message('IA gana');
                };

                clearTimeout(delay);
                game.boards.forEach(board => board.classList.add('game__board--disabled'));

                return
            };
        };
    };
    
    game.message(message);
    game.wait();
};

const iaTurn = () => {
    const validCells = game.fleetCells.filter(cell => !cell.hasAttribute('data-hit'));
    const previousHits = game.fleetCells.filter(cell => cell.hasAttribute('data-ship') && cell.hasAttribute('data-hit') && !cell.hasAttribute('data-sunk'));
    const numberHits = previousHits.length;
    let target;

    const chooseValidCell = coords => {
        const cells = validCells.filter(cell => coords.includes(parseInt(cell.dataset.coord)));
        return randomElement(cells);
    };

    const pushRow = (n, m, arr) => {
        const isShip = game.fleetCells[n].hasAttribute('data-ship');
        const isOnRow = Math.floor(n / 10) === Math.floor(m / 10);
        
        if (isShip & isOnRow) {
            arr.push(m);
        };
    };

    const pushCol = (n, m, arr) => {
        const isShip = game.fleetCells[n].hasAttribute('data-ship');
        const isOnBoard = 0 <= m < 100;
        
        if (isShip & isOnBoard) {
            arr.push(m);
        };
    };

    const adjacentCell = n => {
        const coords = [];

        pushRow(n, n + 1, coords);
        pushRow(n, n - 1, coords);
        pushCol(n, n + 10, coords);
        pushCol(n, n - 10, coords);

        return chooseValidCell(coords);
    };

    const hitCoord = i => parseInt(previousHits[i].dataset.coord);

    const trySunk = ({
        firstCoord = hitCoord(0),
        lastCoord = hitCoord(numberHits - 1),
        delta = hitCoord(1) - firstCoord,
    }) => {
        const coords = [];

        if (delta === 1) {
            pushRow(firstCoord, firstCoord - delta, coords);
            pushRow(lastCoord, lastCoord + delta, coords);
        } else if (delta === 10) {
            pushCol(firstCoord, firstCoord - delta, coords);
            pushCol(lastCoord, lastCoord + delta, coords);
        };

        let cell = chooseValidCell(coords);
        let cellCoord = cell ? cell.dataset.coord : null;

        if (cell && cell.hasAttribute('data-ship')) {
            iaMemory.firstCoord = Math.min(cellCoord, firstCoord);
            iaMemory.lastCoord = Math.max(cellCoord, lastCoord);
            iaMemory.delta = delta;
        };

        while (!cell) {
            const randomHitCoord = parseInt(randomElement(previousHits).dataset.coord);

            cell = adjacentCell(randomHitCoord);

            if (cell) {
                cellCoord = cell.dataset.coord;

                iaMemory.firstCoord = Math.min(cellCoord, randomHitCoord);
                iaMemory.lastCoord = Math.max(cellCoord, randomHitCoord);
                iaMemory.delta = iaMemory.lastCoord - iaMemory.firstCoord;
            };
        };

        return cell;
    };

    if (numberHits > 1) {
        target = trySunk(iaMemory);
    } else if (numberHits === 1) {
        const n = parseInt(previousHits[0].dataset.coord);
        target = adjacentCell(n);
    } else {
        target = randomElement(validCells);
    };

    shoot(target, 'fleetCells');
};

const playerTurn = e => {
    delay = setTimeout(iaTurn, 1000);
    shoot(e.target, 'radarCells');
};

const selectShip = (id) => {
    if (selectedShip) {
        const previousShip = game.shipList.find(ship => ship.id === selectedShip.id);
        previousShip.classList.remove('game__ship--selected');
        isVertical = false;
    };
    
    selectedShip = ships.find(ship => ship.id === id);
    game.rotate.removeAttribute('disabled');
};

const changeLayout = () => {
    const layout = document.querySelector('section');
    const radar = game.boards[1];
    const buttons = Array.from(document.querySelector('.options').children);
    
    layout.style.opacity = '0';

    setTimeout(() => {
        radar.toggleAttribute('data-hidden');
        game.shipsContainer.toggleAttribute('data-hidden');
        buttons.forEach(button => button.toggleAttribute('data-hidden'));
        layout.style.opacity = '1';
    }, 250);
};

const start = () => {
    game.fleetCells.forEach(cell => {
        cell.removeEventListener('mouseenter', mouseEnter);
        cell.removeEventListener('click', replaceShip);
    });

    game.shipList.forEach(ship => ship.classList.remove('game__ship--selected'));
    game.shipsContainer.style.pointerEvents = 'none';
    placeIaFleet();
    changeLayout();
};

const reset = () => {
    clearTimeout(delay);

    const clearBoard = board => {
        board.forEach(cell => {
            cell.removeAttribute('data-ship');
            cell.removeAttribute('data-hit');
            cell.removeAttribute('data-sunk');
            cell.innerHTML = '';
        });
    };

    clearBoard(game.radarCells);
    clearBoard(game.fleetCells);
    
    ships.forEach(ship => {
        ship.fleetCells = [];
        ship.radarCells = [];
    });
    
    game.shipsContainer.removeAttribute('style');
    game.start.setAttribute('disabled', '')
    game.message('')
    game.boards.forEach(board => board.classList.remove('game__board--disabled'));
    game.fleetCells.forEach(cell => cell.addEventListener('mouseenter', mouseEnter));
    
    changeLayout();
};

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

game.start.addEventListener('click', start);

game.reset.addEventListener('click', reset);