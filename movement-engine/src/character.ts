import { Room } from "./room.js"
import { Logger } from "./logger.js"
import config from "./../appcfg.json" with {type: "json"}
import { Observable } from "./observable.js";

/**
 * A character that can move and trigger an attack
 */
export class Character {
    public readonly name: string;
    public readonly AI_LVL: number;
    private preferredRooms: Set<Room>;
    private spawnRoom: Room;
    private currentRoom: Room;
    private active: boolean;
    public onAttack: Observable<Character>;

    constructor(name: string, spawnRoom: Room, preferredRooms: Room[]) {
        this.name = name;
        this.preferredRooms = new Set(preferredRooms);
        this.AI_LVL = config[this.name as keyof typeof config] as number;    // ****
        this.spawnRoom = spawnRoom;

        this.currentRoom = spawnRoom;
        this.currentRoom.visitorEnter(this);
        
        this.onAttack = new Observable<Character>();
        this.active = true;
    }

    private pickNextRoom(): Room {
        const preferredNeighbors: Room[] = [];
        for (const neighbor of this.currentRoom.neighbors) {
            if (this.preferredRooms.has(neighbor)) {
                preferredNeighbors.push(neighbor);
            }
        }

        const pool = preferredNeighbors.length > 0
            ? preferredNeighbors
            : Array.from(this.currentRoom.neighbors);

        if (pool.length === 0) {
            Logger.critical(`Character ${this.name} failed to pick a room.`);
        }

        return pool[Math.floor(Math.random() * pool.length)] as Room;
    }

    private moveInto(newRoom: Room) {
        this.currentRoom.visitorExit(this);
        newRoom.visitorEnter(this);
        this.currentRoom = newRoom;
        Logger.debug(`${this.name} moved to ${newRoom.htmlID}`);
    }

    /**
     * Flags the character to stop moving, will stop next time it attempts to move.
     */
    public stop() { this.active = false }

    /**
     * Activates the character in the game. Like pressing a big "GO" button. Starts the wait -> roll -> move loop.
     * Request the character to stop by calling .stop()
     */
    public async activate() {
        if(!this.active) return;
        let waitSecs = config.moveDelay * 1000;

        Logger.debug(`${this.name} activated. Move interval: ${waitSecs}`);

        while(this.active){
            await new Promise(res => setTimeout(res, waitSecs));
            if(!this.active) break;

            let roll = Math.floor(Math.random() * 20) + 1;
            if (roll <= this.AI_LVL) {
                let nextRoom = this.pickNextRoom();
                
                if (nextRoom.isPlayerRoom && !nextRoom.hasVisitors()) {
                    this.moveInto(nextRoom);
                    this.onAttack.notify(this); // tell the game state manager we want to attack, it has the logic to run an attack
                    break;  // break or else we could move again while in the player's room, will reactivate sent back to spawn
                } else if(!nextRoom.isPlayerRoom) {
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
}