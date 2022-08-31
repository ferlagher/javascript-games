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
let xo = 'x';

input.cells.forEach(cell => {
    const svg = cell.children[0];
    cell.addEventListener('mouseenter', () => {
        svg.innerHTML = `<use xlink:href="../images/xo.svg#${xo}"></use>`;
    });
    cell.addEventListener('click', () => {
        svg.classList.add('mark');
        cell.classList.add('disabled');

        positions[xo].push(cell.id);
        console.log(positions[xo]);

        if(checkWin(positions[xo])) {
            console.log(`${xo} wins`);
        } else if (checkDraw()) {
            console.log('Draw')
        } else {
            turn = !turn;
            xo = turn ? 'x' : 'o';
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

const checkDraw = () => {
    const disabledCells = document.querySelectorAll('.disabled');
    return disabledCells.length === 9;
}