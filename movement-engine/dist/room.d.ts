import { Character } from "./character.js";
import { Observable } from "./observable.js";
/**
 * A room in the map.
 */
export declare class Room {
    readonly htmlID: string;
    neighbors: Set<Room>;
    private visitors;
    readonly isPlayerRoom: boolean;
    onUpdate: Observable<Room>;
    /**
     *
     * @param htmlID must be verbaitum HTML id. Case sensitive.
     * @param isPlayerRoom is this the room the player will be in?
     * @param neighbors neighbors of this room. Can set later with connectNeighbors().
     */
    constructor(htmlID: string, isPlayerRoom?: boolean, neighbors?: Room[]);
    /**
     * Adds a bi-directional connection between this room and each room in the list.
     * This method only need to be called once per connection. Ex: a.connectNeighbors([b]) will accomplish the same thing as
     * b.connectNeighbors([a])
     * @param neighbors the rooms which will share connections with this room.
     */
    connectNeighbors(neighbors: Room[]): void;
    /**
     * Adds a visitor into the room
     * @param entering the character entering this room
     */
    visitorEnter(entering: Character): void;
    /**
     * Removes a visitor from the room
     * @param exiting the character exiting this room (use this)
     */
    visitorExit(exiting: Character): void;
    /**
     *
     * @returns true if the room has visitors already.
     */
    hasVisitors(): boolean;
    get visitorCount(): number;
    extractState(): void;
}
//# sourceMappingURL=room.d.ts.map