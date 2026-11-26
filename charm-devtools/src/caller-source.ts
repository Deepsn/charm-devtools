import { logger } from "logger";
import type { SourceLocation } from "protocol";

const MAX_STACK_DEPTH = 100;
const PACKAGE_SOURCE = script.Parent?.GetFullName() ?? "";

function isPackageSource(source: string) {
	return source === PACKAGE_SOURCE || source.sub(1, PACKAGE_SOURCE.size() + 1) === `${PACKAGE_SOURCE}.`;
}

export function getCallerSource(): SourceLocation | undefined {
	for (let level = 1; level <= MAX_STACK_DEPTH; level++) {
		const [source, line] = debug.info(level, "sl");
		if (source === undefined) return undefined;
		if (source !== "[C]" && !isPackageSource(source)) return { script: source, line };
	}

	logger.warn(`getCallerSource() exceeded ${MAX_STACK_DEPTH} stack frames, returning undefined`);
	return undefined;
}

export function formatSource(source: SourceLocation | undefined): string {
	return source !== undefined ? `${source.script}:${source.line}` : "unknown";
}
