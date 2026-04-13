import { Character } from "./character.js"
import { Observable } from "./observable.js"
import { Vector3 } from "./vector3.js"
import { setCurrentRoom } from "./room-renderer.js"

/**
 * A room in the map.
 */
export class Room {
	public readonly roomName: string;
	public readonly htmlElement: HTMLDivElement;
	public readonly backgroundElement: HTMLImageElement;
	public neighbors: Set<Room>;
	private characterPositions: Record<string, Vector3>; // Visual positions of the characters in the room
	private visitors: Set<Character>;
	public readonly isPlayerRoom;

	public onUpdate = new Observable<Room>();

	/**
	 * @param roomName The name of the room. Case sensitive.
	 * @param isPlayerRoom is this the room the player will be in?
	 * @param neighbors neighbors of this room. Can set later with connectNeighbors().
	 */
	constructor(roomName: string, visibilityLayer: number = 1, isPlayerRoom: boolean = false) {
		this.roomName = roomName;
		this.isPlayerRoom = isPlayerRoom; // Do this BEFORE generating the HTMLDivElement
		this.htmlElement = this.createHtmlElement(visibilityLayer);
		this.backgroundElement = this.createBackgroundElement(roomName);
		this.neighbors = new Set();
		this.visitors = new Set();
		this.characterPositions = {};
	}

	/**
	 * Sets the map position of the current room. Use percentages so it looks correct regardless of screen size.
	*/
	public setPosition(x: number, y: number): Room {
		this.htmlElement.style.left = `${x - 2.5}%`;
		this.htmlElement.style.top = `${y - 2.5}%`;
		return this;
	}

	/**
	 * Constructs a HTMLDiv element for this room.
	 */
	private createHtmlElement(layer: number): HTMLDivElement {
		const div = document.createElement('div') as HTMLDivElement;
		div.classList.add('room-box');
		div.id = this.roomName.toLowerCase().replace(' ', '-');

		if (this.isPlayerRoom)
			div.classList.add('player-room');

		// Listen for room changes
		div.addEventListener('click', () => {
			setCurrentRoom(this);
		})

		document.getElementById(`map-layer-${layer}`)?.appendChild(div);
		return div;
	}

	/**
	 * Constructs a HTML background element for this room.
	 */
	private createBackgroundElement(src: String): HTMLImageElement {
		const img = document.createElement('img') as HTMLImageElement;
		img.src = `img/background/${src}.jpg`;
		img.classList.add('room-img');
		img.style.display = 'none'; // Hide by default

		// Add it to the game screen
		document.querySelector('#game-screen')?.appendChild(img);
		return img;
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
	 * @param position The visual position on the screen. Z is the scale.
	 */
	public getCharacterPosition(character: string): Vector3 {
		if (this.characterPositions[character])
			return this.characterPositions[character] as Vector3;

		return { x: 0, y: 0, z: 1 };
	}

	/**
	 * Registers the position of a given character.
	 * @param character The character to associate this position with. Must be the Character object's name.
	 * @param position The visual position on the screen.
	 */
	public setCharacterPosition(character: string, position: Vector3): Room {
		this.characterPositions[character] = position;
		return this;
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