import { Room } from "./room.js"
import { Character } from "./character.js"
import { Logger } from "./logger.js"

import config from "./../appcfg.json" with {type: "json"}

class GameStateMgr {
    rooms: Set<Room>;
    characters: Set<Character>;
    attackFlags: Promise<Character>[];
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
        b2.connectNeighbors([b1, a1, a2, this.playerRoom]);

        this.rooms = new Set([start, a1, a2, b1, b2]);

        // Register characters + flags
        let dummy = new Character("Dummy", start, [start, a1, a2]);

        this.characters = new Set([dummy]);

        this.attackFlags = Array.from(this.characters).map(c => c.getAttackFlag());
    }

    private resetTok() {
        this.stopTok = new Promise<void>(res => (this.resolveTok = res));
    }

    /**
     * Starts and runs the game loop.
     */
    public async runGame() {
        const gameDurationMins = (config.gameMins as number) * 60000;
        setTimeout(() => {
            Logger.debug("Time's up! Stopping game...");
            this.resolveTok();
        }, gameDurationMins);

        for (const c of this.characters) {
            c.activate(this.stopTok);
        }

        while(true){
            const currentFlags = Array.from(this.characters).map(c => c.getAttackFlag());

            // wait for something to attack or for cancellation token
            const result = await Promise.race([
                ...this.attackFlags,
                this.stopTok
            ]);

            if (result === undefined) { // stopTok triggered
                Logger.info("Game loop terminated by stop token.");
                break;

            } else if (result instanceof Character) {   // attack flag triggered
                let attackResult = this.doAttack(result);
                
                if(attackResult.success) {
                    Logger.info(`${result.name} attacked and successfully ended the game.`);
                    this.resolveTok();
                } else {
                    result.returnToSpawnAndResetFlag();
                }
            }
        }
        
    }

    private doAttack(c: Character) {
        // do attack action then return attacker to spawn
        Logger.info(`${c.name} attacked!`);
        return {success: false}   // denote whether the player died or not
    }
}