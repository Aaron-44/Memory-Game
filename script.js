
//Container für Spielfeld
const gridContainer = document.querySelector(".grid-container");

// Array mit Bildpfaden und IDs für jedes Kartenpaar
let cardsArray = [
  { image: "Oldtimer.jpg", id: 1 },
  { image: "Street.jpg", id: 2 },
  { image: "Watch.jpg", id: 3 },
  { image: "Bike.jpg", id: 4 },
  { image: "Füller.jpg", id: 5 },
  { image: "green.jpg", id: 6 },
  { image: "Kamerabild.jpg", id: 7 },
  { image: "Maschine.jpeg", id: 8 },
  { image: "Platte.jpg", id: 9}
];

//VARIABLEN

let firstCard, secondCard; //Variablen erste und zweite Karte beim Umdrehen
let lockBoard = false; // Prüfvar. ob weitere Aktionen möglich sind
let score = 0; //Punktzahl
let zug = 0; //Versuche
let leastMoves = localStorage.getItem("leastMoves"); //Var. für die wenigsten Versuche + Speicherung auf Local Storage
let bestTime = localStorage.getItem("bestTime"); //Var. für die beste Zeit und auf LS speichern

let startTime; // Zeitpunkt, zu dem die Stoppuhr beginnt
let timerInterval; // Intervall-Variable für die Stoppuhr

// Hilfsfunktion zum Setzen von Textinhalt eines Elements
function setText(selector, text) {
  document.querySelector(selector).textContent = text;
}

// Hilfsfunktion zur Formatierung der Zeit
function formatTime(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

//KARTEN
// Funktion, die das Array "cards" zufällig neu anordnet
function shuffleCards() {
  cards = [...cardsArray, ...cardsArray].sort(() => 0.5 - Math.random());
}

// Funktion, die die Karten generiert und zum Spielfeld hinzufügt
function generateCards() {
  gridContainer.innerHTML = ""; //Spielfeld leer
  cards.forEach((card) => { 
    // Erstellt ein neues Karten-Element
    const cardElement = document.createElement("div");
    cardElement.classList.add("card"); // + CSS klasse für cards
    cardElement.setAttribute("data-id", card.id); // Speichert die Karten-ID für den Vergleich

    // HTML für die Vorder- und Rückseite der Karte mit Bild auf der Vorderseite
    cardElement.innerHTML = `
      <div class="front">
        <img src="${card.image}" alt="Memory Card" class="card-image">
      </div>
      <div class="back"></div>
    `;
    cardElement.addEventListener("click", flipCard); // Event-Listener für das Umdrehen der Karte
    gridContainer.appendChild(cardElement); //Hängt Karte an Spielfeld an
  });
}

// Funktion, die eine Karte umdreht und die Logik für Paarvergleiche auslöst
function flipCard() {
  if (zug === 0 && !timerInterval) { // Startet die Stoppuhr nur beim ersten Zug
    startTimer();
  }  

  if (lockBoard || this === firstCard) return; //verhindert 3. umdrehen oder doppelt klicken

  // Markiert die Karte als "flipped"
  this.classList.add("flipped");

  //speichert 1. Karte als firstcard
  if (!firstCard) {
    firstCard = this;
    return;
  }

  //speichert 2. Karte als secondcard
  secondCard = this;

  lockBoard = true; //sperrt weitere eingaben
  zug++; //Versuch wird gezählt
  setText(".Zug", zug);

  checkForMatch();//Funktion Karten vergleichen
}

// Funktion, die überprüft, ob die beiden Karten übereinstimmen
function checkForMatch() {
  const isMatch = firstCard.dataset.id === secondCard.dataset.id; //ID Vergleich
  
  if (isMatch) {
    disableCards();
    score++; //Punktzahl hoch
    setText(".Score", score);
    
    if (score === 9) { //Wenn alle 9 Paare gefunden
      endGame();
    }
  }
  else {
    unflipCards(); //Karten zurückdrehen
  }
}



// Funktion, die Event-Listener für passende Paare entfernt (Karten bleiben aufgedeckt)
function disableCards() {
  firstCard.removeEventListener("click", flipCard); //Klickevent fällt weg
  secondCard.removeEventListener("click", flipCard); //Klickevent fällt weg
  resetBoard(); //setzt die Var. zurück
}

// Funktion, die nicht passende Karten zurückdreht
function unflipCards() {
  setTimeout(() => { //verzögert zurückdrehen um 1 sek.
    firstCard.classList.remove("flipped"); //dreht wieder zurück
    secondCard.classList.remove("flipped"); //dreht wieder zurück
    resetBoard(); //setzt VAr. zurück
  }, 1000); //verzögerung um 1 sek.
}

// Funktion, die Variablen für das nächste Paar zurücksetzt
function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false; //Sperre aufheben
}

//SPIELSTART
// Funktion, die das Spiel neu startet
function startGame() {
  clearInterval(timerInterval); // Setzt den Timer bei Spielneustart zurück
  setText(".timer","00:00"); // Setzt den Timer auf Anfangswert
  setText(".end-time", "00:00"); // Löscht die vorherige Endzeit
  timerInterval = null; // Stellt sicher, dass der Timer erneut gestartet wird
  bestTime = localStorage.getItem("bestTime") || null;
  
  displayBestTime();
  displayLeastmoves();


  score = 0; //Punktezahl auf 0
  zug = 0; //Versuche auf 0
  setText(".Score", score); //Pkt. in HTML
  setText(".Zug", zug); //übergang in HTML

  resetBoard(); //Board und Var. zurücksetzten 
  shuffleCards(); 
  generateCards();
}


//Züge zählen:
function displayLeastmoves(){
  setText(".least-moves", leastMoves ? leastMoves : "0");
}

// Funktion, die die wenigsten Züge speichert
function updateLeastMoves() {
  if (leastMoves === null || zug < leastMoves) {
    leastMoves = zug;
    localStorage.setItem("leastMoves", leastMoves);
    setText(".least-moves", leastMoves);
  }
}

// Beste Zeit laden und anzeigen
function displayBestTime() {
  setText(".best-time", bestTime ? formatTime(bestTime) : "00:00");
}

// Beste Zeit aktualisieren
function updateBestTime(elapsedTime) {
  if (!bestTime || elapsedTime < parseInt(bestTime)) {
    bestTime = elapsedTime;
    localStorage.setItem("bestTime", bestTime);
    setText(".best-time", formatTime(elapsedTime));
  }
}

// Timer starten
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    setText(".timer", formatTime(elapsedTime));
  }, 1000);
}

// Spiel beenden
function endGame() {
  clearInterval(timerInterval); //setzt Timer zurück
  const finalTime = Date.now() - startTime; //berechnet Zeit
  setText(".end-time", formatTime(finalTime));
  updateBestTime(finalTime);
  updateLeastMoves();
}


//löschen des local Storage
function clearLocalStorage() {
  localStorage.removeItem("bestTime");
  bestTime = null;
  localStorage.removeItem("leastMoves");
  leastMoves = null;
  displayBestTime(); // Aktualisiert die Anzeige der besten Zeit auf "00:00"
  displayLeastmoves();
}

// Startet das Spiel, indem die Karten gemischt und generiert werden
startGame();
//clearLocalStorage();


//nur für Screenshots:


/*
//spiel speichern
function saveGameState() {
  const gameState = {
    score: score,
    zug: zug,
    flippedCards: [...document.querySelectorAll('.card.flipped')].map(card => card.dataset.id),
    startTime: startTime,
    elapsedTime: Date.now() - startTime,
  };
  localStorage.setItem("gameState", JSON.stringify(gameState));
}


//Spiel laden
function loadGameState() {
  const savedState = JSON.parse(localStorage.getItem("gameState"));

  if (savedState) {
    score = savedState.score;
    zug = savedState.zug;
    startTime = savedState.startTime ? savedState.startTime : Date.now() - savedState.elapsedTime;

    setText(".Score", score);
    setText(".Zug", zug);

    // Karten wiederherstellen
    shuffleCards();
    generateCards();

    const flippedCardIDs = new Set(savedState.flippedCards);
    document.querySelectorAll('.card').forEach(card => {
      if (flippedCardIDs.has(card.dataset.id)) {
        card.classList.add('flipped');
        card.removeEventListener('click', flipCard); // Entfernt das Event für bereits gefundene Karten
      }
    });

    // Timer fortsetzen
    startTimer();
  }
}

function startGame() {
  clearInterval(timerInterval); // Setzt den Timer bei Spielneustart zurück
  setText(".timer", "00:00"); // Setzt den Timer auf Anfangswert
  setText(".end-time", "00:00"); // Löscht die vorherige Endzeit
  bestTime = localStorage.getItem("bestTime") || null;

  displayBestTime();
  displayLeastmoves();

  timerInterval = null; // Stellt sicher, dass der Timer erneut gestartet wird

  score = 0; // Punktezahl auf 0
  zug = 0; // Versuche auf 0
  setText(".Score", score); // Punkte in HTML
  setText(".Zug", zug); // Übergang in HTML

  resetBoard(); // Board und Variablen zurücksetzen
  shuffleCards();
  generateCards();

  // Spielstand laden, falls vorhanden
  loadGameState();
}

function startTimer() {
  if (!startTime) {
    startTime = Date.now();
  }

  timerInterval = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    setText(".timer", formatTime(elapsedTime));
  }, 1000);
}
*/
