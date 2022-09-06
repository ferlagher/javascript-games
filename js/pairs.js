const game = {
    board: document.querySelector('.game'),
    shuffle: document.querySelector('#shuffle'),
    cards: null,

    wait: function () {this.board.classList.toggle('game--wait')},
};

const animals = ['dragon', 'cat', 'kiwi', 'spider', 'horse', 'dog', 'frog', 'bird'];
let flippedCard = '';

//Mezcla los animales usando el algoritmo Fisher–Yates
const shuffledAnimals = () => {
    const pairs = animals.concat(animals);
    for (let i = pairs.length -1; i > 0; i--) {
        const j = Math.floor(Math.random() * i)
        const k = pairs[i]
        pairs[i] = pairs[j]
        pairs[j] = k
    }
    return pairs
};

//Crea las cartas
const placeCards = (arr) => {
    arr.forEach(animal => {
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
        game.cards = document.querySelectorAll('.game__card')

        game.cards.forEach(card => {
            card.addEventListener('click', e =>{
                e.stopImmediatePropagation();
                game.wait();
                card.classList.add('game__card--flip');
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
                        flippedCard = '';
                        game.wait();
                    }
                } else {
                    flippedCard = card;
                    game.wait();
                }
            });
        });
    });
};

//Botón para barajar y reiniciar el juego
game.shuffle.addEventListener('click', () => {
    game.wait();
    flippedCard = '';
    game.cards.forEach(card => {
        card.classList.remove('game__card--flip')
    })
    setTimeout(() => {
        game.board.innerHTML = ''
        placeCards(shuffledAnimals());
        game.wait();
    }, 300);
});

placeCards(shuffledAnimals());


