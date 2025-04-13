import Game from './models/game.mjs';

function saveGame(game) {
    localStorage.setItem(`game_${game.title}`, JSON.stringify(game));
}

function getAllGames() {
    const games = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("game_")) {
            const data = JSON.parse(localStorage.getItem(key));
            games.push(new Game(data));
        }
    }
    return games;
}

function exportGamesAsJSON() {
    const games = getAllGames();
    return JSON.stringify(games, null, 2);
}

function importGamesFromJSON(json) {
    const gameArray = JSON.parse(json);
    gameArray.forEach(gameData => {
        const game = new Game(gameData);
        saveGame(game);
    });
}