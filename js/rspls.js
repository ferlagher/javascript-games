//Esto es para no tener que comparar todas las jugadas con if/else o switch
const plays = {
    rock: {
        scissors: [true, 'Piedra aplasta tijera'],
        paper: [false, 'Papel envuelve piedra'],
        lizard: [true, 'Piedra aplasta lagarto'],
        spock: [false, 'Spock vaporiza piedra'],
    },
    scissors: {
        rock: [false, 'Piedra aplasta tijera'],
        paper: [true, 'Tijera corta papel'],
        lizard: [true, 'Tijera decapita lagarto'],
        spock: [false, 'Spock rompe tijera'],
    },
    paper: {
        rock: [true, 'Papel envuelve piedra'],
        scissors: [false, 'Tijera corta papel'],
        lizard: [false, 'Lagarto devora papel'],
        spock: [true, 'Papel desautoriza spock'],
    },
    lizard: {
        rock: [false, 'Piedra aplasta lagarto'],
        scissors: [false, 'Tijera decapita lagarto'],
        paper: [true, 'Lagarto devora papel'],
        spock: [true, 'Lagarto envenena spock'],
    },
    spock: {
        rock: [true, 'Spock vaporiza piedra'],
        scissors: [true, 'Spock rompe tijera'],
        paper: [false, 'Papel desautoriza spock'],
        lizard: [false, 'Lagarto envenena spock'],
    },
}

//Botones
const input = [
    document.querySelector('#rock'),
    document.querySelector('#scissors'),
    document.querySelector('#paper'),
    document.querySelector('#lizard'),
    document.querySelector('#spock'),
]

//Actualiza los contadores de la página
const output = {
    playerScore: function() {document.querySelector('#pScore').innerHTML = playerScore},
    iaScore: function() {document.querySelector('#iScore').innerHTML = iaScore},
    message: function(res) {document.querySelector('#message').innerHTML = res},
    choices: function() {
        document.querySelector('#pChoice').setAttribute('xlink:href', `../images/hands.svg#${playerChoice}`);
        document.querySelector('#iChoice').setAttribute('xlink:href', `../images/hands.svg#${iaChoice}`);
        if (playerChoice === iaChoice) {
            document.querySelector('#vs').innerHTML = 'Empate';
        } else {
            document.querySelector('#vs').innerHTML = plays[playerChoice][iaChoice][1];
        }
    },
}

let playerChoice;
let iaChoice;

let playerScore = 0;
let iaScore = 0;

//Funcionalidad de los botones
input.forEach(button => {
    button.addEventListener('click', () => {
        playerChoice = button.id
        iaChoice = Object.keys(plays)[Math.floor(Math.random() * 5)]
        checkWinner()
    })
});

//Revisa quén gana
const checkWinner = () => {
    if (playerChoice === iaChoice) {
        output.choices();
        output.message('Empate');
    } else if (plays[playerChoice][iaChoice][0]) {
        output.choices();
        playerScore++;
        output.playerScore();
        output.message('Tú ganas');
    } else {
        output.choices();
        iaScore++;
        output.iaScore();
        output.message('IA gana')
    }
}