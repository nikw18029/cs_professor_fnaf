import { Room } from "./room.js";
import { Observable } from "./observable.js";
/**
 * A character that can move and trigger an attack
 */
export declare class Character {
    readonly name: string;
    readonly AI_LVL: number;
    private preferredRooms;
    private spawnRoom;
    private currentRoom;
    private active;
    onAttack: Observable<Character>;
    constructor(name: string, spawnRoom: Room, preferredRooms: Room[]);
    private pickNextRoom;
    private moveInto;
    /**
     * Flags the character to stop moving, will stop next time it attempts to move.
     */
    stop(): void;
    /**
     * Activates the character in the game. Like pressing a big "GO" button. Starts the wait -> roll -> move loop.
     * Request the character to stop by calling .stop()
     */
    activate(): Promise<void>;
    /**
     * Returns the character to their spawn and reactivates them.
     */
    returnToSpawn(): void;
}
//# sourceMappingURL=character.d.ts.map