const CARDS_TO_DRAW = 2;
let playerCard;
let computerCard;
let round = 1;

const cardSequence = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  JACK: 11,
  QUEEN: 12,
  KING: 13,
  ACE: 14,
};

const buttonDeck = document.getElementById("btn-new-deck");
const playerCardDiv = document.getElementById("card-player");
const computerCardDiv = document.getElementById("card-computer");
const playerScore = document.querySelector("#player-score span");
const computerScore = document.querySelector("#computer-score span");
const roundMessage = document.getElementById("main-round-winner");
const remainingCards = document.getElementById("remaining-cards");
const buttonDeckText = document.getElementById("span-deck-text");

// but default the draw button should be disabled until the deck of cards has been acquired
const buttonDraw = document.getElementById("btn-draw-cards");
buttonDraw.disabled = true;

// the deck id comes from an api call and will not be available when the program first runs
let deckId = "";
buttonDeck.addEventListener("click", (event) => {
  getDeck();

  // current target will focus on the element that caused the event and not the child.
  event.currentTarget.blur();
});

buttonDraw.addEventListener("click", (event) => {
  event.currentTarget.blur();
  drawCards(deckId, CARDS_TO_DRAW);
});

function getDeck() {
  fetch("https://apis.scrimba.com/deckofcards/api/deck/new/shuffle/")
    .then((res) => res.json())
    .then((data) => {
      deckId = data.deck_id;

      // now that the deck is available for usage, the draw button should be enabled
      buttonDraw.disabled = false;
    });

  updateButtonText(buttonDeck, "Shuffle");
}

function drawCards(id = deckId, cardAmount = CARDS_TO_DRAW) {
  fetch(
    `https://apis.scrimba.com/deckofcards/api/deck/${deckId}/draw/?count=${CARDS_TO_DRAW}`
  )
    .then((res) => res.json())
    .then((data) => {
      playerCard = createCardObj(data.cards[0]);
      computerCard = createCardObj(data.cards[1]);

      // Player should not be able to press the draw button until the next round begins and the score is displayed
      buttonDraw.disabled = true;

      updateDeckCountHtml(CARDS_TO_DRAW);

      createCardHtml(
        playerCardDiv,
        playerCard.cardImage,
        `${playerCard.cardValue} of ${playerCard.cardSuit}`
      );

      createCardHtml(
        computerCardDiv,
        computerCard.cardImage,
        `${computerCard.cardValue} of ${computerCard.cardSuit}`
      );

      setTimeout(() => {
        const score = getHigherScore(playerCard, computerCard);

        if (round === 1) {
          roundWinnerAnimationOnce();
        } else {
          roundWinnerAnimation(score);
        }
      }, 400);
    });
}

function createCardObj(obj) {
  return {
    cardCode: obj.code,
    cardImage: obj.images.png,
    cardSuit: obj.suit,
    cardValue: obj.value,
  };
}

function createCardHtml(parent, src, alt) {
  parent.innerHTML = "";
  const imgElem = createElement("img");
  imgElem.setAttribute("src", src);
  imgElem.setAttribute("alt", alt);
  parent.style.border = "none";
  parent.appendChild(imgElem);
}

function createElement(type) {
  return document.createElement(type);
}

function getHigherScore(card1, card2) {
  let playerCardValue = cardSequence[card1.cardValue];
  let computerCardValue = cardSequence[card2.cardValue];

  if (playerCardValue === computerCardValue) {
    return -1;
  }

  return playerCardValue > computerCardValue;
}

function roundWinnerAnimationOnce(score) {
  roundMessage.classList.remove("main-round-winner-initial");
  roundMessage.classList.add("main-round-winner-show");

  updateScore(score);
}

function roundWinnerAnimation(score) {
  roundMessage.classList.remove("main-round-winner-show");
  roundMessage.classList.add("main-round-winner-hide");
  roundMessage.addEventListener(
    "animationend",
    () => {
      roundMessage.classList.add("main-round-winner-show");

      updateScore(score);
    },
    { once: true }
  );
}

function updateScore(score) {
  if (score === -1) {
    roundMessage.textContent = "It's a tie!";
  } else if (score) {
    scoreAnimation(playerScore, roundMessage, "You win this round!");
  } else {
    scoreAnimation(computerScore, roundMessage, "You lose this round :(");
  }

  setTimeout(() => {
    round++;
    buttonDraw.disabled = false;
  }, 1500);
}

function scoreAnimation(player, messageElem, message) {
  player.classList.remove("span-score-show");
  player.classList.add("span-score-hide");
  player.addEventListener(
    "animationend",
    () => {
      player.classList.add("span-score-show");
      messageElem.textContent = message;
      player.textContent = +player.textContent + 1;
    },
    { once: true }
  );
}

function updateDeckCountHtml(numCardsDrawn) {
  remainingCards.textContent = +remainingCards.textContent - numCardsDrawn;
}

function updateButtonText(button, text) {
  button.textContent = text;
}
