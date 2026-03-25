import { Character } from "./character.js"

export class Room {
    public readonly htmlID: string;
    public readonly neighbors: Room[];
    private visitors: Character[];
    public readonly isPlayerRoom;
    
    private visitorsChangedFlag!: Promise<void>;   // awaitable flag, use to detect changes to visitors
    private resolveFlag!: () => void;   // resolves the flag's promise

    constructor(htmlID: string, neighbors: Room[], isPlayerRoom: boolean = false) {
        this.htmlID = htmlID;
        this.neighbors = neighbors;
        this.visitors = [];
        this.setFlag();
        this.isPlayerRoom = isPlayerRoom;
    }

    private setFlag() {
        this.visitorsChangedFlag =  new Promise<void>(res => (this.resolveFlag = res));
    }

    /**
     * Use to await for updates to the room's state, to know when to redraw.
     * @returns a promise fufilled when any character has entered or exited this room.
     */
    public detectMove() {
        return this.visitorsChangedFlag;
    }

    /**
     * Adds a visitor into the room
     * @param entering the character entering this room
     */
    public visitorEnter(entering: Character) {
        this.visitors.push(entering);
        this.resolveFlag(); // complete any awaits
        this.setFlag(); // reset
    }

    /**
     * Removes a visitor from the room
     * @param exiting the character exiting this room (use this)
     */
    public visitorExit(exiting: Character) {
        let idx = this.visitors.indexOf(exiting);
        delete this.visitors[idx];
        this.resolveFlag();
        this.setFlag();
    }

    public extractState(){
        throw Error("Room.extractState is not implemented.");
    }
}