const game = {
    boards: document.querySelectorAll('.game__board'),
    chips: document.querySelectorAll('.chip'),
    start: document.querySelector('#start'),
    actions: document.querySelector('#actions'),
    hit: document.querySelector('#hit'),
    double: document.querySelector('#double'),
    stand: document.querySelector('#stand'),
    bet: 0,
    balance: 1000,

    updateBalance() {
        const balance = document.querySelector('#balance');
        const bet = document.querySelector('#bet');

        balance.innerHTML = this.balance;
        bet.innerHTML = this.bet;

        this.chips.forEach(chip => {
            const chipValue = Number(chip.textContent);
            
            chipValue > this.balance && chip.setAttribute('disabled', '');
            chipValue < this.balance && chip.removeAttribute('disabled');
        });

        this.bet > 0 && this.start.removeAttribute('disabled');
        this.bet <= 0 && this.start.setAttribute('disabled', '');
        this.balance >= this.bet && this.double.removeAttribute('disabled');
        this.balance < this.bet && this.double.setAttribute('disabled', '');
    },

    transaction(value) {
        this.balance -= Number(value);
        this.bet += Number(value);
    },
    
    addCard(card, plyr, mod = null) {
        const cardTemplate = document.createElement('div');
        const boardIndex = plyr === 'player' ? 0 : 1;
        let {value, suit} = card;
        
        mod != 'flip' && this[`${plyr}Hand`].push(value)
        this.count(plyr);
        cardTemplate.classList.add('game__card');
        mod && cardTemplate.classList.add(`game__card--${mod}`);
        value = Number(value) || value.split('', 1)[0];
        suit = suit.toLowerCase();
        
        cardTemplate.innerHTML = `
            <div class="game__front">
                <div>
                    <span>${value}</span>
                    <svg class="svg--xs">
                        <use xlink:href="../images/suits.svg#${suit}"></use>
                    </svg>
                </div>
                <svg class="svg--md">
                    <use xlink:href="../images/suits.svg#${suit}"></use>
                </svg>
            </div>
            <svg class="game__back">
                <use xlink:href="../images/suits.svg#back"></use>
            </svg>
        `;

        sound.flipCard.play();
        this.boards[boardIndex].append(cardTemplate);
    },

    firstDeal(cards) {
        this.playerHand = [];
        this.aiHand = [];
        this.flippedCard = cards[1].value;

        cards.forEach((card, i) => {
            const plyr = i % 2 ? 'ai' : 'player';
            const flip = i === 1 ? 'flip' : false;

            setTimeout(() => {;
                this.addCard(card, plyr, flip);
            }, 1000 * i);
        });
    },

    count(plyr, card = null) {
        const score = `${plyr}Score`;
        const ouput = document.querySelector(`#${score}`);
        const hand = [...this[`${plyr}Hand`]];
        card && hand.push(card);
        const aces = hand.filter(value => value === 'ACE');
        
        game[score] = hand.reduce((a, b) => {
            const value = b != 'ACE' ? Number(b) || 10 : 0;

            return a + value;
        }, 0);
        
        if (aces.length) {
            game[score] += aces.length - 1;
            game[score] += game[score] + 11 > 21 ? 1 : 11;
        };

        ouput.innerHTML = game[score];
    }
};

const fetchNjson = async url => {
    return await fetch(url).then(res => res.json());
}

const getDeck = async () => {
    const {deck_id: id, cards} = await fetchNjson('https://deckofcardsapi.com/api/deck/new/draw/?count=4');

    game.deck = id;
    return cards;
};

const drawCards = async (id, n) => {
    const {cards} = await fetchNjson(`https://deckofcardsapi.com/api/deck/${id}/draw/?count=${n}`);

    return cards;
};

const removeChip = e => {
    const chip = e.target.parentElement;
    const value = '-' + chip.textContent;

    game.transaction(value);
    game.updateBalance();
    chip.style.transform = 'translateY(100%)';
    chip.style.opacity = '0';
    setTimeout(() => chip.remove(), 200);
    sound.chip.play();
};

const addChip = e => {
    const betBox = document.querySelector('.game__bet');
    const chip = document.createElement('div');
    const value = e.target.textContent;
    
    chip.classList.add('game__chip');
    chip.innerHTML = `<button class="chip">${value}</button>`;
    betBox.append(chip);
    game.transaction(value);
    game.updateBalance();
    sound.chip.play();

    chip.children[0].addEventListener('click', removeChip);
};

const checkWinner = () => {
    const playerBJ = game.playerScore === 21 && game.playerHand.length === 2;
    const aiBJ = game.aiScore === 21 && game.aiHand.length === 2;
}

const stand = () => {
    const flippedCard = document.querySelector('.game__card--flip');
    game.count('ai', game.flippedCard);

    flippedCard.style.animation = 'none';
    flippedCard.classList.remove('game__card--flip');

    const aiDraw = () => {
        drawCards(game.deck, 1).then(cards => {
            const card = cards[0];

            setTimeout(() => {
                game.addCard(card, 'ai');
                game.count('ai', game.flippedCard);
                game.aiScore < 17 && aiDraw();
            }, 1000);
        }
    )};

    game.aiScore < 17 && aiDraw();
    checkWinner();
};

game.chips.forEach(chip => {
    chip.addEventListener('click', addChip);
});

game.start.addEventListener('click', () => {
    const chips = document.querySelectorAll('.chip');

    chips.forEach(chip => chip.classList.add('chip--pointer-none'));
    game.actions.toggleAttribute('data-disabled');
    game.start.setAttribute('hidden', '');
    game.actions.removeAttribute('data-hidden');
    getDeck().then(cards => {
        game.firstDeal(cards);
        setTimeout(() => {
            game.actions.toggleAttribute('data-disabled');
        }, 3500);
    });
});

game.hit.addEventListener('click', () => {
    game.actions.toggleAttribute('data-disabled');

    drawCards(game.deck, 1).then(cards => {
        const card = cards[0];

        game.addCard(card, 'player');

        setTimeout(() => {
            game.actions.toggleAttribute('data-disabled');
        }, 500);
    });
});

game.double.addEventListener('click', () => {
    const betBox = document.querySelector('.game__bet');
    const currentBet = Array.from(betBox.children);
    
    game.actions.toggleAttribute('data-disabled');
    game.transaction(game.bet);
    game.updateBalance();

    currentBet.forEach((chip, i) => {
        setTimeout(() => betBox.append(chip.cloneNode(true)), 100 * i);
    });

    currentBet.length > 1 ? sound.chips.play() : sound.chip.play();

    drawCards(game.deck, 1).then(cards => {
        const card = cards[0];

        game.addCard(card, 'player', 'double');
    });

    setTimeout(() => {
        stand();
    }, 1000);
});

game.stand.addEventListener('click', stand);