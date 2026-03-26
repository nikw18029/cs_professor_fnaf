import { Character } from "./character.js"

export class Room {
    public readonly htmlID: string;
    public neighbors: Set<Room>;
    private visitors: Set<Character>;
    public readonly isPlayerRoom;

    private visitorsChangedFlag!: Promise<void>;   // awaitable flag, use to detect changes to visitors
    private resolveFlag!: () => void;   // resolves the flag's promise

    constructor(htmlID: string, isPlayerRoom: boolean = false, neighbors: Room[] = []) {
        this.htmlID = htmlID;
        this.neighbors = new Set(neighbors);
        this.visitors = new Set();
        this.resetFlag();
        this.isPlayerRoom = isPlayerRoom;
    }

    private resetFlag() {
        this.visitorsChangedFlag = new Promise<void>(res => (this.resolveFlag = res));
    }

    /**
     * Adds a bi-directional connection between this room and each room in the list.
     * This method only need to be called once per connection. Ex: a.connectNeighbors([b]) will accomplish the same thing as
     * b.connectNeighbors([a])
     * @param neighbors the rooms which will share connections with this room.
     */
    public connectNeighbors(neighbors: Room[]) {
        for (const n of neighbors) {
            this.neighbors.add(n);
            n.neighbors.add(this);
        }
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
        this.visitors.add(entering);
        this.resolveFlag(); // complete any awaits
        this.resetFlag(); // reset
    }

    /**
     * Removes a visitor from the room
     * @param exiting the character exiting this room (use this)
     */
    public visitorExit(exiting: Character) {
        this.visitors.delete(exiting);
        this.resolveFlag();
        this.resetFlag();
    }

    /**
     * 
     * @returns true if the room has visitors already.
     */
    public hasVisitors() {
        return this.visitors.size > 0;
    }

    public extractState() {
        throw Error("Room.extractState is not implemented.");
    }
}