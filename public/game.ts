// Represents a point on a 2d plane, or a 2d direction.
interface Vector2 {
	x: number,
	y: number
}

// Represents a single room
class Room {
	// Name of the room
	name: string;
	// Image path to the room
	backgroundImage: string;

	// Determines the background image's zoom level, relative to the screen width
	zoom: number = 1.0;

	// Positions of the professors
	sandroPosition: Vector2 = { x : 0, y : 0 };
	bilitskiPosition: Vector2 = { x : 0, y : 0 };
	ohlPosition: Vector2 = { x : 0, y : 0 };
	deepakPosition: Vector2 = { x : 0, y : 0 };

	constructor(name: string, backgroundImage: string) {
		this.name = name;
		this.backgroundImage = backgroundImage;
	}

	// Call this to set the position of a particular professor. Returns the room so you can chain room setup.
	setProfessorPosition(key : string, position : Vector2): Room {
		switch (key) {
			case SANDRO_KEY:
				this.sandroPosition = position;
			case BILTISKI_KEY:
				this.bilitskiPosition = position;
			case OHL_KEY:
				this.ohlPosition = position;
			case DEEPAK_KEY:
				this.deepakPosition = position;
		}

		return this;
	}

	setZoom(zoom : number): Room {
		this.zoom = zoom;
		return this;
	}

	// Returns the width of the room's background image (in percentages), taking zooms into account.
	getBackgroundWidth(): number {
		return 100 * this.zoom;
	}
}

// Represents a professor
class Professor {
	name: string;
	room!: Room // The room this professor is currently in
	root: HTMLDivElement; // Reference to the sprite's root div element
	sprite: HTMLImageElement; // Reference to the sprite's img element
	scale: Vector2 = { x: 1.0, y: 1.0 }; // Sprite's scale
	defaultSpriteSize : Vector2 = { x : 128, y : 128 };

	constructor(name: string, root: HTMLDivElement, sprite: HTMLImageElement) {
		this.name = name;
		this.root = root;
		this.sprite = sprite;
		this.setScale({ x: 1.0, y: 1.0 });
	}

	isVisible(): boolean {
		return this.room == currentRoom;
	}

	setRoom(newRoom: Room): void {
		this.room = newRoom;
	}

	setScale(newScale: Vector2): void {
		this.scale = newScale;

		const scaledSize: Vector2 = this.getScaledSize();
		this.sprite.style.width = `${scaledSize.x}px`;
		this.sprite.style.height = `${scaledSize.y}px`;
	}

	getScaledSize(): Vector2 {
		const size : Vector2 = this.getSpriteSize();
		return { x: size.x * this.scale.x * windowScale, y: size.y * this.scale.y * windowScale };
	}

	// Sets the professor's current sprite.
	setSprite(newSrc: string): void {
		this.sprite.src = `img/${newSrc}.png`;
	}

	getSpriteSize(): Vector2 {
		const size : Vector2 = this.defaultSpriteSize;
		if (this.sprite.naturalWidth != 0)
			size.x = this.sprite.naturalWidth;
		if (this.sprite.naturalHeight != 0)
			size.y = this.sprite.naturalHeight;
		return size;
	}

	// Called from redrawRoom()
	redraw(): void {
		// Apply position
		const position: Vector2 = this.getPosition();
		this.root.style.left = `${position.x * windowScale}px`;
		this.root.style.top = `${position.y * windowScale}px`;
		this.root.style.visibility = this.isVisible() ? 'visible' : 'hidden'; // Apply visibility
	}

	// Returns the position of this professor in the current room.
	getPosition(): Vector2 {
		switch (this.name) {
			case SANDRO_KEY:
				return currentRoom.sandroPosition;
			case BILTISKI_KEY:
				return currentRoom.bilitskiPosition;
			case OHL_KEY:
				return currentRoom.ohlPosition;
			case DEEPAK_KEY:
				return currentRoom.deepakPosition;
		}

		return { x: 0, y: 0 };
	}
}

// Game screen setup
const room: HTMLDivElement = document.querySelector('#room') as HTMLDivElement;
const roomImg: HTMLImageElement = document.querySelector('#room-img') as HTMLImageElement;
// Reference size of the window. Everything resizes based on this resolution.
const BASE_WINDOW_SIZE = { x: 800, y: 600 };
// Current window scale based on the reference resolution. Updated whenever the window resizes.
let windowScale = calculateWindowScale();
// Returns the scale ratio of the current window
function calculateWindowScale(): number {
	let rect : DOMRect = room.getBoundingClientRect();
	return rect.width / BASE_WINDOW_SIZE.x;
}

// Keys for professors
const SANDRO_KEY: string = 'sandro';
const BILTISKI_KEY: string = 'bilitski';
const OHL_KEY: string = 'ohl';
const DEEPAK_KEY: string = 'deepak';

// Global references to game elements
const sandro: Professor = createProfessor(SANDRO_KEY);
const bilitski: Professor = createProfessor(BILTISKI_KEY);
const ohl: Professor = createProfessor(OHL_KEY);
const deepak: Professor = createProfessor(DEEPAK_KEY);

// Test rooms
const room1: Room = new Room('stage', 'stage')
	.setProfessorPosition(SANDRO_KEY, { x: 100, y: 50 })
	.setProfessorPosition(BILTISKI_KEY, { x: 10, y: 200 })
	.setProfessorPosition(OHL_KEY, { x: 200, y: 100 })
	.setProfessorPosition(DEEPAK_KEY, { x: 500, y: 50 })
	
	const room2: Room = new Room('help_desk', 'door closed')
	.setProfessorPosition(SANDRO_KEY, { x: 100, y: 0 })
	.setProfessorPosition(BILTISKI_KEY, { x: 10, y: 0 })
	.setProfessorPosition(OHL_KEY, { x: 200, y: 0 })
	.setProfessorPosition(DEEPAK_KEY, { x: 500, y: 0 })

// The current room the player is in
let currentRoom: Room = room1;

// Redraws the current room
function redrawRoom(): void {
	// Update room
	roomImg.src = `img/background/${currentRoom.backgroundImage}.jpg`;
	roomImg.style.width = `${currentRoom.getBackgroundWidth()}%`;

	sandro.redraw();
	bilitski.redraw();
	ohl.redraw();
	deepak.redraw();
}

// Creates a professor object and adds it as a child of the room element.
function createProfessor(name: string): Professor {
	// Create root div
	const rootElement: HTMLDivElement = document.createElement('div');
	rootElement.classList.add('professor-rect')

	// Create img element
	const spriteElement: HTMLImageElement = document.createElement('img');
	spriteElement.classList.add('professor-sprite');
	rootElement.appendChild(spriteElement);

	const professor = new Professor(name, rootElement, spriteElement);
	professor.setSprite(name);

	room.appendChild(rootElement); // Add professor div to the game screen
	return professor;
}

function changeRoom(newRoom: Room): void {
	// TODO Hide old sprites, show new sprites
	currentRoom = newRoom;
}

// Called whenever the window size changes.
function onWindowScaled(): void {
	windowScale = calculateWindowScale(); // Update window scale

	// Force objects to re-scale
	sandro.setScale(sandro.scale);
	bilitski.setScale(bilitski.scale);
	ohl.setScale(ohl.scale);
	deepak.setScale(deepak.scale);

	redrawRoom();
}

// TODO Replace this with proper camera system
document.addEventListener('keydown', (e : KeyboardEvent) => {
	if(currentRoom == room1)
		changeRoom(room2);
	else
		changeRoom(room1);
	
	// TODO Make these based on movement patterns
	sandro.setRoom(room2);
	bilitski.setRoom(room1);
	ohl.setRoom(room2);
	deepak.setRoom(room1);
	redrawRoom();
});

// Handle window resizing
window.addEventListener('resize', (_e) => {
	onWindowScaled();
});

onWindowScaled();