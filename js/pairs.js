const game = {
    board: document.querySelector('.game'),
    shuffle: document.querySelector('#shuffle'),
    animals: ['dragon', 'cat', 'kiwi', 'spider', 'horse', 'dog', 'frog', 'bird'],
    moves: document.querySelector('#moves'),
    time: document.querySelector('#time'),
    
    createCards() {
        const pairs = [...this.animals, ...this.animals];

        for (let i = pairs.length -1; i > 0; i--) {
            const j = Math.floor(Math.random() * i);
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

    updateCounters() {
        document.querySelector('#bestMoves').innerHTML = score.moves;
        document.querySelector('#bestTime').innerHTML = formatTime(score.time);
        player.saveScore('pairs', score);
    },

    wait() {this.board.classList.toggle('game--wait')},
};

const score = player?.scores?.pairs || {
    moves: 0,
    time: 0,
};

let flippedCard = '';
let moves = 0;
let seconds = 0;
let interval;

const formatTime = sec => {
    let mm = `${Math.floor(sec / 60)}`;
    let ss = `${sec % 60}`;

    mm = mm.padStart(2, '0');
    ss = ss.padStart(2, '0');

    return `${mm}:${ss}`
}

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

                const newRecord = (moves < score.moves) || (seconds < score.time);

                newRecord && toasty('¡Nuevo récord!');

                sound.win.play();
                score.moves = Math.min(moves, score.moves) || moves;
                score.time = Math.min(seconds, score.time) || seconds;
                game.updateCounters();
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

game.updateCounters();

game.createCards();

game.shuffle.addEventListener('click', shuffleCards);