import { atom } from "@rbxts/charm";
import type { DependentsUpdate } from "@rbxts/charm-devtools";

export const dependents = atom<ReadonlyMap<string, DependentsUpdate>>(new Map());

export function setDependents(update: DependentsUpdate) {
	dependents((current) => {
		const previous = current.get(update.atomId);
		if (previous !== undefined && previous.timestamp > update.timestamp) return current;

		const nextMap = new Map<string, DependentsUpdate>();
		for (const [atomId, entry] of current) nextMap.set(atomId, entry);
		nextMap.set(update.atomId, update);
		return nextMap;
	});
}

export function clearDependents() {
	dependents(new Map());
}
