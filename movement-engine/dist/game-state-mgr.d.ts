import { Room } from "./room.js";
import { Character } from "./character.js";
import { Observable } from "./observable.js";
/**
 * The orchestrator for the game
 */
export declare class GameStateMgr {
    rooms: Set<Room>;
    characters: Set<Character>;
    playerRoom: Room;
    onTimerUpdate: Observable<number>;
    timerID: number;
    constructor();
    /**
     * Starts up each character, runs a timer.
     */
    runGame(): Promise<void>;
    /**
     * Requests to stop game loops.
     */
    stopGame(): void;
    private handleAttack;
}
//# sourceMappingURL=game-state-mgr.d.ts.map