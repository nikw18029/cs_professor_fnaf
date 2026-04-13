import { Room } from "./room.js"
import { Character } from "./character.js"
import { Logger } from "./logger.js"
import { bindUI } from "./ui-bridge.js"
import { initializeRoomRenderer } from "./room-renderer.js"
import { Observable } from "./observable.js"

import config from "./config.js"

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

	constructor() {
		this.onPlayerKilled = new Observable();

		// Build Map
		const backEntry = new Room("back entry", 1)
			.setPosition(50, 20);
		const classroomA = new Room("class a", 1)
			.setPosition(20, 80);
		const wingB = new Room("wing b", 1)
			.setPosition(15, 50);
		const stage = new Room("stage", 1)
			.setPosition(50, 50);

		classroomA.connectNeighbors([backEntry, stage, wingB]);
		wingB.connectNeighbors([classroomA, stage]);
		stage.connectNeighbors([backEntry, classroomA, wingB]);

		// Second floor rooms
		const offices = new Room("offices", 2)
			.setPosition(50, 20);
		const upperHall = new Room("upper hall", 2)
			.setPosition(50, 50);
		const upperStairs = new Room("upper stairs", 2)
			.setPosition(70, 80);
		this.playerRoom = new Room("window", 2, true)
			.setPosition(30, 50);
		upperStairs.connectNeighbors([upperHall, this.playerRoom]);
		upperHall.connectNeighbors([offices, this.playerRoom]);

		this.rooms = new Set([backEntry, classroomA, wingB, stage,
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
		bindUI(this.rooms, this.onTimerUpdate, this.onHideToggled, this.onHideStateChanged, this.onPlayerKilled);

		// characters and attack observers
		let sandro = new Character("sandro", backEntry, [classroomA, wingB, this.playerRoom]);
		let ohl = new Character("ohl", backEntry, [stage, this.playerRoom]);
		let bilitski = new Character("bilitski", backEntry, [classroomA, this.playerRoom]);
		this.characters = new Set([sandro, ohl, bilitski]);

		for (const c of this.characters) {
			c.onAttack.subscribe((attacker) => {
				this.handleAttack(attacker);
			});
		}

		initializeRoomRenderer(this.playerRoom, this.characters);
	}

	/**
	 * Starts up each character, runs a timer.
	 */
	public async runGame() {
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
					runHour(hour + 1, interval);
				}
			}, interval);
		};

		runHour(1, hourInterval);
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
		}
	}
}