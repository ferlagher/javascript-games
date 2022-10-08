const game = {
    boards: document.querySelectorAll('.game__board'),

    addCard(card, board) {
        let {value, suit} = card;
        value = value.split('', 1)[0];
        suit = suit.toLowerCase();

        const cardTemplate = document.createElement('div');
        cardTemplate.classList.add('game__card');
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

        board.append(cardTemplate);
    },

    addChip(value) {
        const betBox = document.querySelector('.game__bet');
        const chip = document.createElement('div');
        
        chip.classList.add('game__chip');
        chip.innerHTML = `<button class="chip">${value}</button>`;

        betBox.append(chip);
    }
}

// Trying async/await and promises

const getDeck = async () => {
    const res = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle');
    const {deck_id: id, remaining} = await res.json();

    return {id, remaining};
};

const drawCards = async ({id}, n) => {
    const res = await fetch(`https://deckofcardsapi.com/api/deck/${id}/draw/?count=${n}`);
    const {cards} = await res.json();

    return cards;
};

getDeck().then(deck => drawCards(deck, 10)).then(cards => {
    game.addCard(cards[0], game.boards[0])
    game.addCard(cards[2], game.boards[0])
    game.addCard(cards[1], game.boards[1])
    game.addCard(cards[3], game.boards[1])
});

game.addChip(100);
game.addChip(100);
game.addChip(100);