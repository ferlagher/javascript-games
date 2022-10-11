const game = {
    board: document.querySelector('.game'),
    cells: document.querySelectorAll('.game__cell'),
    reset: document.querySelector('#reset'),
    xo: document.querySelector('#xo'),
    vs: document.querySelector('#vs'),
    scores: player?.scores?.tictactoe || {
        pva: {
            player: 0,
            ai: 0,
        },
    
        pvp: {
            player1: 0,
            player2: 0,
        }
    },

    wait() {this.board.classList.toggle('game--disabled')},

    message(res) {document.querySelector('#message').innerHTML = res},

    updateScores() {
        document.querySelector('#playerScore').innerHTML = pvp ? this.scores.pvp.player1 : this.scores.pva.player;
        document.querySelector('#aiScore').innerHTML = pvp ? this.scores.pvp.player2 : this.scores.pva.ai;
        player.saveScore('tictactoe', this.scores);
    },

    clearScores() {
        game.scores.pva.player = 0;
        game.scores.pva.ai = 0;
        game.scores.pvp.player1 = 0;
        game.scores.pvp.player2 = 0;
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
                n = random.integer(6) + 1;
            } while ('avatar' + n === player.avatar);

            svg.innerHTML = `<use xlink:href="../images/avatars.svg#avatar${n}"></use>`
        };
    },
}

const win = [
    //Rows
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    //Columns
    ['1', '4', '7'],
    ['2', '5', '8'],
    ['3', '6', '9'],
    //Diagonals
    ['1', '5', '9'],
    ['3', '5', '7'],
]

const positions = {
    x: [],
    o: [],
}; 

let pvp = game.vs.checked;
let aiFirst = game.xo.checked;
let xTurn = true;
let xo = 'x';
let delay;

game.updateScores();

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
    game.cells.forEach(cell => cell.classList.add('game__cell--disabled'));
    game.updateScores();
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
            xTurn ? game.scores.pvp.player1++ : game.scores.pvp.player2++;
        } else if (aiTurn) {
            game.scores.pva.ai++;
            ai.changeFace('happy');
            sound.loose.play();
        } else {
            game.scores.pva.player++;
            ai.changeFace('sad');
            sound.win.play();
            confettiCannons();
        };
        
        game.message(mssg);
        gameOver();
    } else if (checkDraw()) {
        game.message('Empate');
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
    
    return new Promise(resolve => {
        delay = setTimeout(() => {
            const cells = checkForLines(positions[xo])
            || checkForLines(positions[oponent])
            || tryBlock()
            || checkEmptyCells(corners)
            || checkEmptyCells(center)
            || checkEmptyCells(sides);

        markCell(random.element(cells));

        resolve();
        }, Math.random() * 400 + 600);
    });
};

const reset = () => {
    game.cells.forEach(cell => {
        cell.classList.remove('game__cell--disabled', 'game__cell--animated');
        cell.children[0].classList.remove('mark');
    });

    game.board.classList.remove('game--disabled')
    
    game.message('')

    positions.x = [];
    positions.o = [];

    xTurn = true;
    xo = 'x';

    clearTimeout(delay)

    if (!pvp && aiFirst) {
        game.wait();
        aiMove().then(() => game.wait());
    }

    !pvp && ai.changeFace('smile');
};

game.cells.forEach(cell => {
    cell.addEventListener('mouseenter', () => {
        cell.children[0].innerHTML = `<use xlink:href="../images/xo.svg#${xo}"></use>`;
    });
    cell.addEventListener('click', () => {
        markCell(cell);
        if (!pvp && !checkDraw()) {
            game.wait();
            aiMove().then(() => game.wait());
        }
    });
});

game.reset.addEventListener('click', reset);

game.vs.addEventListener('change', () => {
    pvp = game.vs.checked;

    if (pvp) {
        game.xo.parentElement.setAttribute('disabled', '')
        game.aiAvatar('player')
        game.xo.checked = false;
        aiFirst = game.xo.checked;
        game.pXO('x');
        game.iXO('o');
    } else {       
        game.xo.parentElement.removeAttribute('disabled')
        game.aiAvatar('ai')
    }
    
    game.updateScores();
    reset();
});

game.xo.addEventListener('change', () => {
    aiFirst = game.xo.checked;
    if (aiFirst){
        game.pXO('o');
        game.iXO('x');
    } else {
        game.pXO('x');
        game.iXO('o');
    }
    reset();
});