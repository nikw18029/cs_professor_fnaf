// TEMP just for testing movement engine

import { GameStateMgr } from "./game-state-mgr.js";
import { Logger } from "./logger.js";

Logger.setMinlevel("trace");

// Initialize the game
const game = new GameStateMgr();

// Start the loop or read from file
let gameSave = await getGameSave();
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
});

function setMapVisibility(targetLayer: number): void {
	mapVisibilityLayer = mapVisibilityLayer == targetLayer ? 0 : targetLayer;

	map1.style.display = mapVisibilityLayer == 1 ? 'block' : 'none';
	map2.style.display = mapVisibilityLayer == 2 ? 'block' : 'none';
}

async function getGameSave() {
	const res = await fetch('/api/save');
	if (res) return await res.json();
	else return null
}