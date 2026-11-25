import { LogService } from "@rbxts/services";

export enum LogLevel {
	None = -1,
	Debug = 0,
	Info = 1,
	Warn = 2,
	Error = 3,
	Fatal = 4,
}

export class Logger {
	private minLevel = LogLevel.Info;

	constructor(private prefix = "[charm-devtools]") {}

	public extend(prefix: string): Logger {
		return new Logger(`${this.prefix} ${prefix}`);
	}

	public setLevel(level: LogLevel): void {
		this.minLevel = level;
	}

	public debug(message: string, ...args: defined[]): void {
		if (this.minLevel <= LogLevel.Debug) return;
		LogService.Output(`${this.prefix} ${message}`, ...args);
	}

	public log(message: string, ...args: defined[]): void {
		if (this.minLevel <= LogLevel.Info) return;
		LogService.Output(`${this.prefix} ${message}`, ...args);
	}

	public warn(message: string, ...args: defined[]): void {
		if (this.minLevel <= LogLevel.Warn) return;
		LogService.Warn(`${this.prefix} ${message}`, ...args);
	}

	public error(message: string, ...args: defined[]): void {
		if (this.minLevel <= LogLevel.Error) return;
		this.warn(`ERROR: ${message}`, ...args);
	}

	public fatal(message: string, ...args: defined[]): void {
		if (this.minLevel <= LogLevel.Fatal) return;
		LogService.Error(`${this.prefix} ${message}`, ...args);
	}
}

export const logger = new Logger();
