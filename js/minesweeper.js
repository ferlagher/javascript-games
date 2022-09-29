const game = {
    matrix: Array(10).fill().map(() => Array(10).fill(null)),

    forEachCell(func) {
        this.matrix.forEach(row => {
            row.forEach(cell => {
                func(cell);
            });
        });
    },

    createCells() {
        const board = document.querySelector('.game__board');
    },
    
    placeMines() {
        const numOfMines = document.querySelector('[name="difficulty"]:checked').value;
    },
};