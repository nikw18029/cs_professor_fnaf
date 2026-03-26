import { Room } from "./room.js";
import { Character } from "./character.js";
/**
 * The orchestrator for the game
 */
export declare class GameStateMgr {
    rooms: Set<Room>;
    characters: Set<Character>;
    playerRoom: Room;
    constructor();
    /**
     * Starts up each character, sets a time to end the game.
     */
    runGame(): Promise<void>;
    /**
     * Stops the game loop.
     */
    stopGame(): void;
    private handleAttack;
}
//# sourceMappingURL=game-state-mgr.d.ts.map