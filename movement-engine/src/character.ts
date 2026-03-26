import { Room } from "./room.js"
import { Logger } from "./logger.js"

import config from "./../appcfg.json" with {type: "json"}

export class Character {
    public readonly name: string;
    public readonly AI_LVL: number;
    private preferredRooms: Set<Room>;
    private spawnRoom: Room;
    private currentRoom: Room;

    private attackFlag!: Promise<void>;   // awaitable flag, use outside to detect when a character is attacking
    private resolveFlag!: () => void;   // resolves the flag's promise, triggers attack

    constructor(name: string, spawnRoom: Room, preferredRooms: Room[]) {
        this.name = name;
        this.preferredRooms = new Set(preferredRooms);
        this.AI_LVL = config[this.name as keyof typeof config] as number;    // ****
        this.spawnRoom = spawnRoom;
        this.currentRoom = spawnRoom;
        this.resetFlag();
    }

    private resetFlag() {
        this.attackFlag = new Promise<void>(res => (this.resolveFlag = res));
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
            throw new Error(`Character ${this.name} failed to pick a room.`);
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
     * This functions's promise completes when the character is ready to attack the player.
     * @returns the attack flag promise
     */
    public getAttackFlag() {
        return this.attackFlag;
    }

    /**
     * Activates the character in the game. Like pressing a big "GO" button. Starts the wait -> roll -> move loop.
     * @param cancellationToken flag which terminates the character's loop on completion. Resolve to stop the movement loop.
     */
    public async activate(cancellationToken: Promise<void>) {
        let waitSecs = config.moveDelay * 1000;

        Logger.debug(`${this.name} activated. Move interval: ${waitSecs}`);

        let result: { src: string };
        do {
            let rollDelay = new Promise<void>((resolve) => {
                setTimeout(() => {
                    //                                    (max - min + 1) + min
                    let roll = Math.floor(Math.random() * (20 - 1 + 1) + 1);    // roll to move
                    let nextRoom = this.pickNextRoom();

                    if (roll <= this.AI_LVL) {  // move
                        if (nextRoom.isPlayerRoom && !this.currentRoom.hasVisitors()) {
                            this.moveInto(nextRoom);
                            this.resolveFlag(); // trigger attack

                            // game state manager will sense the attack and take it from here.
                        } else if (!nextRoom.isPlayerRoom) {    // next room is regular room
                            this.moveInto(nextRoom);
                        }
                    }
                    resolve();
                }, waitSecs);
            });

            result = await Promise.race([
                cancellationToken.then(() => ({ src: "cancelled" })),
                rollDelay.then(() => ({ src: "roll" }))
            ]);
        } while (result.src != "cancelled");

        Logger.debug(`${this.name} movement stopped`);
    }
}