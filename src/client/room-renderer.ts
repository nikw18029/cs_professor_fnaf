import { Character } from "./character.js";
import { Room } from "./room.js"
import { Vector2 } from "./vector2.js";

/**
 * 
 * @param initialRoom The initial room to draw
 * @param newCharacters The set of all characters to subscribe to
 */
export function initializeRoomRenderer(initialRoom : Room, newCharacters: Set<Character>) {
	// Subscribe to changes from characters
	newCharacters.forEach(character => {
		characters.add(character);
		character.onRoomChange.subscribe((_character) => {
			redraw();
		});
	});

	// Initial redraw
	setCurrentRoom(initialRoom);
}

let currentRoom : Room; // The current room we're renderering
const characters : Set<Character> = new Set([]); // Set of characters to listen to

/**
 * Changes the currently rendered room.
 * @param room 
 */
export function setCurrentRoom(room : Room) {
	currentRoom = room;
	redraw();
}

const roomImage : HTMLImageElement = document.querySelector('.room-img') as HTMLImageElement;
/**
 * Redraws the room.
 */
function redraw(): void {
	console.log(`background set to ${currentRoom.backgroundImage}.`);
	roomImage.src = currentRoom.backgroundImage;
	
	// Redraw the characters
	characters.forEach(character => {
		const isVisible : boolean = character.getCurrentRoom() == currentRoom;
		const position : Vector2 = currentRoom.getCharacterPosition(character.name);
		character.redraw(isVisible, position);
	});
}