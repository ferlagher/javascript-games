//const template = `
//    <div class="game__card">
//    <div>
//        <span>${value}</span>
//        <svg class="svg--xs">
//            <use xlink:href="../images/suits.svg#${suit}"></use>
//        </svg>
//    </div>
//    <svg class="svg--md">
//        <use xlink:href="../images/suits.svg#${suit}"></use>
//    </svg>
//    </div>
//`

// Trying async/await and promises

let deck;

const getDeck = async () => {
    const res = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle');
    const {deck_id: id, remaining} = await res.json();

    deck = {id, remaining};

        console.log(deck);
};

const drawCards = async ({id}, n) => {
    const res = await fetch(`https://deckofcardsapi.com/api/deck/${id}/draw/?count=${n}`);
    const {cards} = await res.json();

        console.log(cards);
}

getDeck().then(() => drawCards(deck, 2));