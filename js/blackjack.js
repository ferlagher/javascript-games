const game = {
    boards: document.querySelectorAll('.game__board'),

    addCard(card, board, isFlipped = false) {
        let {value, suit} = card;
        value = value.split('', 1)[0];
        suit = suit.toLowerCase();

        const cardTemplate = document.createElement('div');
        cardTemplate.classList.add('game__card');
        isFlipped && cardTemplate.classList.add('game__card--flip');
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
        board.append(cardTemplate);
    },

    addChip(value) {
        const betBox = document.querySelector('.game__bet');
        const chip = document.createElement('div');
        
        chip.classList.add('game__chip');
        chip.innerHTML = `<button class="chip">${value}</button>`;

        betBox.append(chip);
    },

    firstDeal(cards) {
        this.playerHand = [];
        this.aiHand = [];

        cards.forEach((card, i) => {
            const boardIndex = i % 2;
            const plyr = boardIndex ? 'ai' : 'player';
            const isFlipped = i === 1;

            this[`${plyr}Hand`].push(card);
            setTimeout(() => {
                this.addCard(card, this.boards[boardIndex], isFlipped);
            }, 1000 * i);
        });
    }
};

// Trying async/await and promises

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

//const addToPile = async (cards, pile) => {
//    codes = cards.map(obj => {
//        const {code} = obj;
//
//        return code;
//    }).join();
//    
//    await fetchNjson(`https://deckofcardsapi.com/api/deck/${game.deck}/pile/${pile}/add/?cards=${codes}`);
//};

getDeck().then(cards => {game.firstDeal(cards)});