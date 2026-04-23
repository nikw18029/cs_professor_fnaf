// TEMP just for testing movement engine

import { GameStateMgr } from "./game-state-mgr.js";
import { Logger } from "./logger.js";
import { Observable } from "./observable.js";
import { resetRoom } from "./room-renderer.js";

Logger.setMinlevel("trace");

// Initialize the game
const game = new GameStateMgr();

// Start the loop
let gameSave = sessionStorage.getItem('gameSave') ? JSON.parse(sessionStorage.getItem('gameSave') || "oops") : null;
console.log(gameSave);
if (!gameSave || !game.loadGame(gameSave)) {	// try to load game
	game.runGame();	// just start a new game if that fails
}

Logger.info("Game is initialized and running.");


// Security camera selector
let mapVisibilityLayer: number = 0;
const map1: HTMLDivElement = document.querySelector('#map-layer-1') as HTMLDivElement;
const map2: HTMLDivElement = document.querySelector('#map-layer-2') as HTMLDivElement;

setMapVisibility(0); // Start hidden
document.addEventListener('keydown', (e: KeyboardEvent) => {
	if (e.key == '1')
		setMapVisibility(1);
	else if (e.key == '2')
		setMapVisibility(2);

	if (e.key == 'h' && !e.repeat)
		game.attemptHideToggle();
});

function setMapVisibility(targetLayer: number): void {
	mapVisibilityLayer = mapVisibilityLayer == targetLayer ? 0 : targetLayer;

	map1.style.display = mapVisibilityLayer == 1 ? 'block' : 'none';
	map2.style.display = mapVisibilityLayer == 2 ? 'block' : 'none';

	if (mapVisibilityLayer == 0)
		resetRoom();
}
