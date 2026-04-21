import { Character } from "./character.js";
import { Room } from "./room.js"
import { Vector3 } from "./vector3.js";


let initialRoom: Room;
let currentRoom: Room; // The current room we're renderering

/**
 * 
 * @param initialRoom The initial room to draw
 * @param newCharacters The set of all characters to subscribe to
 */
export function initializeRoomRenderer(initRoom: Room, newCharacters: Set<Character>) {
	// Subscribe to changes from characters
	newCharacters.forEach(character => {
		characters.add(character);
		character.onRoomChange.subscribe((_character) => {
			redraw();
		});
	});

	initialRoom = initRoom;
	resetRoom();
}

export function resetRoom() {
	// Initial redraw
	setCurrentRoom(initialRoom);
}

const staticImageElement: HTMLImageElement = document.querySelector('#room-static') as HTMLImageElement;
const characters: Set<Character> = new Set([]); // Set of characters to listen to

/**
 * Changes the currently rendered room.
 * @param room 
 */
export function setCurrentRoom(room: Room) {
	if (currentRoom != undefined) {
		currentRoom.htmlElement.classList.remove('current');
		currentRoom.backgroundElement.style.display = 'none';
	}

	currentRoom = room;
	currentRoom.htmlElement.classList.add('current');
	currentRoom.backgroundElement.style.display = 'block';
	redraw();

	staticImageElement.style.display = currentRoom.isPlayerRoom ? 'none' : 'block';
}

/**
 * Redraws the room.
 */
function redraw(): void {
	// Redraw the characters
	characters.forEach(character => {
		const isVisible: boolean = character.getCurrentRoom() == currentRoom;
		const position: Vector3 = currentRoom.getCharacterPosition(character.name);
		character.redraw(isVisible, position);
	});
}