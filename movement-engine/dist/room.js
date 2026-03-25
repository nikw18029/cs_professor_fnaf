"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
class Room {
    htmlID;
    visitors;
    isPlayerRoom;
    visitorsChangedFlag; // awaitable flag, use to detect changes to visitors
    resolveFlag; // resolves the flag's promise
    constructor(htmlID, isPlayerRoom = false) {
        this.htmlID = htmlID;
        this.visitors = [];
        this.setFlag();
        this.isPlayerRoom = isPlayerRoom;
    }
    setFlag() {
        this.visitorsChangedFlag = new Promise(res => (this.resolveFlag = res));
    }
    /**
     * Use to await for updates to the room's state, to know when to redraw.
     * @returns a promise fufilled when any character has entered or exited this room.
     */
    detectMove() {
        return this.visitorsChangedFlag;
    }
    /**
     * Adds a visitor into the room
     * @param entering the character entering this room
     */
    visitorEnter(entering) {
        this.visitors.push(entering);
        this.resolveFlag(); // complete any awaits
        this.setFlag(); // reset
    }
    /**
     * Removes a visitor from the room
     * @param exiting the character exiting this room (use this)
     */
    visitorExit(exiting) {
        let idx = this.visitors.indexOf(exiting);
        delete this.visitors[idx];
        this.resolveFlag();
        this.setFlag();
    }
}
exports.Room = Room;
//# sourceMappingURL=room.js.map