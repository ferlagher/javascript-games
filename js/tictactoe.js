const input = {
    cells: document.querySelectorAll('.game__cell'),
    reset: document.querySelector('#reset'),
    xo: document.querySelector('#xo'),
    vs: document.querySelector('#vs'),

    wait() {document.querySelector('.game').classList.toggle('game--wait')},
}

const output = {
    message(res) {document.querySelector('#message').innerHTML = res},

    updateScores() {
        document.querySelector('#playerScore').innerHTML = pvp ? score.pvp.player1 : score.pva.player;
        document.querySelector('#aiScore').innerHTML = pvp ? score.pvp.player2 : score.pva.ai;
        player.saveScore('tictactoe', score);
    },

    pXO(pIcon) {document.querySelector('#pXO').setAttribute('xlink:href', `../images/xo.svg#${pIcon}`)},

    iXO(iIcon) {document.querySelector('#iXO').setAttribute('xlink:href', `../images/xo.svg#${iIcon}`)},

    aiAvatar(avatar) {
        const svg = document.querySelector('.avatar--ai');

        if (avatar === 'ai'){
            svg.innerHTML = `
                <use xlink:href="../images/ai.svg#computer"></use>
                <use id="aiFace" xlink:href="../images/ai.svg#smile"></use>
            `;
        } else {
            let n;

            do {
                n = Math.floor(Math.random() * 6) + 1;
            } while ('avatar' + n === player.avatar);

            svg.innerHTML = `<use xlink:href="../images/avatars.svg#avatar${n}"></use>`
        };
    },
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

const score = player?.scores?.tictactoe || {
    pva: {
        player: 0,
        ai: 0,
    },

    pvp: {
        player1: 0,
        player2: 0,
    }
}

let pvp = input.vs.checked;
let aiFirst = input.xo.checked;
let xTurn = true;
let xo = 'x';
let delay;

output.updateScores();

const checkWin = pos => {
    const line = win.find(arr => arr.every(cell => pos.includes(cell)));
    if (line) {line.forEach(cell => document.getElementById(cell).classList.add('game__cell--animated'))};
    return line;
};

const checkDraw = () => {
    const disabledCells = document.querySelectorAll('.game__cell--disabled');
    return disabledCells.length === 9;
};

const gameOver = () => {
    input.cells.forEach(cell => cell.classList.add('game__cell--disabled'));
    output.updateScores();
};

const markCell = (cell) => {
    if (typeof(cell) === 'string') {
        cell = document.getElementById(cell);
    }
    cell.classList.add('game__cell--disabled');
    cell.children[0].innerHTML = `<use xlink:href="../images/xo.svg#${xo}"></use>`;
    cell.children[0].classList.add('mark');
    sound.plop.play();

    positions[xo].push(cell.id);

    if(checkWin(positions[xo])) {
        const aiTurn = (xTurn && aiFirst) || (!xTurn && !aiFirst);
        const mssg = pvp ? `${xo} gana` : aiTurn ? 'IA gana' : `${player.name} gana`;
        
        if(pvp) {
            xTurn ? score.pvp.player1++ : score.pvp.player2++;
        } else {
            aiTurn ? score.pva.ai++ : score.pva.player++;
            aiTurn ? ai.changeFace('happy') : ai.changeFace('sad');
            aiTurn ? sound.loose.play() : sound.win.play();
            
        };
        
        output.message(mssg);
        gameOver();
    } else if (checkDraw()) {
        output.message('Empate');
        gameOver();
    } else {
        xTurn = !xTurn;
        xo = xTurn ? 'x' : 'o';
    };
};

const aiMove = () => {
    const corners = ['1', '3', '7', '9'],
        sides = ['2', '4', '6', '8'],
        center = ['5'],
        diagonals = [['1', '9'], ['3', '7']],
        oponent = xo === 'x' ? 'o' : 'x';

    const checkDisabled = cell => document.getElementById(cell).classList.contains('game__cell--disabled');

    const checkForLines = pos => {
        const emptyCells = [];
        
        win.forEach(arr => {
            const matchingCells = arr.filter(cell => pos.includes(cell));
            const emptyCell = arr.find(cell => !checkDisabled(cell));
            
            if (matchingCells.length === 2 && emptyCell) {
                emptyCells.push(emptyCell);
            };
        });

        return emptyCells.length ? emptyCells : null;
    };
    
    const checkEmptyCells = arr => {
        const emptyCells = arr.filter(cell => !checkDisabled(cell));
        return emptyCells.length ? emptyCells : null;
    };
    
    const checkOponent = arr => {
        return positions[oponent].every(pos => arr.includes(pos))
    };
    
    const tryBlock = () => {
        const currentTurn = 1 + positions[xo].length + positions[oponent].length;

        if (currentTurn === 2 && checkOponent(corners)) {
            return ['5'];
        } else if (currentTurn === 4 && diagonals.some(arr => checkOponent(arr))) {
            return checkEmptyCells(sides);
        } else {
            return null
        };
    };

    const cells = checkForLines(positions[xo])
        || checkForLines(positions[oponent])
        || tryBlock()
        || checkEmptyCells(corners)
        || checkEmptyCells(center)
        || checkEmptyCells(sides);

    const n = Math.floor(Math.random() * cells.length);
    markCell(cells[n]);

    input.wait();
};

const reset = () => {
    input.cells.forEach(cell => {
        cell.classList.remove('game__cell--disabled', 'game__cell--animated');
        cell.children[0].classList.remove('mark');
    });
    
    output.message('')

    positions.x = [];
    positions.o = [];

    xTurn = true;
    xo = 'x';

    clearTimeout(delay)

    if (!pvp && aiFirst) {
        input.wait();
        delay = setTimeout(aiMove, 500);
    }

    !pvp && ai.changeFace('smile');
};

input.cells.forEach(cell => {
    cell.addEventListener('mouseenter', () => {
        cell.children[0].innerHTML = `<use xlink:href="../images/xo.svg#${xo}"></use>`;
    });
    cell.addEventListener('click', () => {
        markCell(cell);
        if (!pvp && !checkDraw()) {
            input.wait();
            delay = setTimeout(aiMove, 500);
        }
    });
});

input.reset.addEventListener('click', reset);

input.vs.addEventListener('change', () => {
    pvp = input.vs.checked;

    if (pvp) {
        input.xo.parentElement.setAttribute('disabled', '')
        output.aiAvatar('player')
        input.xo.checked = false;
        aiFirst = input.xo.checked;
        output.pXO('x');
        output.iXO('o');
    } else {       
        input.xo.parentElement.removeAttribute('disabled')
        output.aiAvatar('ai')
        
    }
    
    output.updateScores();
    reset();
});

input.xo.addEventListener('change', () => {
    aiFirst = input.xo.checked;
    if (aiFirst){
        output.pXO('o');
        output.iXO('x');
    } else {
        output.pXO('x');
        output.iXO('o');
    }
    reset();
});