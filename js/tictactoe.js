const input = {
    cells: document.querySelectorAll('.game__cell'),
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

let turn = true;

input.cells.forEach(cell => {
    cell.addEventListener('click', e => {
        const xo = turn ? 'x' : 'o';
        const svg = e.target.children[0];
        svg.classList.add('transition');
        svg.innerHTML = `<use xlink:href="../images/xo.svg#${xo}"></use>`;
        cell.classList.add('disabled');

        positions[xo].push(e.target.id);
        console.log(positions[xo]);

        if(checkWin(positions[xo])) {
            console.log('Game over');
        } else {
            turn = !turn;
        }
    })
});

const checkWin = pos => {
    let checkedArrays = [];
    win.forEach(arr => {
        checkedArrays.push(arr.every(cell => pos.includes(cell)))
    });
    return checkedArrays.includes(true);
}