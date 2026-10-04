/* =========================
   GAME VARIABLES & DOM
========================= */

const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

let score = 0;
let lives = 3;
let playerX = 0;
let playerVelocity = 0;
let gameRunning = true;
let spawnTimer = null;

let keys = {
    left: false,
    right: false
};

/* =========================
   PLAYER POSITION
========================= */

function setPlayerStart() {
    playerX = (game.clientWidth - player.offsetWidth) / 2;
    playerVelocity = 0;
    updatePlayer();
}

function updatePlayer() {
    const maxX = game.clientWidth - player.offsetWidth;

    if (playerX <= 0) {
        playerX = 0;
        if (playerVelocity < 0) {
            playerVelocity = 0;
        }
    } else if (playerX >= maxX) {
        playerX = maxX;
        if (playerVelocity > 0) {
            playerVelocity = 0;
        }
    }

    player.style.transform = `translateX(${playerX}px)`;
}

/* =========================
   KEYBOARD CONTROLS
========================= */

document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        keys.left = true;
        event.preventDefault();
    }

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        keys.right = true;
        event.preventDefault();
    }
});

document.addEventListener("keyup", function(event) {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        keys.left = false;
    }

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        keys.right = false;
    }
});

/* =========================
   TOUCH & MOBILE CONTROLS
========================= */

const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");

function bindTouchEvents(element, direction) {
    if (!element) return;

    const start = (e) => {
        e.preventDefault();
        keys[direction] = true;
    };

    const end = (e) => {
        e.preventDefault();
        keys[direction] = false;
    };

    element.addEventListener("touchstart", start, { passive: false });
    element.addEventListener("touchend", end, { passive: false });
    element.addEventListener("touchcancel", end, { passive: false });
    element.addEventListener("mousedown", start);
    element.addEventListener("mouseup", end);
    element.addEventListener("mouseleave", end);
}

bindTouchEvents(btnLeft, "left");
bindTouchEvents(btnRight, "right");

if (game) {
    game.addEventListener("touchmove", function(e) {
        if (!gameRunning || !e.touches[0]) return;
        const rect = game.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        playerX = Math.max(0, Math.min(game.clientWidth - player.offsetWidth, touchX - player.offsetWidth / 2));
        updatePlayer();
    }, { passive: true });
}

/* =========================
   GAME LOOP & MOVEMENT
========================= */

let lastTime = performance.now();

function gameLoop(currentTime) {
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;

    if (gameRunning) {
        const acceleration = 1800;
        const maxSpeed = 650;
        const friction = 0.86;

        if (keys.left) {
            playerVelocity -= acceleration * deltaTime;
        }

        if (keys.right) {
            playerVelocity += acceleration * deltaTime;
        }

        if (!keys.left && !keys.right) {
            playerVelocity *= Math.pow(friction, deltaTime * 60);
        }

        playerVelocity = Math.max(-maxSpeed, Math.min(maxSpeed, playerVelocity));
        playerX += playerVelocity * deltaTime;

        updatePlayer();
    }

    requestAnimationFrame(gameLoop);
}

/* =========================
   CREATE COIN
========================= */

function createCoin() {
    if (!gameRunning) {
        return;
    }

    const coin = document.createElement("div");
    coin.className = "coin";

    const maxX = game.clientWidth - 40;
    const randomX = Math.random() * Math.max(maxX, 0);

    coin.style.left = randomX + "px";
    coin.style.top = "-40px";
    game.appendChild(coin);

    let coinY = -40;
    const speed = 180 + Math.random() * 140;
    let lastCoinTime = performance.now();

    function fall(currentTime) {
        if (!gameRunning) {
            coin.remove();
            return;
        }

        const delta = Math.min((currentTime - lastCoinTime) / 1000, 0.1);
        lastCoinTime = currentTime;

        coinY += speed * delta;
        coin.style.transform = `translateY(${coinY}px)`;

        /* COLLISION CHECK */
        const coinRect = coin.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        const collision =
            coinRect.bottom >= playerRect.top &&
            coinRect.top <= playerRect.bottom &&
            coinRect.right >= playerRect.left &&
            coinRect.left <= playerRect.right;

        if (collision) {
            score += 1;
            scoreText.textContent = score;
            coin.remove();
            return;
        }

        /* MISSED COIN CHECK */
        if (coinY > game.clientHeight - 30) {
            coin.remove();
            lives -= 1;
            updateLivesDisplay();

            if (lives <= 0) {
                triggerGameOver();
            }
            return;
        }

        requestAnimationFrame(fall);
    }

    requestAnimationFrame(fall);
}

/* =========================
   LIVES DISPLAY
========================= */

function updateLivesDisplay() {
    if (!livesText) return;
    if (lives > 0) {
        livesText.textContent = "❤️".repeat(lives);
    } else {
        livesText.textContent = "💔";
    }
}

/* =========================
   GAME OVER
========================= */

function triggerGameOver() {
    gameRunning = false;
    if (spawnTimer) {
        clearInterval(spawnTimer);
        spawnTimer = null;
    }

    document.querySelectorAll(".coin").forEach(c => c.remove());

    finalScore.textContent = score;
    gameOverScreen.style.display = "flex";
}

/* =========================
   SPAWNER
========================= */

function startSpawning() {
    if (spawnTimer) {
        clearInterval(spawnTimer);
    }
    spawnTimer = setInterval(createCoin, 700);
}

/* =========================
   RESTART
========================= */

function restartGame() {
    if (spawnTimer) {
        clearInterval(spawnTimer);
    }

    document.querySelectorAll(".coin").forEach(coin => coin.remove());

    score = 0;
    lives = 3;

    scoreText.textContent = "0";
    updateLivesDisplay();

    gameRunning = true;
    gameOverScreen.style.display = "none";

    setPlayerStart();
    startSpawning();
}

/* =========================
   RESIZE & INIT
========================= */

window.addEventListener("resize", function() {
    setPlayerStart();
});

setPlayerStart();
startSpawning();
requestAnimationFrame(gameLoop);
