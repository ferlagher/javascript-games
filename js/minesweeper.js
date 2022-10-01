const game = {
    matrix: Array(10).fill().map(() => Array(10).fill(false)),

    forEachCell(func) {
        this.matrix.forEach(row => {
            row.forEach(el => {
                func(el);
            });
        });
    },

    minesCoords() {
        const numOfMines = document.querySelector('[name="difficulty"]:checked').value;

        for (let i = 0; i < numOfMines; i++) {
            let n, m;

            do {
                [n, m] = [random.integer(10), random.integer(10)];
            } while (this.matrix[n][m]);

            this.matrix[n][m] = true;
        };
    },

    createCells() {
        const board = document.querySelector('.game__board');

        this.minesCoords();

        this.forEachCell(element => {
            const cell = document.createElement('div');
            cell.classList.add('game__cell');
            element && cell.setAttribute('data-mine', '');

            board.append(cell);
        });

        const mineCells = Array.from(document.querySelectorAll('[data-mine]'));

        mineCells.forEach(cell => {
            cell.innerHTML = `
            <svg class="game__svg">
                <use xlink:href="../images/mine.svg#mine"></use>
            </svg>
            `
        });
    },
};