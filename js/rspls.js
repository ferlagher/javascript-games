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
};

const game = {
    buttons: Array.from(document.querySelector('.game').children),
    switch: document.querySelector('#version'),
    moves: 5,
    svgs: {
        player: document.querySelector('#playerHand'),
        ai: document.querySelector('#aiHand'),
    },

    updateScores() {
        document.querySelector('#playerScore').innerHTML = score.player;
        document.querySelector('#aiScore').innerHTML = score.ai;
        player.saveScore('rspls', score);
    },

    showResult(winner) {
        const result = !winner ? 'Empate' : winner === 'player' ? `${player.name} gana` : 'IA gana';
        const mssg = winner ? plays[hand.player][hand.ai][1] : 'Empate' ;

        document.querySelector('#message').innerHTML = result;
        document.querySelector('#vs').innerHTML = mssg;

        for (let plyr in this.svgs) {
            this.svgs[plyr].setAttribute('xlink:href', `../images/hands.svg#${hand[plyr]}`);
            this.svgs[plyr].parentElement.classList.remove('winner', 'looser');
        };

        if (winner) {
            const looser = winner === 'player' ? 'ai' : 'player';

            score[winner]++
            this.updateScores();

            setTimeout(() => {
                this.svgs[winner].parentElement.classList.add('winner');
                this.svgs[looser].parentElement.classList.add('looser');
            }, 1);
        };
    },
};

const score = player?.scores?.rspls || {
    player: 0,
    ai: 0
};

game.updateScores();

const hand = {
    player: null,
    ai: null,
};

const checkWinner = () => {
    if (hand.player === hand.ai) {
        ai.changeFace('smile');
        game.showResult();
    } else {
        const isPlayerWinner = plays[hand.player][hand.ai][0];
        const winner = isPlayerWinner ? 'player' : 'ai';

        isPlayerWinner ? ai.changeFace('sad') : ai.changeFace('happy'); 
        isPlayerWinner ? sound.bad.play() : sound.good.play(); 
        game.showResult(winner);
    };
};

game.buttons.forEach(button => {
    button.addEventListener('click', () => {
        hand.player = button.id;
        hand.ai = Object.keys(plays)[random.integer(game.moves)];
        checkWinner();
    });
});

game.switch.addEventListener('change', () => {
    const layout = document.querySelector('section');
    layout.style.opacity = 0;
    
    setTimeout(() => {
        if (game.switch.checked) {
            game.moves = 3;
            game.buttons[3].style.display = 'none';
            game.buttons[4].style.display = 'none';
        } else {
            game.moves = 5;
            game.buttons[3].removeAttribute('style');
            game.buttons[4].removeAttribute('style');
        };

        for (let plyr in game.svgs) {
            game.svgs[plyr].setAttribute('xlink:href', '');
            game.svgs[plyr].parentElement.classList.remove('winner');
        };
        
        document.querySelector('#message').innerHTML = '';
        document.querySelector('#vs').innerHTML = '';
        ai.changeFace('smile')
        layout.removeAttribute('style');
    }, 250);
})