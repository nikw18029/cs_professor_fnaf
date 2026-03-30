// Represents a single room
var Room = /** @class */ (function () {
    function Room(name, backgroundImage) {
        // Determines the background image's zoom level, relative to the screen width
        this.zoom = 1.0;
        // Positions of the professors
        this.sandroPosition = { x: 0, y: 0 };
        this.bilitskiPosition = { x: 0, y: 0 };
        this.ohlPosition = { x: 0, y: 0 };
        this.deepakPosition = { x: 0, y: 0 };
        this.name = name;
        this.backgroundImage = backgroundImage;
    }
    // Call this to set the position of a particular professor. Returns the room so you can chain room setup.
    Room.prototype.setProfessorPosition = function (key, position) {
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
    };
    Room.prototype.setZoom = function (zoom) {
        this.zoom = zoom;
        return this;
    };
    // Returns the width of the room's background image (in percentages), taking zooms into account.
    Room.prototype.getBackgroundWidth = function () {
        return 100 * this.zoom;
    };
    return Room;
}());
// Represents a professor
var Professor = /** @class */ (function () {
    function Professor(name, root, sprite) {
        this.scale = { x: 1.0, y: 1.0 }; // Sprite's scale
        this.defaultSpriteSize = { x: 128, y: 128 };
        this.name = name;
        this.root = root;
        this.sprite = sprite;
        this.setScale({ x: 1.0, y: 1.0 });
    }
    Professor.prototype.isVisible = function () {
        return this.room == currentRoom;
    };
    Professor.prototype.setRoom = function (newRoom) {
        this.room = newRoom;
    };
    Professor.prototype.setScale = function (newScale) {
        this.scale = newScale;
        var scaledSize = this.getScaledSize();
        this.sprite.style.width = "".concat(scaledSize.x, "px");
        this.sprite.style.height = "".concat(scaledSize.y, "px");
    };
    Professor.prototype.getScaledSize = function () {
        var size = this.getSpriteSize();
        return { x: size.x * this.scale.x * windowScale, y: size.y * this.scale.y * windowScale };
    };
    // Sets the professor's current sprite.
    Professor.prototype.setSprite = function (newSrc) {
        this.sprite.src = "img/".concat(newSrc, ".png");
    };
    Professor.prototype.getSpriteSize = function () {
        var size = this.defaultSpriteSize;
        if (this.sprite.naturalWidth != 0)
            size.x = this.sprite.naturalWidth;
        if (this.sprite.naturalHeight != 0)
            size.y = this.sprite.naturalHeight;
        return size;
    };
    // Called from redrawRoom()
    Professor.prototype.redraw = function () {
        // Apply position
        var position = this.getPosition();
        this.root.style.left = "".concat(position.x * windowScale, "px");
        this.root.style.top = "".concat(position.y * windowScale, "px");
        this.root.style.visibility = this.isVisible() ? 'visible' : 'hidden'; // Apply visibility
    };
    // Returns the position of this professor in the current room.
    Professor.prototype.getPosition = function () {
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
    };
    return Professor;
}());
// Game screen setup
var room = document.querySelector('#room');
var roomImg = document.querySelector('#room-img');
// Reference size of the window. Everything resizes based on this resolution.
var BASE_WINDOW_SIZE = { x: 800, y: 600 };
// Current window scale based on the reference resolution. Updated whenever the window resizes.
var windowScale = calculateWindowScale();
// Returns the scale ratio of the current window
function calculateWindowScale() {
    var rect = room.getBoundingClientRect();
    return rect.width / BASE_WINDOW_SIZE.x;
}
// Keys for professors
var SANDRO_KEY = 'sandro';
var BILTISKI_KEY = 'bilitski';
var OHL_KEY = 'ohl';
var DEEPAK_KEY = 'deepak';
// Global references to game elements
var sandro = createProfessor(SANDRO_KEY);
var bilitski = createProfessor(BILTISKI_KEY);
var ohl = createProfessor(OHL_KEY);
var deepak = createProfessor(DEEPAK_KEY);
// Test rooms
var room1 = new Room('stage', 'stage')
    .setProfessorPosition(SANDRO_KEY, { x: 100, y: 50 })
    .setProfessorPosition(BILTISKI_KEY, { x: 10, y: 200 })
    .setProfessorPosition(OHL_KEY, { x: 200, y: 100 })
    .setProfessorPosition(DEEPAK_KEY, { x: 500, y: 50 });
var room2 = new Room('help_desk', 'door closed')
    .setProfessorPosition(SANDRO_KEY, { x: 100, y: 0 })
    .setProfessorPosition(BILTISKI_KEY, { x: 10, y: 0 })
    .setProfessorPosition(OHL_KEY, { x: 200, y: 0 })
    .setProfessorPosition(DEEPAK_KEY, { x: 500, y: 0 });
// The current room the player is in
var currentRoom = room1;
// Redraws the current room
function redrawRoom() {
    // Update room
    roomImg.src = "img/background/".concat(currentRoom.backgroundImage, ".jpg");
    roomImg.style.width = "".concat(currentRoom.getBackgroundWidth(), "%");
    sandro.redraw();
    bilitski.redraw();
    ohl.redraw();
    deepak.redraw();
}
// Creates a professor object and adds it as a child of the room element.
function createProfessor(name) {
    // Create root div
    var rootElement = document.createElement('div');
    rootElement.classList.add('professor-rect');
    // Create img element
    var spriteElement = document.createElement('img');
    spriteElement.classList.add('professor-sprite');
    rootElement.appendChild(spriteElement);
    var professor = new Professor(name, rootElement, spriteElement);
    professor.setSprite(name);
    room.appendChild(rootElement); // Add professor div to the game screen
    return professor;
}
function changeRoom(newRoom) {
    // TODO Hide old sprites, show new sprites
    currentRoom = newRoom;
}
// Called whenever the window size changes.
function onWindowScaled() {
    windowScale = calculateWindowScale(); // Update window scale
    // Force objects to re-scale
    sandro.setScale(sandro.scale);
    bilitski.setScale(bilitski.scale);
    ohl.setScale(ohl.scale);
    deepak.setScale(deepak.scale);
    redrawRoom();
}
// TODO Replace this with proper camera system
document.addEventListener('keydown', function (e) {
    if (currentRoom == room1)
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
window.addEventListener('resize', function (_e) {
    onWindowScaled();
});
onWindowScaled();
