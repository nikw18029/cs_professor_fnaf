// TEMP just for testing movement engine

import { GameStateMgr } from "./game-state-mgr.js";
import { Logger } from "./logger.js";

Logger.setMinlevel("debug");

// Initialize the game
const game = new GameStateMgr();

// Start the loop
game.runGame();

Logger.info("Game is initialized and running.");