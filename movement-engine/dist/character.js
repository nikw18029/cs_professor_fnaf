import { Logger } from "./logger.js";
import config from "./../appcfg.json" with { type: "json" };
import { Observable } from "./observable.js";
/**
 * A character that can move and trigger an attack
 */
export class Character {
    /**Must be verbaitum what is in appcfg*/
    name;
    AI_LVL;
    preferredRooms;
    spawnRoom;
    currentRoom;
    active;
    onAttack;
    constructor(name, spawnRoom, preferredRooms) {
        this.name = name;
        this.preferredRooms = new Set(preferredRooms);
        this.AI_LVL = config[this.name]; // ****
        this.spawnRoom = spawnRoom;
        this.currentRoom = spawnRoom;
        this.currentRoom.visitorEnter(this);
        this.onAttack = new Observable();
        this.active = true;
    }
    pickNextRoom() {
        const preferredNeighbors = [];
        for (const neighbor of this.currentRoom.neighbors) {
            if (neighbor.isPlayerRoom) { // Prefer player room: if one of the neigbhors is the player's room, make this more likely
                // to choose player's room and skip room selection. Scales with ai lvl
                let roll = Math.floor(Math.random() * 20) + 1;
                if (roll <= this.AI_LVL) {
                    return neighbor;
                }
            }
            else if (this.preferredRooms.has(neighbor)) {
                preferredNeighbors.push(neighbor);
            }
        }
        const pool = preferredNeighbors.length > 0
            ? preferredNeighbors
            : Array.from(this.currentRoom.neighbors); // as a fallback if none of the neighbors are preferred then any neighbors are an option
        if (pool.length === 0) {
            Logger.critical(`Character ${this.name} failed to pick a room.`);
        }
        return pool[Math.floor(Math.random() * pool.length)]; // if player room is failed to roll earlier it can still be selected here.
    }
    moveInto(newRoom) {
        this.currentRoom.visitorExit(this);
        newRoom.visitorEnter(this);
        this.currentRoom = newRoom;
        Logger.debug(`${this.name} moved to ${newRoom.htmlID}`);
    }
    /**
     * Flags the character to stop moving, will stop all loops next time it attempts to move.
     */
    stop() { this.active = false; }
    /**
     * Activates the character in the game. Like pressing a big "GO" button. Starts the wait -> roll -> move loop.
     * Request the character to stop by calling .stop()
     */
    async activate() {
        if (!this.active)
            return;
        let waitSecs = config.moveDelay * 1000;
        Logger.debug(`${this.name} activated. Move interval: ${waitSecs}`);
        while (this.active) {
            await new Promise(res => setTimeout(res, waitSecs));
            if (!this.active)
                break;
            let roll = Math.floor(Math.random() * 20) + 1;
            if (roll <= this.AI_LVL) {
                let nextRoom = this.pickNextRoom();
                if (nextRoom.isPlayerRoom && !nextRoom.hasVisitors()) {
                    this.moveInto(nextRoom);
                    this.onAttack.notify(this); // tell the game state manager we want to attack, it has the logic to run an attack
                    break; // break or else we could move again while in the player's room, will reactivate when sent back to spawn by game mgr
                }
                else if (!nextRoom.isPlayerRoom) {
                    this.moveInto(nextRoom);
                }
            }
        }
        Logger.trace(`${this.name} movement loop stopped`);
    }
    /**
     * Returns the character to their spawn and reactivates them.
     */
    returnToSpawn() {
        this.moveInto(this.spawnRoom);
        this.activate();
    }
}
//# sourceMappingURL=character.js.map