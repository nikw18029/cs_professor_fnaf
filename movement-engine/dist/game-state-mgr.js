import { Room } from "./room.js";
import { Character } from "./character.js";
import { Logger } from "./logger.js";
import { bindUI } from "./ui-bridge.js";
import config from "./../appcfg.json" with { type: "json" };
/**
 * The orchestrator for the game
 */
export class GameStateMgr {
    rooms;
    characters;
    playerRoom;
    constructor() {
        // build map
        let start = new Room("start");
        let a1 = new Room("a1");
        let a2 = new Room("a2");
        let b1 = new Room("b1");
        let b2 = new Room("b2");
        this.playerRoom = new Room("end", true);
        a1.connectNeighbors([start, b1, a2, b2]);
        a2.connectNeighbors([a1, b1, b2, this.playerRoom]);
        b1.connectNeighbors([start, a1, a2, b2]);
        b2.connectNeighbors([b1, a1, a2, this.playerRoom]);
        this.rooms = new Set([start, a1, a2, b1, b2, this.playerRoom]);
        // bind to html
        bindUI(this.rooms);
        // characters and observer slop
        let dummy = new Character("Dummy", start, [a1, a2, this.playerRoom]);
        this.characters = new Set([dummy]);
        dummy.onAttack.subscribe((attacker) => {
            this.handleAttack(attacker);
        });
    }
    /**
     * Starts up each character, sets a time to end the game.
     */
    async runGame() {
        const gameDurationMins = config.gameMins * 60000;
        setTimeout(this.stopGame, gameDurationMins);
        this.characters.forEach(c => c.activate());
    }
    /**
     * Stops the game loop.
     */
    stopGame() {
        this.characters.forEach(c => c.stop());
        Logger.info("Game stopped");
    }
    handleAttack(c) {
        Logger.info(`${c.name} is attacking!`);
        // if player fails to defend:
        // this.stopGame();
        // temp: simulate attack with timeout
        setTimeout(() => c.returnToSpawn(), 10000);
    }
}
//# sourceMappingURL=game-state-mgr.js.map