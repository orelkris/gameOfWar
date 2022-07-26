const CARDS_TO_DRAW = 2;
const EMPTY_DECK = 48;
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
let playerCardDiv = document.getElementById("card-player");
let computerCardDiv = document.getElementById("card-computer");
const playerScore = document.querySelector("#player-score span");
const computerScore = document.querySelector("#computer-score span");
const roundMessage = document.getElementById("main-round-winner");
const remainingCards = document.getElementById("remaining-cards");
const remainingCardsHeader = document.getElementById("remaining-cards-header");
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
  if (buttonDeck.innerText === "Shuffle") {
    fetch(`https://apis.scrimba.com/deckofcards/api/deck/${deckId}/shuffle/`)
      .then((res) => res.json())
      .then((data) => {
        startGame(data.remaining, true);
      });
  } else {
    fetch("https://apis.scrimba.com/deckofcards/api/deck/new/shuffle/")
      .then((res) => res.json())
      .then((data) => {
        deckId = data.deck_id;
        startGame(data.remaining);
      });
    updateButtonText(buttonDeck, "Shuffle");
  }

  buttonDeck.disabled = true;
}

function startGame(data, restart = false) {
  // now that the deck is available for usage, the draw button should be enabled
  buttonDraw.disabled = false;

  updateTextHtml(remainingCardsHeader, "Remaining Cards:");

  updateTextHtml(remainingCards, data);

  if (restart) {
    const cards = document.getElementById("cards");
    cards.innerHTML = `
    <div id="card-player"></div>
    <div id="card-computer"></div>
    `;

    playerCardDiv = document.getElementById("card-player");
    computerCardDiv = document.getElementById("card-computer");

    roundMessage.classList.remove("main-round-winner-hide");

    roundMessage.classList.add("main-round-winner-initial");

    updateTextHtml(playerScore, 0);
    updateTextHtml(computerScore, 0);
    round = 1;
  }
}

function drawCards(id = deckId, cardAmount = CARDS_TO_DRAW) {
  fetch(
    `https://apis.scrimba.com/deckofcards/api/deck/${id}/draw/?count=${CARDS_TO_DRAW}`
  )
    .then((res) => res.json())
    .then((data) => {
      playerCard = createCardObj(data.cards[0]);
      computerCard = createCardObj(data.cards[1]);

      // Player should not be able to press the draw button until the next round begins and the score is displayed
      buttonDraw.disabled = true;

      updateTextHtml(remainingCards, data.remaining);

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
          roundWinnerAnimationOnce(score);
        } else {
          roundWinnerAnimation(score, data.remaining);
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
  setTimeout(() => {
    parent.appendChild(imgElem);
  }, 700);

  hideShowAnimation(parent, "span-score-hide", "span-score-show", 300);
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
  setTimeout(() => {
    roundMessage.classList.add("main-round-winner-show");
    roundMessage.classList.remove("main-round-winner-initial");
  }, 600);

  updateScore(score);
}

function roundWinnerAnimation(score, totalCardCount = 52) {
  roundMessage.classList.remove("main-round-winner-show");
  roundMessage.classList.add("main-round-winner-hide");
  roundMessage.addEventListener(
    "animationend",
    () => {
      setTimeout(() => {
        roundMessage.classList.add("main-round-winner-show");
        roundMessage.classList.remove("main-round-winner-hide");
      }, 800);

      if (totalCardCount === EMPTY_DECK) {
        updateScore(score, true);
      } else {
        updateScore(score);
      }
    },
    { once: true }
  );
}

function updateScore(score, endOfGame = false) {
  if (score === -1) {
    roundMessage.textContent = "It's a tie!";
  } else if (score) {
    scoreAnimation(playerScore, roundMessage, "You win this round!");
  } else {
    scoreAnimation(computerScore, roundMessage, "You lose this round :(");
  }

  if (endOfGame) {
    gameOver();
    return;
  }

  setTimeout(() => {
    round++;
    buttonDraw.disabled = false;
  }, 2000);
}

function scoreAnimation(player, messageElem, message) {
  hideShowAnimation(player, "span-score-hide", "span-score-show");
  setTimeout(() => {
    messageElem.textContent = message;
    player.textContent = +player.textContent + 1;
  }, 500);
}

function updateTextHtml(element, remaining) {
  fadeIn(element);
  element.textContent = remaining;
}

function updateButtonText(button, text) {
  button.textContent = text;
}

function hideShowAnimation(element, hide, show, timeout = 500) {
  element.classList.remove(show);
  element.classList.add(hide);
  element.addEventListener(
    "animationend",
    () => {
      setTimeout(() => {
        element.classList.add(show);
        element.classList.remove(hide);
      }, timeout);
    },
    { once: true }
  );
}

function fadeIn(element) {
  if (element.classList.contains("fade-out")) {
    element.classList.remove("fade-out");
    element.classList.add("fade-in");
  } else {
    element.classList.add("fade-in");
  }
}

function fadeOut(element) {
  if (element.classList.contains("fade-in")) {
    element.classList.remove("fade-in");
    element.classList.add("fade-out");
  } else {
    element.classList.add("fade-out");
  }
}

function gameOver() {
  buttonDraw.disabled = true;
  const cards = document.getElementById("cards");

  setTimeout(() => {
    roundMessage.classList.remove("main-round-winner-show");
    roundMessage.classList.add("main-round-winner-hide");
    fadeOut(cards);
    fadeOut(remainingCardsHeader);
    fadeOut(remainingCards);

    cards.addEventListener(
      "animationend",
      () => {
        roundMessage.classList.add("hidden");
        cards.classList.add("large-font");
        fadeIn(cards);
        cards.textContent = `
        ${
          +playerScore.textContent > +computerScore.textContent
            ? "You won!"
            : +computerScore.textContent === +playerScore.textContent
            ? "It's a tie!"
            : "You lost :("
        }

      `;

        buttonDeck.disabled = false;
      },
      { once: true }
    );
  }, 3000);
}
