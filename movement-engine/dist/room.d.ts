import { Character } from "./character";
export declare class Room {
    htmlID: string;
    private visitors;
    readonly isPlayerRoom: boolean;
    private visitorsChangedFlag;
    private resolveFlag;
    constructor(htmlID: string, isPlayerRoom?: boolean);
    private setFlag;
    /**
     * Use to await for updates to the room's state, to know when to redraw.
     * @returns a promise fufilled when any character has entered or exited this room.
     */
    detectMove(): Promise<void>;
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
}
//# sourceMappingURL=room.d.ts.map