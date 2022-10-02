const game = {
    board: document.querySelector('.game__board'),
    time: document.querySelector('#time'),
    minesLeft: document.querySelector('#minesLeft'),
    matrix: Array(10).fill().map(() => Array(10).fill().map(() => document.createElement('div'))),
    seconds: 0,
    score: player.scores.minesweeper || {},

    updateCounters() {
        ['easy', 'medium', 'hard'].forEach(difficulty => {
            document.querySelector(`#${difficulty}Time`).innerHTML = formatTime(this.score[difficulty] || 0);
        });
        player.saveScore('minesweeper', this.score);
    },

    wait() {
        this.board.classList.toggle('game__board--disabled');
    },

    forEachCell(func) {
        this.matrix.forEach((row, n)=> {
            row.forEach((cell, m) => {
                func({cell, n, m});
            });
        });
    },

    adjacentCells(n, m, func) {
        for (let i = n - 1; i <= n + 1; i++) {
            if (i < 0 || i >= 10) continue;  
            for (let j = m - 1; j <= m + 1; j++) {
                if (j < 0 || j >= 10) continue;  
                const cell = this.matrix[i][j];
                func({cell, i, j})
            };
        };
    },

    placeMines() {
        this.numOfMines = parseInt(document.querySelector('[name="difficulty"]:checked').value);
        this.minesLeft.innerHTML = this.numOfMines;

        this.forEachCell(({cell}) => {
            cell.removeAttribute('data-mine');
            cell.classList.remove('game__cell--show');
            cell.classList.remove('game__cell--inverted');
            cell.innerHTML = '';
        });

        for (let i = 0; i < this.numOfMines; i++) {
            let n, m;

            do {
                [n, m] = [random.integer(10), random.integer(10)];
            } while (this.matrix[n][m].hasAttribute('data-mine'));

            this.matrix[n][m].dataset.mine = '';
        };

        this.mineCells = Array.from(document.querySelectorAll('[data-mine]'));

        this.mineCells.forEach(cell => {
            
        });
    },

    revealCells(div, n, m) {
        div.classList.add('game__cell--show');
        div.classList.remove('game__cell--inverted');
        
        if (div.hasAttribute('data-mine')) {
            sound.explosion.play();
            clearInterval(this.interval);
            this.wait();

            const revealBoard = (cell, a, b) => {
                cell.dataset.stop = '';

                setTimeout(() => cell.removeAttribute('data-stop'), 200);                    

                setTimeout(() => {
                    this.adjacentCells(a, b, ({cell, i, j}) => {
                        !cell.hasAttribute('data-stop') && revealBoard(cell, i, j);
                    })
                }, 50);
                
                if (cell.hasAttribute('data-mine')) {
                    cell.classList.add('game__cell--show');
                    cell.classList.remove('game__cell--inverted');
                    cell.innerHTML = `
                        <svg class="game__svg">
                            <use xlink:href="../images/mine.svg#mine"></use>
                        </svg>
                        `;
                };
            };

            setTimeout(() => sound.loose.play(), 500);
            revealBoard(div, n, m);
        } else {
            let adjacentMines = 0;
            this.adjacentCells(n, m, ({cell}) => cell.hasAttribute('data-mine') && adjacentMines++);
            
            adjacentMines 
                ? div.innerHTML = adjacentMines 
                : setTimeout(() => {
                    this.adjacentCells(n, m, ({cell, i, j}) => {
                        const validCell = !cell.classList.contains('game__cell--show') && !cell.classList.contains('game__cell--inverted')
                        validCell && this.revealCells(cell, i, j)
                    })
                }, 50);

            const emptyCells = Array.from(document.querySelectorAll('.game__cell--show'));

            if (emptyCells.length === 100 - this.numOfMines && this.mineCells.every(cell => !cell.classList.contains('game__cell--show'))) {
                this.win();
            };
        };
    },

    createCells() {
        this.forEachCell(({cell, n, m}) => {
            cell.classList.add('game__cell');
            this.board.append(cell);
            
            
            cell.addEventListener('contextmenu', e => {
                e.preventDefault();
                const div = e.target;
                let minesLeft = parseInt(this.minesLeft.innerHTML)
                
                if (div.classList.contains('game__cell--inverted')) {
                    div.innerHTML = '';
                    minesLeft++;
                } else {
                    div.innerHTML = `
                    <svg class="game__svg">
                    <use xlink:href="../images/mine.svg#flag"></use>
                    </svg>
                    `;
                    sound.plop.play();
                    minesLeft--;
                    !this.interval && this.startTimer();
                };
                
                this.minesLeft.innerHTML = minesLeft;
                div.classList.toggle('game__cell--inverted') 
                
                const remainingMines = this.mineCells.filter(cell => !cell.classList.contains('game__cell--inverted'));

                if (!remainingMines.length && !minesLeft) {
                    this.win();
                };
            });
            
            cell.addEventListener('click', e => {
                !this.interval && this.startTimer();
                this.revealCells(e.target, n, m);
            });
        });
        
        this.placeMines();
    },

    startTimer() {
        this.interval = setInterval(() => {
            this.seconds++;

            this.time.innerHTML = formatTime(this.seconds);
            
            if (this.seconds === 3599) {
                clearInterval(interval);
            }
        }, 1000);
    },

    reset() {
        clearInterval(this.interval);
        this.interval = null;
        this.seconds = 0;
        this.time.innerHTML = '00:00'
        this.placeMines();
        this.board.classList.remove('game__board--disabled');
    },

    win() {
        sound.win.play();
        clearInterval(this.interval);
        this.wait();

        const difficulty = this.numOfMines === 10 ? 'easy' :
        this.numOfMines === 15 ? 'medium' : 'hard';

        this.seconds < this.score[difficulty] && toasty('¡Nuevo récord!');
        this.score[difficulty] = Math.min(this.seconds, this.score[difficulty]) || this.seconds;
        this.updateCounters();
    }
};

game.updateCounters();
game.createCells();

document.querySelector('#reset').addEventListener('click', () => {
    game.reset();
});

document.querySelector('.radio-group').addEventListener('change', () => {
    game.reset();
});

window.addEventListener('contextmenu', e => e.preventDefault());