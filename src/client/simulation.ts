// TEMP just for testing movement engine

import { GameStateMgr } from "./game-state-mgr.js";
import { Logger } from "./logger.js";

Logger.setMinlevel("trace");

// Initialize the game
const game = new GameStateMgr();

// Start the loop
game.runGame();

Logger.info("Game is initialized and running.");


// Security camera selector
let isMapVisible: boolean = true;
const map: HTMLDivElement = document.querySelector('#map-screen') as HTMLDivElement;

setMapVisibility(false); // Start hidden
document.addEventListener('keydown', (e: KeyboardEvent) => {
	if (e.key == 'm')
		setMapVisibility(!isMapVisible);
});

function setMapVisibility(isVisible: boolean): void {
	isMapVisible = isVisible;
	map.style.visibility = isMapVisible ? 'visible' : 'hidden';
}