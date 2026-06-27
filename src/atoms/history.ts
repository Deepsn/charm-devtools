import { atom } from "@rbxts/charm";
import type { Action } from "atoms";

export const history = atom<Action[]>([]);

export function getSortedHistory() {
	return history().sort((a, b) => b.timestamp < a.timestamp);
}

export function addToHistory(action: Action) {
	history((prev) => [...prev, action]);
}
