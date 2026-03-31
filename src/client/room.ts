import { Character } from "./character.js"
import { Observable } from "./observable.js"
import { Vector2 } from "./vector2.js"

/**
 * A room in the map.
 */
export class Room {
	public readonly htmlID: string;
	public readonly backgroundImage: string;
    public neighbors: Set<Room>;
    private characterPositions: Record<string, Vector2>; // Visual positions of the characters in the room
    private visitors: Set<Character>;
    public readonly isPlayerRoom;
	
    public onUpdate = new Observable<Room>();

    /**
     * @param htmlID must be verbaitum HTML id. Case sensitive.
     * @param isPlayerRoom is this the room the player will be in?
     * @param neighbors neighbors of this room. Can set later with connectNeighbors().
     */
    constructor(htmlID: string, backgroundImage : string, isPlayerRoom: boolean = false, neighbors: Room[] = []) {
        this.htmlID = htmlID;
		this.backgroundImage = `img/background/${backgroundImage}.jpg`;
        this.neighbors = new Set(neighbors);
        this.visitors = new Set();
		this.characterPositions = {};
        this.isPlayerRoom = isPlayerRoom;
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
	 * Gets the visual position of a particular character.
	 * @param character The character to associate this position with. Should ideally be a Character object's name.
	 * @param position The visual position on the screen.
	 */
	public getCharacterPosition(character : string) : Vector2 {
		if (this.characterPositions[character])
			return this.characterPositions[character] as Vector2;
		
		return { x : 0, y : 0 };
	}

	/**
	 * Registers the position of a given character.
	 * @param character The character to associate this position with. Should ideally be a Character object's name.
	 * @param position The visual position on the screen.
	 */
	public setCharacterPosition(character : string, position : Vector2) {
		this.characterPositions[character] = position;
	}

    /**
     * Adds a visitor into the room
     * @param entering the character entering this room
     */
    public visitorEnter(entering: Character) {
        this.visitors.add(entering);
        this.onUpdate.notify(this);
    }

    /**
     * Removes a visitor from the room
     * @param exiting the character exiting this room (use this)
     */
    public visitorExit(exiting: Character) {
        this.visitors.delete(exiting);
        this.onUpdate.notify(this);
    }

    /**
     * 
     * @returns true if the room has visitors already.
     */
    public hasVisitors() {
        return this.visitors.size > 0;
    }

    public get visitorCount() { return this.visitors.size; }

    public extractState() {
        throw Error("Room.extractState is not implemented.");
    }
}