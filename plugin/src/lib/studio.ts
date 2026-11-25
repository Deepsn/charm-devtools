/// <reference types="@rbxts/types/plugin" />

import type { SourceLocation } from "@rbxts/charm-devtools";
import { logger } from "lib/logger";

let currentPlugin: Plugin | undefined;

export function setPlugin(value: Plugin) {
	currentPlugin = value;
}

const PLAYER_CONTAINERS: Record<string, string> = {
	PlayerScripts: "StarterPlayer.StarterPlayerScripts",
	PlayerGui: "StarterGui",
	Backpack: "StarterPack",
};

function findByFullName(parent: Instance, segments: string[], start: number): Instance | undefined {
	if (start >= segments.size()) return parent;

	for (let finish = segments.size(); finish > start; finish--) {
		const parts: string[] = [];
		for (let index = start; index < finish; index++) parts.push(segments[index]);

		const child = parent.FindFirstChild(parts.join("."));
		if (child === undefined) continue;

		const found = findByFullName(child, segments, finish);
		if (found !== undefined) return found;
	}

	return undefined;
}

function asScript(instance: Instance | undefined) {
	return instance?.IsA("LuaSourceContainer") ? instance : undefined;
}

function toEditPath(path: string): string | undefined {
	const [container, rest] = path.match("^Players%.[^%.]+%.([^%.]+)%.?(.*)$") as LuaTuple<[string?, string?]>;
	const target = container !== undefined ? PLAYER_CONTAINERS[container] : undefined;
	if (target === undefined) return undefined;

	return rest !== undefined && rest !== "" ? `${target}.${rest}` : target;
}

export function resolveScript(path: string): LuaSourceContainer | undefined {
	const found = asScript(findByFullName(game, path.split("."), 0));
	if (found !== undefined) return found;

	const editPath = toEditPath(path);
	return editPath !== undefined ? asScript(findByFullName(game, editPath.split("."), 0)) : undefined;
}

export function openSource(source: SourceLocation): boolean {
	const target = resolveScript(source.script);

	if (target === undefined || currentPlugin === undefined) {
		logger.error(`could not find script "${source.script}" in this DataModel`);
		return false;
	}

	currentPlugin.OpenScript(target, source.line);
	return true;
}

export function sourceLabel(source: SourceLocation): string {
	const segments = source.script.split(".");
	return `${segments[segments.size() - 1]}:${source.line}`;
}
