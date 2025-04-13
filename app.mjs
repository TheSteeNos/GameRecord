import Game from './models/game.mjs';

const games = [];

function saveGame(game) {
    localStorage.setItem(`game_${game.title}`, JSON.stringify(game));
}

function getAllGames() {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("game_")) {
            const data = JSON.parse(localStorage.getItem(key));
            result.push(new Game(data));
        }
    }
    return result;
}

function exportGamesAsJSON() {
    return JSON.stringify(games, null, 2);
}

function importGamesFromJSON(json) {
    const gameArray = JSON.parse(json);
    gameArray.forEach(gameData => {
        const game = new Game(gameData);
        saveGame(game);
    });
    loadGamesToMemory();
}

function loadGamesToMemory() {
    games.length = 0;
    const storedGames = getAllGames();
    storedGames.forEach(game => games.push(game));
}

document.getElementById("importSource").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        importGamesFromJSON(e.target.result);
    };
    reader.readAsText(file);
});

function renderGames() {
    const list = document.getElementById("gameList");
    let html = "";

    games.forEach((game, index) => {
        html += `
            <div class="game">
                <h2>${game.title} (${game.year})</h2>
                <p><strong>Designer:</strong> ${game.designer}</p>
                <p><strong>Artist:</strong> ${game.artist}</p>
                <p><strong>Publisher:</strong> ${game.publisher}</p>
                <p><strong>Players:</strong> ${game.players}</p>
                <p><strong>Time:</strong> ${game.time}</p>
                <p><strong>Difficulty:</strong> ${game.difficulty}</p>
                <p><strong>Play Count:</strong> ${game.playCount}</p>
                <p><strong>Personal Rating:</strong> <span id="ratingDisplay_${index}">${game.personalRating}</span></p>
                <input type="range" min="0" max="10" value="${game.personalRating}" data-index="${index}" class="rating-slider" />
                <button data-index="${index}" class="update-playcount-btn">+1 Play</button>
                <hr/>
            </div>
        `;
    });

    list.innerHTML = html;

    document.querySelectorAll(".rating-slider").forEach(slider => {
        slider.addEventListener("input", (e) => {
            const index = e.target.dataset.index;
            const newRating = parseInt(e.target.value);
            games[index].personalRating = newRating;
            saveGame(games[index]);
            document.getElementById(`ratingDisplay_${index}`).textContent = newRating;
        });
    });

    document.querySelectorAll(".update-playcount-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const index = e.target.dataset.index;
            games[index].playCount += 1;
            saveGame(games[index]);
            renderGames();
        });
    });
}

loadGamesToMemory();
renderGames();