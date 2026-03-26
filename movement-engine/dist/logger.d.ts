/** Logs to the browser console */
export declare class Logger {
    private static minLvl;
    static setMinlevel(minLevel: "crit" | "warn" | "info" | "debug" | "trace"): void;
    /**
     * Super important, must know information.
     * @param msg the message to be logged.
     */
    static critical(msg: string): void;
    /**
     * Not crash worthy, but could cause issues if the code can't hold it together.
     * @param msg the message to be logged.
     */
    static warn(msg: string): void;
    /**
     * General information, the "big picture" things that regularly happen during execution.
     * @param msg the message to be logged.
     */
    static info(msg: string): void;
    /**
     * Things that muddy up the logs, but can make a real difference when trying to debug.
     * @param msg the message to be logged.
     */
    static debug(msg: string): void;
    /**
     * Everything and anything that can be logged about the application.
     * @param msg the message to be logged.
     */
    static trace(msg: string): void;
}
//# sourceMappingURL=logger.d.ts.map