// TEMP just for testing movement engine

import { GameStateMgr } from "./game-state-mgr.js";
import { Logger } from "./logger.js";

Logger.setMinlevel("debug");

// Initialize the game
const game = new GameStateMgr();

// Start the loop
game.runGame();

Logger.info("Game is initialized and running.");


// Security camera selector
let isMapVisible: boolean = true;
const map: HTMLDivElement = document.querySelector('#map-screen') as HTMLDivElement;

document.addEventListener('keydown', (e: KeyboardEvent) => {
	if (e.key == 'm')
		toggleMap();
});

function toggleMap(): void {
	isMapVisible = !isMapVisible;
	map.style.visibility = isMapVisible ? 'visible' : 'hidden';
}