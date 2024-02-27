function saveGameState(minerAr) {
    // Assuming `buildings` is an array of all buildings in the game
    const gameState = {
        miners: minerAr,
        // Add other game state data as needed
    };

    // Convert the game state to a JSON string
    const gameStateStr = JSON.stringify(gameState);

    // Save the game state to local storage
    localStorage.setItem('gameState', gameStateStr);
}

function loadGameState() {
    // Load the game state from local storage
    const gameStateStr = localStorage.getItem('gameState');

    if (gameStateStr) {
        // Convert the JSON string back to an object
        const gameState = JSON.parse(gameStateStr);

        // Restore the game state
        buildings = gameState.buildings;
        // Restore other game state data as needed
    }
}

export default { saveGameState, loadGameState };