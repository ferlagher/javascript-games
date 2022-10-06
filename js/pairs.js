const game = {
    board: document.querySelector('.game'),
    scores: player?.scores?.pairs || {},
    shuffle: document.querySelector('#shuffle'),
    animals: ['dragon', 'cat', 'kiwi', 'spider', 'horse', 'dog', 'frog', 'bird'],
    moves: document.querySelector('#moves'),
    time: document.querySelector('#time'),
    
    createCards() {
        const pairs = [...this.animals, ...this.animals];

        for (let i = pairs.length -1; i > 0; i--) {
            const j = random.integer(i);
            const k = pairs[i];
            pairs[i] = pairs[j];
            pairs[j] = k;
        };

        pairs.forEach(animal => {
            const card = document.createElement('div');
            card.classList.add('game__card', animal);
            card.innerHTML = `
                <svg class="game__front">
                    <use xlink:href="../images/animals.svg#${animal}"></use>
                </svg>
                <svg class="game__back">
                    <use xlink:href="../images/animals.svg#paw"></use>
                </svg>
            `;

            game.board.appendChild(card);
        });
        
        this.cards = Array.from(document.querySelectorAll('.game__card'));

        this.cards.forEach(card => card.addEventListener('click', flipCard));
    },

    startTimer() {
        interval = setInterval(() => {
            seconds++;

            this.time.innerHTML = formatTime(seconds)
            
            if (seconds === 3599) {
                clearInterval(interval);
            }
        }, 1000);
    },

    updateScores() {
        document.querySelector('#bestMoves').innerHTML = this.scores.moves || 0;
        document.querySelector('#bestTime').innerHTML = formatTime(this.scores.time || 0);
        player.saveScore('pairs', this.scores);
    },

    clearScores() {
        this.scores = {};

        this.moves.innerHTML = '0';
        this.time.innerHTML = '00:00';
    },

    wait() {this.board.classList.toggle('game--disabled')},
};

let flippedCard = '';
let moves = 0;
let seconds = 0;
let interval;

const flipCard = e => {
    const card = e.target;
    game.wait();
    card.classList.add('game__card--flip');
    sound.flipCard.play();
    moves++;
    game.moves.innerHTML = moves;

    if (!interval) {
        game.startTimer();
    };

    if (flippedCard) {
        const animal1 = flippedCard.classList.item(1);
        const animal2 = card.classList.item(1);

        if (animal1 !== animal2) {
            setTimeout(() => {
                flippedCard.classList.remove('game__card--flip');
                card.classList.remove('game__card--flip');
                flippedCard = '';
                game.wait();
            }, 800);
        } else {
            const win = game.cards.every(card => card.classList.contains('game__card--flip'));

            flippedCard = '';
            game.wait();

            if (win) {
                clearInterval(interval);
                interval = null;

                game.cards.forEach((card, i) => {
                    setTimeout(() => {
                        card.classList.add('game__card--animated');
                    }, i * 30);
                });

                const newRecord = (moves < game.scores.moves) || (seconds < game.scores.time);

                newRecord && toasty('¡Nuevo récord!');
                sound.win.play();
                confettiCannons();
                game.scores.moves = Math.min(moves, game.scores.moves) || moves;
                game.scores.time = Math.min(seconds, game.scores.time) || seconds;
                game.updateScores();
            };
        };
    } else {
        flippedCard = card;
        game.wait();
    };
};

const shuffleCards = () => {
    game.wait();
    flippedCard = '';
    moves = 0;
    seconds = 0;
    clearInterval(interval);
    interval = null;
    game.moves.innerHTML = '0';
    game.time.innerHTML = '00:00';

    const win = game.cards.every(card => card.classList.contains('game__card--flip'));
    const delay = win ? 0 : 620;

    game.cards.forEach((card, i) => {
        !win && setTimeout(() => {
            card.classList.add('game__card--flip');
        }, i * 20);
        setTimeout(() => {
            card.classList.remove('game__card--flip', 'game__card--animated');
        }, i * 20 + delay);
    });
    
    sound.shuffleCards.play();
    !win && setTimeout(() => {
        sound.shuffleCards.play();
    }, 620);

    setTimeout(() => {
        game.board.innerHTML = '';
        game.createCards();
        game.wait();
    }, 620 + delay);
}

game.updateScores();

game.createCards();

game.shuffle.addEventListener('click', shuffleCards);