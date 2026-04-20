import { CharacterState } from "./character.js"
import { Room } from "./room.js"
import { Character } from "./character.js"
import { Logger } from "./logger.js"
import { bindUI } from "./ui-bridge.js"
import { initializeRoomRenderer } from "./room-renderer.js"
import { Observable } from "./observable.js"

import config from "./config.js"
import { start } from "repl"

/**
 * The orchestrator for the game
 */
export class GameStateMgr {
	rooms: Set<Room>;
	characters: Set<Character>;
	playerRoom: Room;
	onTimerUpdate: Observable<number>;
	hourTimerID: ReturnType<typeof setTimeout> | null = null;
	onPlayerKilled: Observable<void>;
	isPlayerKilled: boolean = false;

	// hide tracking
	isPlayerHidden: boolean = false;
	onHideToggled: Observable<boolean>;
	onHideStateChanged: Observable<{ canHide: boolean; forceUnhide: boolean }>;
	private hideStartTime: number = 0;
	private forceUnhideTimer: ReturnType<typeof setTimeout> | null = null;
	private cooldownTimer: ReturnType<typeof setTimeout> | null = null;
	private hideCooldownActive: boolean = false;

	private readonly SANDRO_KEY = "sandro";
	private readonly OHL_KEY = "ohl";
	private readonly BILITSKI_KEY = "bilitski";
	private readonly DEEPAK_KEY = "deepak";

	constructor() {
		this.onPlayerKilled = new Observable();

		// Build Map
		const backEntry = new Room("back entry", 1)
			.setPosition(50, 20)
			.setCharacterPosition(this.SANDRO_KEY, { x: 35, y: 45, z: -1 })
			.setCharacterPosition(this.BILITSKI_KEY, { x: 70, y: 60, z: -2 })
			.setCharacterPosition(this.OHL_KEY, { x: 50, y: 50, z: 1.2 })
			.setCharacterPosition(this.DEEPAK_KEY, { x: 8, y: 50, z: 1.5 });
		const classroomA = new Room("class a", 1)
			.setPosition(25, 60)
			.setCharacterPosition(this.SANDRO_KEY, { x: 50, y: 55, z: -0.5 })
			.setCharacterPosition(this.BILITSKI_KEY, { x: 41, y: 56, z: 0.45 })
			.setCharacterPosition(this.OHL_KEY, { x: 47, y: 60, z: -2 })
			.setCharacterPosition(this.DEEPAK_KEY, { x: 8, y: 58, z: 0.6 });
		const classroomB = new Room("class b", 1)
			.setPosition(75, 60)
			.setCharacterPosition(this.SANDRO_KEY, { x: 40, y: 60, z: -2 })
			.setCharacterPosition(this.BILITSKI_KEY, { x: 38, y: 50, z: 0.8 })
			.setCharacterPosition(this.OHL_KEY, { x: 52, y: 48, z: 0.5 })
			.setCharacterPosition(this.DEEPAK_KEY, { x: 8, y: 58, z: 2 });
		const wingA = new Room("wing a", 1)
			.setPosition(35, 50)
			.setCharacterPosition(this.SANDRO_KEY, { x: -5, y: 40, z: 3 })
			.setCharacterPosition(this.BILITSKI_KEY, { x: 60, y: 56, z: -2 })
			.setCharacterPosition(this.OHL_KEY, { x: 35, y: 40, z: 0.8 })
			.setCharacterPosition(this.DEEPAK_KEY, { x: 50.5, y: 38, z: -0.3 });
		const lowerStairs = new Room("lower stairs", 1)
			.setPosition(65, 50)
			.setCharacterPosition(this.SANDRO_KEY, { x: 45, y: 0, z: -0.8 })
			.setCharacterPosition(this.BILITSKI_KEY, { x: -5, y: 60, z: 2 })
			.setCharacterPosition(this.OHL_KEY, { x: 58, y: 42, z: 1.5 })
			.setCharacterPosition(this.DEEPAK_KEY, { x: 15, y: 42, z: -0.4 });

		classroomA.connectNeighbors([wingA]);
		classroomB.connectNeighbors([lowerStairs]);
		wingA.connectNeighbors([classroomA, lowerStairs]);
		backEntry.connectNeighbors([lowerStairs]);
		lowerStairs.connectNeighbors([backEntry, wingA, classroomB]);

		// Second floor rooms
		const offices = new Room("offices", 2)
			.setPosition(35, 20)
			.setCharacterPosition(this.SANDRO_KEY, { x: 56, y: 52, z: -0.5 })
			.setCharacterPosition(this.BILITSKI_KEY, { x: 90, y: 60, z: 1 })
			.setCharacterPosition(this.OHL_KEY, { x: 65, y: 70, z: 1.5 })
			.setCharacterPosition(this.DEEPAK_KEY, { x: 15, y: 55, z: -0.5 });
		const upperHall = new Room("upper hall", 2)
			.setPosition(50, 50)
			.setCharacterPosition(this.SANDRO_KEY, { x: 50, y: 62, z: 0.8 })
			.setCharacterPosition(this.BILITSKI_KEY, { x: 45, y: 62, z: 0.3 })
			.setCharacterPosition(this.OHL_KEY, { x: 40, y: 70, z: -1.5 })
			.setCharacterPosition(this.DEEPAK_KEY, { x: 41, y: 60, z: -0.2 });
		const upperStairs = new Room("upper stairs", 2)
			.setPosition(65, 80)
			.setCharacterPosition(this.SANDRO_KEY, { x: 80, y: 50, z: 1.5 })
			.setCharacterPosition(this.BILITSKI_KEY, { x: 20, y: 65, z: -0.4 })
			.setCharacterPosition(this.OHL_KEY, { x: 32, y: 55, z: 0.8 })
			.setCharacterPosition(this.DEEPAK_KEY, { x: 14, y: 55, z: 0.2 });
		this.playerRoom = new Room("window", 2, true)
			.setPosition(35, 50)
			.setCharacterPosition(this.SANDRO_KEY, { x: 42, y: 40, z: 1 })
			.setCharacterPosition(this.BILITSKI_KEY, { x: 42, y: 40, z: 1 })
			.setCharacterPosition(this.OHL_KEY, { x: 42, y: 40, z: 1 })
			.setCharacterPosition(this.DEEPAK_KEY, { x: 42, y: 40, z: 1 });
		upperStairs.connectNeighbors([upperHall, lowerStairs, this.playerRoom]);
		upperHall.connectNeighbors([offices, backEntry, this.playerRoom]);

		this.rooms = new Set([backEntry, classroomA, wingA, classroomB, lowerStairs,
			offices, upperHall, upperStairs, this.playerRoom]);

		// bind to html
		this.onTimerUpdate = new Observable<number>();
		this.onHideToggled = new Observable<boolean>();
		this.onHideStateChanged = new Observable<{ canHide: boolean; forceUnhide: boolean }>();

		this.onHideToggled.subscribe((wantsToHide) => {
			if (wantsToHide) {
				this.startHiding();
			} else {
				this.stopHiding(false);
			}
		});
		bindUI(this.rooms, this.onTimerUpdate, this.onHideStateChanged, this.onPlayerKilled);

		// characters and attack observers
		let sandro = new Character(this.SANDRO_KEY, classroomA, [classroomA, wingA, this.playerRoom]);
		let ohl = new Character(this.OHL_KEY, classroomB, [lowerStairs, this.playerRoom]);
		let bilitski = new Character(this.BILITSKI_KEY, backEntry, [classroomA, this.playerRoom]);
		let deepak = new Character(this.DEEPAK_KEY, offices, [offices, this.playerRoom]);
		this.characters = new Set([sandro, ohl, bilitski, deepak]);

		for (const c of this.characters) {
			c.onAttack.subscribe((attacker) => {
				this.handleAttack(attacker);
			});
		}

		initializeRoomRenderer(this.playerRoom, this.characters);
	}

	/**
	 * Starts up each character, runs a timer.
	 * @param startHour - the hour from which to start the game from. use when loading games
	 */
	public async runGame(startHour: GameHour = 0) {
		this.onTimerUpdate.notify(startHour);

		const gameDurationMins = (config.gameMins as number) * 60000;
		const hourInterval = gameDurationMins / 6;

		this.characters.forEach(c => c.activate());

		const runHour = (hour: number, interval: number) => {
			if (hour > 6) return;

			this.hourTimerID = setTimeout(() => {
				this.onTimerUpdate.notify(hour);

				if (hour === 6) {
					this.stopGame();
				} else {
					this.saveCurrentState(hour);
					runHour(hour + 1, interval);
				}
			}, interval);
		};

		runHour(startHour + 1, hourInterval);
	}

	/**Initializes character positions from a saved state and ALSO starts the game. */
	public loadGame(gameState: GameState): boolean {
		if (!gameState || gameState.playerKilled) return false;

		Logger.trace("Attempting to load from game state");

		// move each character into the right room
		gameState.characterStates.forEach((cs) => {
			let wasAbleToLoad = false;
			for (const c of this.characters) {	// nab character
				if (c.name == cs.name) {
					for (const r of this.rooms) { // nab room
						if (r.roomName == cs.currentRoomName) {
							c.moveInto(r);
							wasAbleToLoad = true;
						}
					}
				}
			}

			if (!wasAbleToLoad) {
				Logger.warn("Failed to load a character from state: " + cs + " -- character will start at their spawn if they exist");
			}
		});

		this.runGame(gameState.currentHour); // start game
		Logger.info("Loaded game from existing state.")
		return true
	}

	/**
	 * Requests to stop game loops.
	 */
	public stopGame() {
		if (this.hourTimerID) clearTimeout(this.hourTimerID);
		if (this.forceUnhideTimer) clearTimeout(this.forceUnhideTimer);
		if (this.cooldownTimer) clearTimeout(this.cooldownTimer);
		this.characters.forEach(c => c.stop());
		Logger.info("Game stopped");

		const winAudio: HTMLAudioElement = document.querySelector('#win-audio') as HTMLAudioElement;
		winAudio.play();
	}

	private startHiding() {
		if (this.hideCooldownActive) {
			Logger.trace("Hide blocked — on cooldown");
			return;
		}

		this.isPlayerHidden = true;
		this.hideStartTime = Date.now();
		Logger.trace("Player started hiding");

		// force-stop after max duration
		this.forceUnhideTimer = setTimeout(() => {
			Logger.info("Hide time exceeded — forcing unhide");
			this.stopHiding(true);
		}, config.hideTimeMaxSecs * 1000);
	}

	/**
	 * @param forced true if the hide was ended by the timer, not the player
	 */
	private stopHiding(forced: boolean) {
		if (!this.isPlayerHidden) return; // no-op if already unhidden

		this.isPlayerHidden = false;
		if (this.forceUnhideTimer) {
			clearTimeout(this.forceUnhideTimer);
			this.forceUnhideTimer = null;
		}

		const hideDurationSecs = (Date.now() - this.hideStartTime) / 1000;
		Logger.trace(`Player hid for ${hideDurationSecs.toFixed(1)}s`);

		// tell UI to reset the button
		if (forced) {
			this.onHideStateChanged.notify({ canHide: false, forceUnhide: true });
		}

		// start cooldown scaled to how long player hid
		this.startCooldown(hideDurationSecs);
	}

	private startCooldown(hideDurationSecs: number) {
		const cooldownMs = hideDurationSecs * 2 * 1000;
		this.hideCooldownActive = true;
		this.onHideStateChanged.notify({ canHide: false, forceUnhide: false });
		Logger.trace(`Hide cooldown: ${(cooldownMs / 1000).toFixed(1)}s`);

		this.cooldownTimer = setTimeout(() => {
			this.hideCooldownActive = false;
			this.cooldownTimer = null;
			this.onHideStateChanged.notify({ canHide: true, forceUnhide: false });
			Logger.trace("Hide cooldown ended");
		}, cooldownMs);
	}

	private handleAttack(c: Character) {
		if (this.isPlayerKilled) return;

		Logger.info(`${c.name} is attacking!`);

		let attackTimeout = config.attackSecsElapsed - config.attackTTK;
		setTimeout(() => {  // initial TTK timeout, (wait for TTK to elapse)
			// try to kill at beginning and end of actual attack
			this.tryKillPlayer();
			setTimeout(() => {
				this.tryKillPlayer();

				if (this.isPlayerKilled) {
					Logger.info("Player was killed!");
					this.onPlayerKilled.notify();
					this.stopGame();
				} else {
					Logger.info("Player survived attack.");
					c.returnToSpawn();
				}
			}, attackTimeout * 1000);
		}, config.attackTTK * 1000);
	}

	private tryKillPlayer() {
		if (!this.isPlayerHidden) {
			this.isPlayerKilled = true;
			this.saveCurrentState(0);
		}
	}

	private async saveCurrentState(currHour: number) {
		Logger.debug("Saving the current game state.");

		if (currHour > 5 || currHour < 0) throw new Error("The current hour passed in is invalid");

		let characterStates: CharacterState[] = [];

		this.characters.forEach((c) => {
			characterStates.push(c.extractState())
		});

		const state = {
			playerKilled: this.isPlayerKilled,
			currentHour: currHour,
			characterStates
		}

		await fetch('/api/save', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(state)
		});
	}
}

type GameHour = 0 | 1 | 2 | 3 | 4 | 5

interface GameState {
	playerKilled: boolean,
	currentHour: GameHour,
	characterStates: CharacterState[]
}