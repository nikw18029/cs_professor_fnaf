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
	private isAttacking: boolean = false;
	private attackTimer: number = 0;
	private currentPosition: Vector3 = { x: 0, y: 0, z: 0 };
	private attackStartPosition: Vector3 = { x: 0, y: 0, z: 0 };
	private readonly BASE_SCALE_FACTOR: number = 20;
	private readonly ATTACK_END_POSITION: Vector3 = { x: 0, y: 0, z: 150 / this.BASE_SCALE_FACTOR };
	private readonly JUMPSCARE_FPS: number = 1000 / 30;
	private readonly ATTACK_ANIMATION_LENGTH: number = .4 * 1000;
	private readonly ATTACK_DELAY: number = 1.5 * 1000;

	constructor(name: string, spawnRoom: Room, preferredRooms: Room[]) {
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

		const parent: HTMLElement = document.querySelector("#img-screen") as HTMLElement;
		parent.appendChild(this.spriteElement);
	}

	public startAttack(): void {
		this.attackStartPosition = this.currentPosition;
		this.currentPosition = { x: this.attackStartPosition.x, y: this.attackStartPosition.y, z: this.attackStartPosition.z };

		this.attackTimer = 0;
		this.isAttacking = true;
		this.animateAttack();
		Logger.info(`${this.name} is attacking!`);
	}

	public animateAttack(): void {
		this.attackTimer += this.JUMPSCARE_FPS;

		let t: number = this.attackTimer / this.ATTACK_ANIMATION_LENGTH; // Scale ratio
		t = Math.min(t, 1); // Clamp to [0, 1] 

		// Animate the sprite
		this.currentPosition.x = this.lerp(this.attackStartPosition.x, this.ATTACK_END_POSITION.x, t);
		this.currentPosition.y = this.lerp(this.attackStartPosition.y, this.ATTACK_END_POSITION.y, t);
		this.currentPosition.z = this.lerp(this.attackStartPosition.z, this.ATTACK_END_POSITION.z, t);
		this.redrawSpritePosition();

		if (this.attackTimer >= this.ATTACK_ANIMATION_LENGTH) {
			this.applyAttack();
			return;
		}

		setTimeout(() => {
			this.animateAttack();
		}, this.JUMPSCARE_FPS);
	}

	public applyAttack(): void {
		this.attackTimer = 0;
		this.isAttacking = false;
		this.onAttack.notify(this);
	}

	private lerp(a: number, b: number, t: number): number {
		// Basic linear interpolation function
		return a + (b - a) * t;
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
		this.spriteElement.style.display = isVisible ? 'block' : 'none';

		if (this.isAttacking) // Don't redraw attackers' positions
			return;

		this.currentPosition = position;
		this.spriteElement.style.zIndex = `${Math.round(position.y * Math.abs(position.z))}`;
		this.redrawSpritePosition();
	}

	private redrawSpritePosition() {
		this.spriteElement.style.left = `${this.currentPosition.x}%`;
		this.spriteElement.style.top = `${this.currentPosition.y}%`;
		this.spriteElement.style.width = `${this.BASE_SCALE_FACTOR * Math.abs(this.currentPosition.z)}%`;
		this.spriteElement.style.transform = `scaleX(${Math.sign(this.currentPosition.z)})`;
	}

	/** I'd really rather this be private. Try not to call this if you can help it. */
	public moveInto(newRoom: Room) {
		this.currentRoom.visitorExit(this);
		newRoom.visitorEnter(this);
		this.currentRoom = newRoom;
		this.currentPosition = this.currentRoom.getCharacterPosition(this.name);
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

			if (this.isAttacking) continue; // Don't try to move rooms when attacking

			let roll = Math.floor(Math.random() * 20) + 1;
			if (roll <= this.AI_LVL) {
				let nextRoom = this.pickNextRoom();

				if (nextRoom.isPlayerRoom && !nextRoom.hasVisitors()) {
					this.moveInto(nextRoom);
					setTimeout(() => {
						this.startAttack(); // Start attacking
					}, this.ATTACK_DELAY);
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