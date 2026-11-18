
// Nombre: Ulises Solorio
// Juego de Memorama

const gameBoard = document.getElementById("gameBoard");
const timerDisplay = document.getElementById("timer");
const bestTimeDisplay = document.getElementById("bestTime");
const installButton = document.getElementById("btnInstall");

// Imágenes del memorama
const images = ["🐶", "🐱", "🦁", "🐸", "🐼", "🐵", "🦊", "🐰"];

let cards = [...images, ...images];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matches = 0;
let seconds = 0;
let timerInterval = null;
let gameStarted = false;

// Mostrar mejor tiempo
const savedTime = localStorage.getItem("bestTime");

if (savedTime) {
    bestTimeDisplay.textContent = formatTime(Number(savedTime));
} else {
    bestTimeDisplay.textContent = "--:--";
}

// Formato del tiempo
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );
}

// Iniciar cronómetro
function startTimer() {
    if (gameStarted) return;

    gameStarted = true;

    timerInterval = setInterval(() => {
        seconds++;
        timerDisplay.textContent = formatTime(seconds);
    }, 1000);
}

// Mezclar tarjetas
function shuffleCards() {
    cards.sort(() => Math.random() - 0.5);
}

// Crear tablero
function createBoard() {
    gameBoard.innerHTML = "";

    shuffleCards();

    cards.forEach((image) => {
        const card = document.createElement("div");

        card.classList.add("card");
        card.textContent = "❓";
        card.dataset.image = image;

        card.addEventListener("click", () => flipCard(card));

        gameBoard.appendChild(card);
    });
}

// Voltear tarjeta
function flipCard(card) {
    if (
        lockBoard ||
        card === firstCard ||
        card.classList.contains("matched") ||
        card.classList.contains("flipped")
    ) {
        return;
    }

    startTimer();

    card.textContent = card.dataset.image;
    card.classList.add("flipped");

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    checkMatch();
}

// Comprobar parejas
function checkMatch() {
    const isMatch =
        firstCard.dataset.image === secondCard.dataset.image;

    if (isMatch) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        matches++;

        resetCards();

        if (matches === images.length) {
            finishGame();
        }
    } else {
        lockBoard = true;

        setTimeout(() => {
            firstCard.textContent = "❓";
            secondCard.textContent = "❓";

            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");

            resetCards();
        }, 1000);
    }
}

// Reiniciar selección
function resetCards() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

// Finalizar juego
function finishGame() {
    clearInterval(timerInterval);

    const previousBest = localStorage.getItem("bestTime");

    if (!previousBest || seconds < Number(previousBest)) {
        localStorage.setItem("bestTime", seconds);
        bestTimeDisplay.textContent = formatTime(seconds);
    }

    setTimeout(() => {
        alert(
            "¡Felicidades! Completaste el memorama en " +
            formatTime(seconds)
        );
    }, 300);
}

// Iniciar juego
createBoard();

// Instalar aplicación PWA
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.style.display = "inline-block";
});

installButton.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    await deferredPrompt.userChoice;

    deferredPrompt = null;
    installButton.style.display = "none";
});

// Registrar Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then(() => console.log("Aplicación PWA lista"))
            .catch((error) => console.log("Error:", error));
    });
}
