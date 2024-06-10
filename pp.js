document.addEventListener('DOMContentLoaded', function() {
    const player = document.getElementById('player');
    const board = document.getElementById('board');
    const scoreboard = document.getElementById('score');
    const livesIndicator = document.getElementById('lives');
    const restartButton = document.getElementById('restartButton');

    const boardWidth = board.clientWidth;
    const boardHeight = board.clientHeight;
    const playerWidth = player.clientWidth;
    const playerHeight = player.clientHeight;
    let playerY = boardHeight / 2 - playerHeight / 2;
    let score = 0;
    let lives = 3;
    let gameActive = true;
    let asteroidIntervalId = null; // To store the interval ID for asteroid spawning

    // Function to update player's position
    function updatePlayerPosition() {
        player.style.top = `${playerY}px`;
    }

    // Function to shoot pellets
    function shootPellet() {
        if (!gameActive) return;

        const playerRect = player.getBoundingClientRect();
        const pelletStartX = playerRect.right;

        const pellet = document.createElement('div');
        pellet.classList.add('pellet');
        pellet.style.top = `${playerY + playerHeight / 2}px`;
        pellet.style.left = `${pelletStartX}px`;
        board.appendChild(pellet);

        const pelletMoveInterval = setInterval(function() {
            if (!gameActive) {
                clearInterval(pelletMoveInterval);
                return;
            }

            const pelletLeft = parseInt(pellet.style.left, 10);
            const pelletWidth = pellet.clientWidth;
            let hitAsteroid = false;

            if (pelletLeft >= boardWidth) {
                clearInterval(pelletMoveInterval);
                pellet.remove();
            } else {
                pellet.style.left = `${pelletLeft + 5}px`;

                const asteroids = document.querySelectorAll('.asteroid');
                for (let i = 0; i < asteroids.length; i++) {
                    const asteroid = asteroids[i];
                    const pelletRect = pellet.getBoundingClientRect();
                    const asteroidRect = asteroid.getBoundingClientRect();

                    if (isCollision(pelletRect, asteroidRect)) {
                        hitAsteroid = true;
                        const currentSize = parseInt(asteroid.dataset.size, 10);
                        const initialSize = parseInt(asteroid.dataset.initialSize, 10);
                        const newSize = currentSize - 1;

                        if (newSize <= 0) {
                            score += initialSize * 10;
                            asteroid.remove();
                        } else {
                            asteroid.style.width = `${newSize * 10}px`;
                            asteroid.style.height = `${newSize * 10}px`;
                            asteroid.dataset.size = newSize;
                        }

                        document.getElementById('score').textContent = `Score: ${score}`;

                        clearInterval(pelletMoveInterval);
                        pellet.remove();
                        break;
                    }
                }
            }

            if (!hitAsteroid) {
                pellet.style.left = `${pelletLeft + 5}px`;
            }
        }, 5);
    }

    // Function to generate a random size for the asteroid
    function getRandomSize() {
        const sizes = [1, 2, 3, 4, 5]; // Size levels
        const randomIndex = Math.floor(Math.random() * sizes.length);
        return sizes[randomIndex];
    }

    // Function to create asteroids
    function createAsteroid() {
        if (!gameActive) return;

        const asteroidSize = getRandomSize();
        const asteroid = document.createElement('div');
        asteroid.classList.add('asteroid');
        asteroid.dataset.size = asteroidSize;
        asteroid.dataset.initialSize = asteroidSize;
        asteroid.style.top = `${Math.random() * (boardHeight - asteroidSize * 10)}px`;
        asteroid.style.left = `${boardWidth}px`;
        asteroid.style.width = `${asteroidSize * 10}px`;
        asteroid.style.height = `${asteroidSize * 10}px`;
        board.appendChild(asteroid);

        const asteroidMoveInterval = setInterval(function() {
            if (!gameActive) {
                clearInterval(asteroidMoveInterval);
                return;
            }

            const asteroidLeft = parseInt(asteroid.style.left, 10);
            const asteroidWidth = asteroid.clientWidth;

            if (asteroidLeft <= -asteroidWidth) {
                clearInterval(asteroidMoveInterval);
                asteroid.remove();
            } else {
                asteroid.style.left = `${asteroidLeft - 1}px`;

                const playerRect = player.getBoundingClientRect();
                const asteroidRect = asteroid.getBoundingClientRect();
                if (isCollision(playerRect, asteroidRect)) {
                    clearInterval(asteroidMoveInterval);
                    asteroid.remove();
                    lives--;
                    updateScoreboard();
                    if (lives === 0) {
                        gameOver();
                    }
                }
            }
        }, 10);
    }

    // Function to update the scoreboard
    function updateScoreboard() {
        const livesIndicator = document.getElementById('lives');
        livesIndicator.innerHTML = '';

        for (let i = 0; i < 3; i++) {
            const life = document.createElement('div');
            life.classList.add('life');
            if (i < lives) {
                life.classList.add('green');
            } else {
                life.classList.add('red');
            }
            livesIndicator.appendChild(life);
        }
    }

    // Function to handle game over
    function gameOver() {
        gameActive = false;

        const gameOverMessage = document.createElement('div');
        gameOverMessage.textContent = 'Game Over!';
        gameOverMessage.classList.add('game-over');
        board.appendChild(gameOverMessage);
    }

    // Event listener for arrow key press
    document.addEventListener('keydown', function(event) {
        if (!gameActive) return;

        const key = event.key;
        const playerStep = 10;

        if (key === 'ArrowUp') {
            playerY = Math.max(playerY - playerStep, 0);
            updatePlayerPosition();
            event.preventDefault();
        } else if (key === 'ArrowDown') {
            playerY = Math.min(playerY + playerStep, boardHeight - playerHeight);
            updatePlayerPosition();
            event.preventDefault();
        } else if (key === 'ArrowRight') {
            shootPellet();
            event.preventDefault();
        }
    });

    // Restart game functionality
    restartButton.addEventListener('click', function() {
        // Reset game variables
        gameActive = true;
        score = 0;
        lives = 3;
        updateScoreboard(); // Reset lives display

        // Remove game over message if present
        const gameOverMessage = document.querySelector('.game-over');
        if (gameOverMessage) {
            gameOverMessage.remove();
        }

        // Clear existing asteroids
        const asteroids = document.querySelectorAll('.asteroid');
        asteroids.forEach(function(asteroid) {
            asteroid.remove();
        });

        // Clear existing pellets
        const pellets = document.querySelectorAll('.pellet');
        pellets.forEach(function(pellet) {
            pellet.remove();
        });

        // Reset score display
        scoreboard.textContent = `Score: ${score}`;

        // Restart asteroid spawning
        asteroidIntervalId = setInterval(function() {
            createAsteroid();
        }, getRandomDelay(2000, 5000));
    });

    // Initial asteroid spawning
    asteroidIntervalId = setInterval(function() {
        createAsteroid();
    }, getRandomDelay(2000, 5000));

    // Function to generate a random delay for asteroid spawn
    function getRandomDelay(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Helper function to check collision between player and asteroid
    function isCollision(rect1, rect2) {
        return !(rect1.right < rect2.left ||
                 rect1.left > rect2.right ||
                 rect1.bottom < rect2.top ||
                 rect1.top > rect2.bottom);
    }
});
