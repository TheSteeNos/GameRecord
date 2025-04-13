import Game from './models/game.mjs';

const games = [];
let currentSort = 'none';

function makeKey(title) {
    return `game_${title.toLowerCase().trim().replace(/\s+/g, "_")}`;
}

function saveGame(game) {
    const key = makeKey(game.title);
    localStorage.setItem(key, JSON.stringify(game));
}

function deleteGame(title) {
    const key = makeKey(title);
    localStorage.removeItem(key);
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

document.getElementById("importSource")?.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        importGamesFromJSON(e.target.result);
    };
    reader.readAsText(file);
});

document.getElementById('sort-by')?.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderGames();
});

function renderGames() {
    const list = document.getElementById("gameList");
    let html = "";

    let sortedGames = [...games];

    switch (currentSort) {
        case 'players':
            sortedGames.sort((a, b) => parseInt(a.players) - parseInt(b.players));
            break;
        case 'rating':
            sortedGames.sort((a, b) => b.personalRating - a.personalRating);
            break;
        case 'difficulty':
            sortedGames.sort((a, b) => a.difficulty.localeCompare(b.difficulty));
            break;
        case 'playCount':
            sortedGames.sort((a, b) => b.playCount - a.playCount);
            break;
    }

    sortedGames.forEach((game, index) => {
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
                <button data-title="${game.title}" class="delete-game-btn">Delete</button>
                <hr/>
            </div>
        `;
    });

    list.innerHTML = html;

    document.querySelectorAll('.delete-game-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const title = e.target.getAttribute('data-title');
            deleteGame(title);
            loadGamesToMemory();
            renderGames();
        });
    });

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

document.getElementById('add-game-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const gameTitle = document.getElementById('game-name').value;
    const gameDesigner = document.getElementById('game-designer').value;
    const gameArtist = document.getElementById('game-artist').value;
    const gamePublisher = document.getElementById('game-publisher').value;
    const gameYear = document.getElementById('game-year').value;
    const gamePlayers = document.getElementById('game-players').value;
    const gameTime = document.getElementById('game-time').value;
    const gameDifficulty = document.getElementById('game-difficulty').value;
    const gameUrl = document.getElementById('game-url').value;
    const gameRating = document.getElementById('game-rating').value;

    const newGame = new Game({
        title: gameTitle,
        designer: gameDesigner,
        artist: gameArtist,
        publisher: gamePublisher,
        year: gameYear,
        players: gamePlayers,
        time: gameTime,
        difficulty: gameDifficulty,
        url: gameUrl,
        playCount: 0,
        personalRating: gameRating || 5
    });

    saveGame(newGame);
    loadGamesToMemory();
    renderGames();

    document.getElementById('add-game-form').reset();
});

loadGamesToMemory();
renderGames();