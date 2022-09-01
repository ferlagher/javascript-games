const input = {
    cells: document.querySelectorAll('.game__cell'),
    reset: document.querySelector('#reset'),
    xo: document.querySelector('#xo'),
    vs: document.querySelector('#vs'),

    wait: function() {document.querySelector('.game').classList.add('game--wait')},
    play: function() {document.querySelector('.game').classList.remove('game--wait')},
}

const output = {
    result: function(res) {document.querySelector('#result').innerHTML = res},
    pScore: function() {document.querySelector('#pScore').innerHTML = pScore},
    iScore: function() {document.querySelector('#iScore').innerHTML = iScore},
    pXO: function(pIcon) {document.querySelector('#pXO').setAttribute('xlink:href', `../images/xo.svg#${pIcon}`)},
    iXO: function(iIcon) {document.querySelector('#iXO').setAttribute('xlink:href', `../images/xo.svg#${iIcon}`)},
    iAvatar: function(avatar) {document.querySelector('#iAvatar').setAttribute('xlink:href', `../images/icons.svg#${avatar}`)},
}

const win = [
    //Filas
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    //Columnas
    ['1', '4', '7'],
    ['2', '5', '8'],
    ['3', '6', '9'],
    //Diagonales
    ['1', '5', '9'],
    ['3', '5', '7'],
]

const positions = {
    x: [],
    o: [],
}; 

let vsIA = !input.vs.checked;
let turn = !input.xo.checked;
let xo = 'x';
let delay;

const checkWin = pos => {
    let checkedArrays = [];
    win.forEach(arr => {
        checkedArrays.push(arr.every(cell => pos.includes(cell)));
    });
    return checkedArrays.includes(true);
}

const checkDraw = () => {
    const disabledCells = document.querySelectorAll('.game__cell--disabled');
    return disabledCells.length === 9;
}

const gameOver = () => {
    input.cells.forEach(cell => cell.classList.add('game__cell--disabled'));
}

const markCell = (div) => {
    div.classList.add('game__cell--disabled');
    div.children[0].innerHTML = `<use xlink:href="../images/xo.svg#${xo}"></use>`;
    div.children[0].classList.add('mark');

    positions[xo].push(div.id);

    if(checkWin(positions[xo])) {
        output.result(`${xo} gana`);
        gameOver();
    } else if (checkDraw()) {
        output.result('Empate');
        gameOver();
    } else {
        turn = !turn;
        xo = turn ? 'x' : 'o';
    }
}

const iaMove = () => {
    const corners = ['1', '3', '7', '9'];
    const sides = ['2', '4', '6', '8'];

    const checkForLines = pos => {
        return win.some(arr => {
            const matchingCells = [];
            arr.forEach(cell => {
                if (pos.includes(cell)) {
                    matchingCells.push(cell);
                }
            });
            if (matchingCells.length === 2) {
                return arr.some(cell => {
                    const isEmpty = !document.getElementById(cell).classList.contains('game__cell--disabled')
                    if (!pos.includes(cell) && isEmpty) {
                        markCell(document.getElementById(cell));
                        return true;
                    };
                });
            }
        });
    };

    const checkEmptyCells = (arr) => {
        const emptyCells = [];
        arr.forEach(cell => {
            const isEmpty = !document.getElementById(cell).classList.contains('game__cell--disabled');
            if (isEmpty) {
                emptyCells.push(cell);
            }
        });
        if (emptyCells.length) {
            const n = Math.floor(Math.random() * emptyCells.length);
            markCell(document.getElementById(emptyCells[n]));
            return true;
        }
        return false;
    }

    const checkEmptyCenter = () => {
        const center = document.getElementById('5');
        if (!center.classList.contains('game__cell--disabled')) {
            markCell(center);
            return true;
        }
        return false;
    }

    if (checkForLines(positions[xo])) {
    } else if (checkForLines(positions[xo === 'x' ? 'o' : 'x'])) {
    } else if (checkEmptyCells(corners)) {
    } else if (checkEmptyCenter()) {
    } else {
        checkEmptyCells(sides);
    }

    input.play();
}

const reset = () => {
    input.cells.forEach(cell => {
        cell.classList.remove('game__cell--disabled');
        cell.children[0].classList.remove('mark');
    });
    
    output.result('')

    positions.x = [];
    positions.o = [];

    turn = !input.xo.checked;
    xo = 'x';

    clearTimeout(delay)

    if (vsIA && !turn) {
        input.wait();
        delay = setTimeout(iaMove, 500);
    }
}

input.cells.forEach(cell => {
    cell.addEventListener('mouseenter', () => {
        cell.children[0].innerHTML = `<use xlink:href="../images/xo.svg#${xo}"></use>`;
    });
    cell.addEventListener('click', () => {
        markCell(cell);
        if (vsIA) {
            input.wait();
            delay = setTimeout(iaMove, 500);
        }
    });
});

input.reset.addEventListener('click', reset);
input.vs.addEventListener('change', () => {
    vsIA = !input.vs.checked;
    if (vsIA) {
        input.xo.parentElement.classList.remove('disabled')
        output.iAvatar('ia')
    } else {
        input.xo.checked = false;
        input.xo.parentElement.classList.add('disabled')
        output.iAvatar('player')
    }
    reset();
});
input.xo.addEventListener('change', () => {
    if (input.xo.checked){
        output.pXO('o');
        output.iXO('x');
    } else {
        output.pXO('x');
        output.iXO('o');
    }
    reset();
})