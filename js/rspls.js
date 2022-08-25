//Esto es para no tener que comparar todas las jugadas con if/else o switch
const plays = {
    rock: {
        scissors: true,
        paper: false,
        lizard: true,
        spock: false,
    },
    scissors: {
        rock: false,
        paper: true,
        lizard: true,
        spock: false,
    },
    paper: {
        rock: true,
        scissors: false,
        lizard: false,
        spock: true,
    },
    lizard: {
        rock: false,
        scissors: false,
        paper: true,
        spock: true,
    },
    spock: {
        rock: true,
        scissors: true,
        paper: false,
        lizard: false,
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
    result: function(res) {document.querySelector('#result').innerHTML = res},
    choices: function() {
        document.querySelector('#pChoice').innerHTML = playerChoice
        document.querySelector('#iChoice').innerHTML = iaChoice
    },
}

let playerChoice;
let iaChoice;

let playerScore = 0;
let iaScore = 0;

//Funcionalidad de los botones, es la misma para todos, sólo cambia el id
for (i = 0; i < input.length; i++) {
    const id = input[i].id
    input[i].addEventListener('click', () => {
        playerChoice = id
        iaChoice = Object.keys(plays)[Math.floor(Math.random() * 5)]
        checkWinner()
    })
};

//Revisa quén gana
const checkWinner = () => {
    if (playerChoice === iaChoice) {
        output.choices();
        output.result('Empate');
    }
    else if (plays[playerChoice][iaChoice]) {
        output.choices();
        playerScore++;
        output.playerScore();
        output.result('Tú ganas');
    }
    else {
        output.choices();
        iaScore++;
        output.iaScore();
        output.result('IA gana')
    }
}