const game = {
    boards: document.querySelectorAll('.game__board'),

    createCells () {
        this.boards.forEach(board => {
            for (let i = 0; i < 100; i++) {
                const div = document.createElement('div');
                div.classList.add('game__cell');
                board.appendChild(div);
            }
        })
    }
}

class Ship {
    constructor(name, id, size) {
        this.name = name;
        this.id = id;
        this.svg = `../images/ships.svg#${id}`;
        this.size = size;
    }

    horizontalCoords(n) {
        const coords = [];
        for (let i = 0; i < this.size; i++) {
            coords.push(n + i)
            return coords
        }    
    } 

    verticalCoords(n) {
        const coords = [];
        for (let i = 0; i < this.size; i++) {
            coords.push(n + i * 10)
            return coords
        }
    } 
}