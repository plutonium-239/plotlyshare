declare type LogLevel = "debug" | "info" | "warning" | "error";
declare class Logger {
    private enabled;
    constructor(enabled: boolean);
    log(message: string, level: LogLevel): void;
    setEnabled(value: boolean): void;
}
export declare const logger: Logger;
export {};
