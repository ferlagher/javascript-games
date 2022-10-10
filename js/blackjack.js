const game = {
    boards: document.querySelectorAll('.game__board'),
    betBox: document.querySelector('.game__bet'),
    chips: document.querySelectorAll('.chip'),
    start: document.querySelector('#start'),
    reset: document.querySelector('#reset'),
    actions: document.querySelector('#actions'),
    actionsBtn: Array.from(this.actions.children),
    bet: 0,
    balance: player?.scores?.blackjack || 1000,
    
    message(mssg) {
        document.querySelector('#message').innerHTML = mssg;
    },

    updateScores() {
        const balance = document.querySelector('#balance');
        const bet = document.querySelector('#bet');
        const double = this.actionsBtn[1];

        balance.innerHTML = this.balance;
        bet.innerHTML = this.bet;

        this.chips.forEach(chip => {
            const chipValue = Number(chip.textContent);
            
            chipValue > this.balance && chip.setAttribute('disabled', '');
            chipValue <= this.balance && chip.removeAttribute('disabled');
        });

        this.bet > 0 && this.start.removeAttribute('disabled');
        this.bet <= 0 && this.start.setAttribute('disabled', '');
        this.balance >= this.bet && double.removeAttribute('disabled');
        this.balance < this.bet && double.setAttribute('disabled', '');
        player.saveScore('blackjack', this.balance);
    },

    transaction(value) {
        this.balance -= Number(value);
        this.bet += Number(value);
    },

    removeChip(e) {
        const chip = e.target.parentElement;
        const value = '-' + chip.textContent;
        
        this.transaction(value);
        this.updateScores();
        this.animation(chip, '+')
        sound.chip.play();
    },
    
    addChip(e) {
        const chip = document.createElement('div');
        const value = e.target.textContent;
        
        chip.classList.add('game__chip');
        chip.innerHTML = `<button class="chip">${value}</button>`;
        this.betBox.append(chip);
        this.transaction(value);
        this.updateScores();
        sound.chip.play();
    
        chip.children[0].addEventListener('click', e => this.removeChip(e));
    },

    setBet() {
        const chips = document.querySelectorAll('.chip');
    
        chips.forEach(chip => chip.classList.add('chip--pointer-none'));
        this.start.setAttribute('hidden', '');
        this.actions.removeAttribute('data-hidden');
        this.actions.toggleAttribute('data-disabled');

        shuffleDeck().then(cards => {
            this.firstDeal(cards);
            setTimeout(() => {
                this.playerScore === 21
                    ? this.stand()
                    : this.actions.toggleAttribute('data-disabled');
            }, 3500);
        });
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

    count(plyr, card = null) {
        const score = `${plyr}Score`;
        const ouput = document.querySelector(`#${score}`);
        const hand = [...this[`${plyr}Hand`]];
        card && hand.push(card);
        const aces = hand.filter(value => value === 'ACE');
        
        this[score] = hand.reduce((a, b) => {
            const value = b != 'ACE' ? Number(b) || 10 : 0;

            return a + value;
        }, 0);
        
        if (aces.length) {
            this[score] += aces.length - 1;
            this[score] += this[score] + 11 > 21 ? 1 : 11;
        };

        ouput.innerHTML = this[score];
    },

    isBJ(plyr) {
        const handLength = plyr === 'ai' ? 1 : 2;
        const bj = this[`${plyr}Score`] === 21 && this[`${plyr}Hand`].length === handLength;
    
        bj && this.message('¡Black Jack!');
    
        return bj;
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

    hit() {
        this.actionsBtn[1].setAttribute('disabled', '')
        this.actions.toggleAttribute('data-disabled');
    
        drawCards(this.deck, 1).then(cards => {
            const card = cards[0];
    
            this.addCard(card, 'player');
    
            setTimeout(() => {
                this.playerScore > 21 
                    ? this.over('IA')
                    : this.actions.toggleAttribute('data-disabled');
            }, 500);
        });
    },

    double() {
        const currentBet = Array.from(this.betBox.children);
        
        this.actions.toggleAttribute('data-disabled');
        this.transaction(this.bet);
        this.updateScores();
    
        currentBet.forEach((chip, i) => {
            setTimeout(() => this.betBox.append(chip.cloneNode(true)), 100 * i);
        });
    
        currentBet.length > 1 ? sound.chips.play() : sound.chip.play();
    
        drawCards(this.deck, 1).then(cards => {
            const card = cards[0];
    
            this.addCard(card, 'player', 'double');
        });
    
        setTimeout(() => {
            this.playerScore > 21 
                ? this.over('IA')
                : this.stand();
        }, 1000);
    },

    stand() {
        const flippedCard = document.querySelector('.game__card--flip');

        this.actions.setAttribute('data-disabled', '');
        this.count('ai', this.flippedCard);
    
        flippedCard.style.animation = 'none';
        flippedCard.classList.remove('game__card--flip');
    
        if (this.isBJ('player')) {
            this.over(this.isBJ('ai') ? 'Empate' : player.name);
            
            return;
        }
    
        if (this.isBJ('ai')) {
            this.over('IA');
    
            return;
        }
    
        const aiDraw = () => {
            drawCards(this.deck, 1).then(cards => {
                const card = cards[0];
    
                setTimeout(() => {
                    this.addCard(card, 'ai');
                    this.count('ai', this.flippedCard);
                    this.aiScore > 21 
                        ? this.over(player.name)
                        : this.aiScore < 17 
                        ? aiDraw() 
                        : this.over();
                }, 1000);
            }
        )};
    
        this.aiScore < 17 ? aiDraw() : this.over();
    },

    over(winner) {
        winner ||= this.playerScore === this.aiScore
        ? 'Empate'
        : this.playerScore > this.aiScore
        ? player.name
        : 'IA';
        
        const chips = Array.from(this.betBox.children);
        const sign = winner === 'IA' ? '-' : '+';
        const mssg = winner === 'Empate'
            ? winner
            : `${winner} gana`;
            
        this.balance += winner === 'Empate'
            ? this.bet
            : this.isBJ('player')
            ? this.bet * 2.5
            : winner === player.name
            ? this.bet * 2
            : 0;

        
        setTimeout(() => {
            chips.forEach((chip, i) => {
                setTimeout(() => {
                    this.animation(chip, sign);
                }, 100 * (chips.length - i));
            });

            chips.length === 1 ? sound.chip.play() : sound.chips.play();

            if (winner === 'IA') {
                ai.changeFace('happy');
                this.balance === 0 ? sound.loose.play() : sound.bad.play();
            };
            
            if (winner === player.name) {
                ai.changeFace('sad');
                sound.good.play();
                confettiCannons();
            };

            this.bet = 0;
            this.updateScores();
            this.message(mssg);
            this.balance === 0 && toasty('¡No te queda dinero!');
            this.actions.setAttribute('data-hidden', '');
            this.reset.removeAttribute('hidden');
        }, 1000);
    },

    resetGame() {
        const cards = document.querySelectorAll('.game__card');
    
        document.querySelector('#playerScore').innerHTML = 0;
        document.querySelector('#aiScore').innerHTML = 0;
        this.chips.forEach(chip => chip.classList.remove('chip--pointer-none'));
        this.message('');
        this.actions.removeAttribute('data-disabled');
        this.reset.setAttribute('hidden', '');
        this.start.removeAttribute('hidden');
        this.balance ||= 1000;
        this.updateScores();
        ai.changeFace('smile');
    
        cards.forEach((card, i) => {
            setTimeout(() => {
                this.animation(card, '-');
            }, 50 * (cards.length - i));
        });
    
        sound.shuffleCards.play();
    },

    animation(element, sign) {
        element.style.transform = `translateY(${sign}100%)`;
        element.style.opacity = '0';
        setTimeout(() => element.remove(), 200);
    },
};

const fetchNjson = async url => {
    return await fetch(url).then(res => res.json());
}

const shuffleDeck = async () => { 
    game.deck && await fetchNjson(`https://deckofcardsapi.com/api/deck/${game.deck}/shuffle/`);
    const {deck_id: id, cards} = await fetchNjson(`https://deckofcardsapi.com/api/deck/${game.deck || 'new'}/draw/?count=4`);

    game.deck = id;
    return cards;
};

const drawCards = async (id, n) => {
    const {cards} = await fetchNjson(`https://deckofcardsapi.com/api/deck/${id}/draw/?count=${n}`);

    return cards;
};

const [hit, double, stand] = game.actionsBtn;

game.chips.forEach(chip => {
    chip.addEventListener('click', e => game.addChip(e));
});

document.querySelector('#start').addEventListener('click', () => game.setBet());

hit.addEventListener('click', () => game.hit());

double.addEventListener('click', () => game.double());

stand.addEventListener('click', () => game.stand());

game.reset.addEventListener('click', () => game.resetGame());

game.updateScores();