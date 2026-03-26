import { Room } from "./room.js"
import { Character } from "./character.js"
import { Logger } from "./logger.js"

class GameStateMgr {
    rooms: Set<Room>;
    characters: Set<Character>;
    attackFlags: Promise<void>[];
    playerRoom: Room;
    stopTok!: Promise<void>;    // Signals to subprocesses when the game is over and they need to stop
    resolveTok!: () => void;    // resolves stopTok

    constructor() {
        this.resetTok();

        // Register rooms
        let start = new Room("start");
        let a1 = new Room("a1");
        let a2 = new Room("a2");
        let b1 = new Room("b1");
        let b2 = new Room("b2");
        this.playerRoom = new Room("end", true);

        a1.connectNeighbors([start, b1, a2, b2]);
        a2.connectNeighbors([a1, b1, b2, this.playerRoom]);
        b1.connectNeighbors([start, a1, a2, b2]);
        b2.connectNeighbors([b1, b2, a2, this.playerRoom]);

        this.rooms = new Set([start, a1, a2, b1, b2]);

        // Register characters + flags
        let dummy = new Character("Dummy", start, [start, a1, a2]);

        this.characters = new Set([dummy]);

        this.attackFlags = [];
        for (const c of this.characters) {
            this.attackFlags.push(c.getAttackFlag());
        }
    }

    private resetTok() {
        this.stopTok = new Promise<void>(res => (this.resolveTok = res));
    }

    /**
     * Starts and runs the game loop.
     */
    public async run() {
        // todo: how to cancel things with stop tok? need to determine where resolves are coming from - do resolve("source")
        // todo: how to await a timeout and then trigger stop tok when game time exhausts

        for (const c of this.characters) {
            c.activate(this.stopTok);
        }


        // wait for something to attack
        await Promise.any(this.attackFlags);
    }

    private doAttack() {
        // do attack action then return attacker to spawn
    }
}