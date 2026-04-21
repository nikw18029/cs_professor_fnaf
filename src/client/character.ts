import { Room } from "./room.js"
import { Logger } from "./logger.js"
import config from "./config.js"
import { Observable } from "./observable.js";
import { Vector3 } from "./vector3.js";
import { diff } from "util";

/**
 * A character that can move and trigger an attack
 */
export class Character {
	/**Must be verbaitum what is in appcfg*/
	public readonly name: string;
	public readonly AI_LVL: number;
	private preferredRooms: Set<Room>;
	private spawnRoom: Room;
	private currentRoom: Room;
	private active: boolean;
	public onAttack: Observable<Character>;
	public onRoomChange: Observable<Character>;
	private spriteElement!: HTMLImageElement;

	constructor(name: string, spawnRoom: Room, preferredRooms: Room[]) {
		const raw = sessionStorage.getItem('AI_LVLs');
		const lvls: Record<string, number> = JSON.parse(sessionStorage.getItem('AI_LVLs') ?? '{}');

		this.name = name;
		this.preferredRooms = new Set(preferredRooms);
		this.AI_LVL = lvls[this.name.toLowerCase()] || 0;
		this.spawnRoom = spawnRoom;

		this.currentRoom = spawnRoom;
		this.currentRoom.visitorEnter(this);

		this.onAttack = new Observable<Character>();
		this.onRoomChange = new Observable<Character>();
		this.active = true;
		this.initializeSprite();
	}

	/**
	 * Creates the sprite element for this character.
	 */
	private initializeSprite() {
		this.spriteElement = document.createElement("img") as HTMLImageElement;
		console.log(`Character sprite ${this.name}.png loaded.`);
		this.spriteElement.src = `img/${this.name}.png`;
		this.spriteElement.classList.add("character-sprite");

		const parent: HTMLElement = document.querySelector("#game-screen") as HTMLElement;
		parent.appendChild(this.spriteElement);
	}

	private pickNextRoom(): Room {
		const preferredNeighbors: Room[] = [];
		for (const neighbor of this.currentRoom.neighbors) {
			if (neighbor.isPlayerRoom) {  // Prefer player room: if one of the neigbhors is the player's room, make this more likely
				// to choose player's room and skip room selection. Scales with ai lvl
				let roll = Math.floor(Math.random() * 20) + 1;
				if (roll <= this.AI_LVL) {
					return neighbor;
				}

			} else if (this.preferredRooms.has(neighbor)) {
				preferredNeighbors.push(neighbor);
			}
		}

		const pool = preferredNeighbors.length > 0
			? preferredNeighbors
			: Array.from(this.currentRoom.neighbors);   // as a fallback if none of the neighbors are preferred then any neighbors are an option

		if (pool.length === 0) {
			Logger.critical(`Character ${this.name} failed to pick a room.`);
		}

		return pool[Math.floor(Math.random() * pool.length)] as Room;   // if player room is failed to roll earlier it can still be selected here.
	}

	/**
	 * Returns the room this character is currently in.
	 */
	public getCurrentRoom(): Room {
		return this.currentRoom;
	}

	/**
	 * Redraws the character's sprite at the give position.
	 * @param isVisible Determines whether the sprite should be visible or not.
	 * @param position The position to draw the sprite at.
	 */
	public redraw(isVisible: boolean, position: Vector3) {
		this.spriteElement.style.left = `${position.x}%`;
		this.spriteElement.style.top = `${position.y}%`;
		this.spriteElement.style.width = `${20 * Math.abs(position.z)}%`;
		this.spriteElement.style.transform = `scaleX(${Math.sign(position.z)})`;
		this.spriteElement.style.zIndex = `${Math.round(position.y * Math.abs(position.z))}`;
		this.spriteElement.style.display = isVisible ? 'block' : 'none';
	}

	/** I'd really rather this be private. Try not to call this if you can help it. */
	public moveInto(newRoom: Room) {
		this.currentRoom.visitorExit(this);
		newRoom.visitorEnter(this);
		this.currentRoom = newRoom;
		this.onRoomChange.notify(this);
		Logger.debug(`${this.name} moved to ${newRoom.roomName}`);
	}

	/**
	 * Flags the character to stop moving, will stop all loops next time it attempts to move.
	 */
	public stop() { this.active = false }

	/**
	 * Activates the character in the game. Like pressing a big "GO" button. Starts the wait -> roll -> move loop.
	 * Request the character to stop by calling .stop()
	 */
	public async activate() {
		if (!this.active) return;
		let waitSecs = config.moveDelay * 1000;

		Logger.debug(`${this.name} activated. Move interval: ${waitSecs}, AI Level: ${this.AI_LVL}`);

		while (this.active) {
			await new Promise(res => setTimeout(res, waitSecs));
			if (!this.active) break;

			let roll = Math.floor(Math.random() * 20) + 1;
			if (roll <= this.AI_LVL) {
				let nextRoom = this.pickNextRoom();

				if (nextRoom.isPlayerRoom && !nextRoom.hasVisitors()) {
					this.moveInto(nextRoom);
					this.onAttack.notify(this); // tell the game state manager we want to attack, it has the logic to run an attack
					break;  // break or else we could move again while in the player's room, will reactivate when sent back to spawn by game mgr
				} else if (!nextRoom.isPlayerRoom) {
					this.moveInto(nextRoom);
				}
			}
		}

		Logger.trace(`${this.name} movement loop stopped`);
	}

	/**
	 * Returns the character to their spawn and reactivates them.
	 */
	public returnToSpawn() {
		this.moveInto(this.spawnRoom);
		this.activate();
	}

	/**@returns an object with details needed to run the character in a loaded game */
	public extractState(): CharacterState {
		return {
			name: this.name,
			currentRoomName: this.currentRoom.roomName
		}
	}
}

/**The state of a character at a given moment in time */
export interface CharacterState {
	name: string,
	currentRoomName: string,  // when loading make sure to MOVE character into this room rather than just setting the current room explicitly
}