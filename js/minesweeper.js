const game = {
    createCells() {
        const board = document.querySelector('.game__board');

        for (let i = 0; i < 100; i++) {
            const cell = document.createElement('div');

            cell.classList.add('game__cell');
            cell.dataset.coord = i;
            board.append(cell);
        };
    },
};

game.createCells();